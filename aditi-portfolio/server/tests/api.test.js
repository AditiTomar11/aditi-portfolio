import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../app.js';

let server, base;
const original = {
  uri: process.env.MONGODB_URI,
  password: process.env.ADMIN_PASSWORD,
  secret: process.env.JWT_SECRET,
};
before(async () => {
  delete process.env.MONGODB_URI;
  delete process.env.ADMIN_PASSWORD;
  delete process.env.JWT_SECRET;
  server = createApp().listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}/api`;
});
after(async () => {
  await new Promise((resolve) => server.close(resolve));
  for (const [key, value] of [
    ['MONGODB_URI', original.uri],
    ['ADMIN_PASSWORD', original.password],
    ['JWT_SECRET', original.secret],
  ]) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});
async function request(url, options = {}) {
  const response = await fetch(base + url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  return { status: response.status, body: await response.json() };
}

test('health explicitly reports demo mode without MongoDB', async () => {
  const result = await request('/health');
  assert.equal(result.status, 200);
  assert.equal(result.body.database, 'demo');
});
test('public project list returns original seeds in order', async () => {
  const result = await request('/projects');
  assert.equal(result.body.source, 'demo');
  assert.equal(result.body.projects.length, 5);
  assert.equal(result.body.projects[0].slug, 'employeems');
});
test('project filtering and detail lookup work', async () => {
  assert.equal((await request('/projects?category=backend')).body.projects.length, 2);
  assert.equal((await request('/projects?featured=true')).body.projects.length, 3);
  assert.equal((await request('/projects/shopease')).body.project.title, 'ShopEase');
  assert.equal((await request('/projects/does-not-exist')).status, 404);
});
test('contact never claims delivery without a database', async () => {
  const result = await request('/contact', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Visitor',
      email: 'hello@example.com',
      message: 'Hello from the portfolio.',
    }),
  });
  assert.equal(result.status, 503);
  assert.match(result.body.error, /MongoDB/);
});
test('admin stays disabled with no configured credentials', async () => {
  const result = await request('/admin/login', {
    method: 'POST',
    body: JSON.stringify({ password: 'anything' }),
  });
  assert.equal(result.status, 503);
});
test('unknown endpoints and malformed JSON produce safe errors', async () => {
  assert.equal((await request('/not-real')).status, 404);
  assert.equal((await request('/contact', { method: 'POST', body: '{bad json' })).status, 400);
});
test('untrusted cross-origin requests are rejected', async () => {
  assert.equal(
    (await request('/projects', { headers: { Origin: 'https://untrusted.example' } })).status,
    403,
  );
});
test('admin JWT is required and database writes remain guarded', async () => {
  process.env.ADMIN_PASSWORD = 'an-example-private-password';
  process.env.JWT_SECRET = 'this-is-a-test-secret-with-at-least-32-characters';
  assert.equal((await request('/admin/projects', { method: 'POST', body: '{}' })).status, 401);
  assert.equal(
    (await request('/admin/login', { method: 'POST', body: JSON.stringify({ password: 'wrong' }) }))
      .status,
    401,
  );
  const result = await request('/admin/login', {
    method: 'POST',
    body: JSON.stringify({ password: process.env.ADMIN_PASSWORD }),
  });
  assert.equal(result.status, 200);
  assert.equal(
    (await request('/admin/me', { headers: { Authorization: `Bearer ${result.body.token}` } })).body
      .role,
    'admin',
  );
  assert.equal(
    (
      await request('/admin/projects', {
        method: 'POST',
        headers: { Authorization: `Bearer ${result.body.token}` },
        body: '{}',
      })
    ).status,
    503,
  );
});
