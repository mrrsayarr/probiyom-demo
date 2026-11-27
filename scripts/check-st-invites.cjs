const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { randomBytes, createHash } = require('node:crypto');
const { once } = require('node:events');
const fs = require('node:fs/promises');
const net = require('node:net');
const os = require('node:os');
const path = require('node:path');

async function main() {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'probiyom-invites-'));
  const web = path.join(temp, 'httpdocs');
  const privateDir = path.join(temp, 'private', 'probiyom-st');
  const key = randomBytes(32).toString('hex');
  let php;
  let stopped;
  try {
    await fs.mkdir(path.join(web, 'st'), { recursive: true });
    const data = path.join(privateDir, 'data');
    await fs.mkdir(data, { recursive: true });
    await fs.copyFile(path.join(__dirname, '../st/api.php'), path.join(web, 'st/api.php'));
    await fs.writeFile(path.join(privateDir, 'config.json'), JSON.stringify({ key_sha256: createHash('sha256').update(key).digest('hex') }));
    await fs.writeFile(path.join(data, 'existing.json'), JSON.stringify({ id: 'existing', data: { teklifNo: 'TEST-1' } }));
    const listener = net.createServer().listen(0, '127.0.0.1');
    await once(listener, 'listening');
    const port = listener.address().port;
    await new Promise(resolve => listener.close(resolve));
    php = spawn(process.env.PROBIYOM_TEST_PHP || 'php', ['-S', `127.0.0.1:${port}`, '-t', web], { stdio: 'ignore', windowsHide: true });
    stopped = once(php, 'close');
    stopped.catch(() => {});
    const endpoint = `http://127.0.0.1:${port}/st/api.php?action=`;
    const origin = 'https://www.probiyom.com';
    async function request(action, status, { body, headers = {} } = {}) {
      const response = await fetch(endpoint + action, {
        method: body ? 'POST' : 'GET',
        headers: { ...(body && { Origin: origin, 'Content-Type': 'application/json' }), ...headers },
        body: body && JSON.stringify(body),
      });
      assert.equal(response.status, status, action);
      return response;
    }
    for (let attempt = 0; ; attempt++) {
      try { await fetch(endpoint + 'ping'); break; }
      catch (error) { if (attempt === 30) throw error; await new Promise(resolve => setTimeout(resolve, 100)); }
    }
    const admin = { 'X-Api-Key': key };
    await request('invite', 401, { body: { label: 'Test' } });
    const issued = await (await request('invite', 200, { body: { label: 'Test' }, headers: admin })).json();
    await request('list', 401);
    await request('list', 401, { headers: admin });
    await request('redeem', 403, { body: { token: issued.token }, headers: { Origin: 'null' } });
    const redeem = () => fetch(endpoint + 'redeem', {
      method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ token: issued.token }),
    });
    const attempts = await Promise.all([redeem(), redeem()]);
    assert.deepEqual(attempts.map(res => res.status).sort(), [200, 410]);
    const cookie = attempts.find(res => res.ok).headers.get('set-cookie');
    assert.match(cookie, /^__Host-probiyom_st=/);
    for (const flag of ['secure', 'httponly', 'samesite=strict', 'path=/']) assert.ok(cookie.toLowerCase().includes(flag), flag);
    const headers = { Cookie: cookie.split(';')[0] };
    const list = await (await request('list', 200, { headers })).json();
    assert.equal(list.records[0].data.teklifNo, 'TEST-1');
    await request('save', 403, { headers: { ...headers, Origin: 'https://example.invalid' }, body: { id: 'new', data: {} } });
    await request('save', 200, { headers, body: { id: 'new', data: { teklifNo: 'TEST-2' } } });
    await request('devices', 401, { headers });
    const { devices } = await (await request('devices', 200, { headers: admin })).json();
    assert.equal(devices[0].label, 'Test');
    await request('revoke', 200, { headers: admin, body: { id: devices[0].id } });
    await request('list', 401, { headers });
    console.log('PASS: invitation, single redemption, cookie security, shared archive and revocation.');
  } finally {
    if (php && php.exitCode === null) php.kill();
    if (stopped) await stopped.catch(() => {});
    await fs.rm(temp, { recursive: true });
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
