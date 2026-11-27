<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
header('Vary: Origin');
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && !in_array($origin, ['https://probiyom.com', 'https://www.probiyom.com', 'null'], true)) {
    http_response_code(403); exit;
}
if ($origin !== '') header('Access-Control-Allow-Origin: ' . $origin);
header('Access-Control-Allow-Headers: Content-Type, X-Api-Key');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') { http_response_code(204); exit; }
function out(array $data, int $status = 200): void {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
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
$key = $_SERVER['HTTP_X_API_KEY'] ?? '';
if (!is_string($key) || strlen($key) < 32 || !hash_equals($hash, hash('sha256', $key))) out(['ok'=>false, 'error'=>'Erişim anahtarı hatalı veya eksik.'], 401);
$method = $_SERVER['REQUEST_METHOD'] ?? '';
$action = $_GET['action'] ?? '';
if (!is_string($action)) out(['ok'=>false, 'error'=>'Geçersiz işlem.'], 400);
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
$raw = file_get_contents('php://input', false, null, 0, 1048577);
if ($raw === false || strlen($raw) > 1048576) out(['ok'=>false, 'error'=>'İstek çok büyük veya okunamadı.'], 413);
$body = json_decode($raw, true);
if (!is_array($body) || !valid_id($body['id'] ?? null) || !isset($body['data']) || !is_array($body['data'])) out(['ok'=>false, 'error'=>'Geçersiz kayıt.'], 400);
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
