<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
const ST_ORIGIN = 'https://www.probiyom.com';
const DEVICE_COOKIE = '__Host-probiyom_st';
const DEVICE_LIFETIME = 180 * 86400;
function out(array $data, int $status = 200): void {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}
function fail(string $message, int $status): void {
    out(['ok'=>false, 'error'=>$message], $status);
}
$method = $_SERVER['REQUEST_METHOD'] ?? '';
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (($origin !== '' && $origin !== ST_ORIGIN) || ($method === 'POST' && $origin !== ST_ORIGIN)) {
    fail('Bu adresten erişime izin verilmiyor.', 403);
}
function request_body(): array {
    $raw = file_get_contents('php://input', false, null, 0, 1048577);
    if ($raw === false || strlen($raw) > 1048576) fail('İstek çok büyük veya okunamadı.', 413);
    $body = json_decode($raw, true);
    if (!is_array($body)) fail('Geçersiz istek.', 400);
    return $body;
}
// A separate lock spans read, mutation and atomic replacement, including invite redemption.
function access_state(string $dir, callable $operation, bool $write = false): mixed {
    $path = $dir . '/.device-access';
    $lock = @fopen($path . '.lock', 'c');
    if ($lock === false || !flock($lock, $write ? LOCK_EX : LOCK_SH)) fail('Erişim kayıtları kullanılamıyor.', 503);
    try {
        $state = [];
        if (file_exists($path)) {
            $state = json_decode((string) @file_get_contents($path), true);
            if (!is_array($state)) fail('Erişim kayıtları okunamadı.', 503);
        }
        $result = $operation($state);
        if ($write) {
            $raw = json_encode($state, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
            $temp = @tempnam($dir, '.device-');
            if ($temp === false || @file_put_contents($temp, $raw) !== strlen($raw) || !@rename($temp, $path)) {
                if ($temp !== false) @unlink($temp);
                fail('Erişim kayıtları yazılamadı.', 503);
            }
        }
        return $result;
    } finally {
        flock($lock, LOCK_UN);
        fclose($lock);
    }
}
// The private directory is a sibling of httpdocs, never part of the deployed tree.
$private = realpath(dirname(__DIR__, 2) . '/private/probiyom-st');
$webroot = realpath(dirname(__DIR__));
if ($private !== false) $private = str_replace('\\', '/', $private);
if ($webroot !== false) $webroot = str_replace('\\', '/', $webroot);
if ($private === false || $webroot === false || str_starts_with($private . '/', $webroot . '/')) {
    out(['ok'=>false, 'error'=>'Sunucu yapılandırması eksik.'], 503);
}
$configPath = realpath($private . '/config.json');
$dataDir = realpath($private . '/data');
if ($configPath !== false) $configPath = str_replace('\\', '/', $configPath);
if ($dataDir !== false) $dataDir = str_replace('\\', '/', $dataDir);
if ($configPath === false || $dataDir === false || !str_starts_with($configPath, $private . '/') || !str_starts_with($dataDir . '/', $private . '/') || !is_writable($dataDir)) {
    out(['ok'=>false, 'error'=>'Sunucu yapılandırması eksik.'], 503);
}
$config = json_decode((string) @file_get_contents($configPath), true);
$hash = is_array($config) ? ($config['key_sha256'] ?? '') : '';
if (!is_string($hash) || !preg_match('/^[a-f0-9]{64}$/D', $hash)) out(['ok'=>false, 'error'=>'Sunucu yapılandırması eksik.'], 503);
$action = $_GET['action'] ?? '';
if (!is_string($action)) out(['ok'=>false, 'error'=>'Geçersiz işlem.'], 400);
if (in_array($action, ['devices', 'invite', 'revoke'], true)) {
    $key = $_SERVER['HTTP_X_API_KEY'] ?? '';
    if (strlen($key) < 32 || !hash_equals($hash, hash('sha256', $key))) fail('Yönetim anahtarı hatalı veya eksik.', 401);
    if ($method !== ($action === 'devices' ? 'GET' : 'POST')) fail('Geçersiz yöntem.', 405);
    if ($action === 'devices') {
        $devices = access_state($dataDir, function (array $state): array {
            $visible = [];
            foreach ($state as $id => $item) {
                if ($item['expires'] <= time()) continue;
                $visible[] = ['id'=>$id, 'label'=>$item['label'], 'active'=>$item['active'], 'expires'=>$item['expires']];
            }
            return $visible;
        });
        out(['ok'=>true, 'devices'=>$devices]);
    }
    $body = request_body();
    if ($action === 'revoke') {
        $id = $body['id'] ?? null;
        if (!is_string($id) || !preg_match('/^[a-f0-9]{32}$/D', $id)) fail('Geçersiz erişim kimliği.', 400);
        access_state($dataDir, function (array &$state) use ($id) { unset($state[$id]); }, true);
        out(['ok'=>true]);
    }
    $label = $body['label'] ?? null;
    if (!is_string($label) || trim($label) === '' || strlen($label) > 120) fail('Davet için kısa bir ad yazın.', 400);
    $token = bin2hex(random_bytes(32));
    access_state($dataDir, function (array &$state) use ($label, $token) {
        $state = array_filter($state, fn(array $item) => $item['expires'] > time());
        if (count($state) >= 200) fail('Davet sınırına ulaşıldı.', 409);
        $state[bin2hex(random_bytes(16))] = ['label'=>trim($label),'digest'=>hash('sha256',$token),'active'=>false,'expires'=>time()+86400];
    }, true);
    out(['ok'=>true, 'token'=>$token]);
}
if ($action === 'redeem') {
    if ($method !== 'POST') fail('Geçersiz yöntem.', 405);
    $token = request_body()['token'] ?? null;
    if (!is_string($token) || !preg_match('/^[a-f0-9]{64}$/D', $token)) fail('Geçersiz davet.', 400);
    $digest = hash('sha256', $token);
    $secret = bin2hex(random_bytes(32));
    $expires = time() + DEVICE_LIFETIME;
    $id = access_state($dataDir, function (array &$state) use ($digest, $secret, $expires): string {
        foreach ($state as $id => $item) {
            if (!$item['active'] && $item['expires'] > time() && hash_equals($item['digest'], $digest)) {
                $state[$id] = ['label'=>$item['label'],'digest'=>hash('sha256',$secret),'active'=>true,'expires'=>$expires];
                return $id;
            }
        }
        fail('Davet kullanılmış, iptal edilmiş veya süresi dolmuş.', 410);
    }, true);
    setcookie(DEVICE_COOKIE, $id . '.' . $secret, ['expires'=>$expires,'path'=>'/','secure'=>true,'httponly'=>true,'samesite'=>'Strict']);
    out(['ok'=>true]);
}
$cookie = $_COOKIE[DEVICE_COOKIE] ?? '';
if (!is_string($cookie) || !preg_match('/^([a-f0-9]{32})\.([a-f0-9]{64})$/D', $cookie, $parts)) fail('Ortak arşiv için bir ekip daveti gerekir.', 401);
$allowed = access_state($dataDir, function (array $state) use ($parts): bool {
    $item = $state[$parts[1]] ?? null;
    return $item !== null && $item['active'] && $item['expires'] > time() && hash_equals($item['digest'], hash('sha256', $parts[2]));
});
if (!$allowed) fail('Tarayıcı erişimi sona ermiş. Yeni bir ekip daveti isteyin.', 401);
if ($action === 'delete') out(['ok'=>false, 'error'=>'Ortak kayıtlarda silme kapalıdır.'], 403);
if (!in_array($action, ['ping','list','get','save'], true)) out(['ok'=>false, 'error'=>'Bilinmeyen işlem.'], 400);
if (($action === 'save' && $method !== 'POST') || ($action !== 'save' && $method !== 'GET')) out(['ok'=>false, 'error'=>'Geçersiz yöntem.'], 405);
function valid_id($id): bool { return is_string($id) && preg_match('/^[A-Za-z0-9_-]{1,100}$/D', $id) === 1; }
function read_record(string $path): ?array {
    $data = json_decode((string) @file_get_contents($path), true);
    return is_array($data) && isset($data['id'], $data['data']) && valid_id($data['id']) && is_array($data['data']) ? $data : null;
}
if ($action === 'ping' || $action === 'list') {
    $files = glob($dataDir . '/*.json');
    if ($files === false) out(['ok'=>false, 'error'=>'Kayıtlar okunamadı.'], 500);
    if ($action === 'ping') out(['ok'=>true, 'count'=>count($files)]);
    $records = [];
    foreach ($files as $file) { $rec = read_record($file); if ($rec !== null) $records[] = $rec; }
    usort($records, fn($a, $b) => strcmp((string)($b['data']['savedAt'] ?? ''), (string)($a['data']['savedAt'] ?? '')));
    out(['ok'=>true, 'records'=>$records]);
}
if ($action === 'get') {
    $id = $_GET['id'] ?? '';
    if (!valid_id($id)) out(['ok'=>false, 'error'=>'Geçersiz kayıt kimliği.'], 400);
    $rec = read_record($dataDir . '/' . $id . '.json');
    if ($rec === null) out(['ok'=>false, 'error'=>'Kayıt bulunamadı.'], 404);
    out(['ok'=>true, 'record'=>$rec]);
}
$body = request_body();
if (!valid_id($body['id'] ?? null) || !isset($body['data']) || !is_array($body['data'])) out(['ok'=>false, 'error'=>'Geçersiz kayıt.'], 400);
$json = json_encode(['id'=>$body['id'], 'data'=>$body['data']], JSON_UNESCAPED_UNICODE);
if ($json === false) out(['ok'=>false, 'error'=>'Kayıt kodlanamadı.'], 400);
$lock = @fopen($dataDir . '/.write.lock', 'c');
if ($lock === false || !flock($lock, LOCK_EX)) out(['ok'=>false, 'error'=>'Kayıt kilitlenemedi.'], 500);
$path = $dataDir . '/' . $body['id'] . '.json';
if (($body['createOnly'] ?? false) === true && file_exists($path)) out(['ok'=>false, 'error'=>'Bu kimlikle ortak kayıt zaten var; aktarım yapılmadı.'], 409);
$tmp = tempnam($dataDir, '.record-');
if ($tmp === false || file_put_contents($tmp, $json, LOCK_EX) !== strlen($json) || !rename($tmp, $path)) {
    if ($tmp !== false) @unlink($tmp);
    out(['ok'=>false, 'error'=>'Kayıt yazılamadı.'], 500);
}
flock($lock, LOCK_UN); fclose($lock);
out(['ok'=>true]);
