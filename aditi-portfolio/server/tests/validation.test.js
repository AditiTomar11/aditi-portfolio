import test from 'node:test';
import assert from 'node:assert/strict';
import { projectInput, contactInput } from '../lib/validation.js';
import { projects } from '../../shared/projects.js';
import { passwordMatches, adminEnabled } from '../lib/auth.js';

test('all five original seeds pass validation', () => {
  for (const project of projects) assert.equal(projectInput.parse(project).slug, project.slug);
});
test('URL validation blocks javascript and data schemes', () => {
  for (const liveUrl of ['javascript:alert(1)', 'data:text/html,bad'])
    assert.equal(projectInput.safeParse({ ...projects[0], liveUrl }).success, false);
});
test('contact input trims fields and rejects honeypot submissions', () => {
  const data = {
    name: '  Aditi  ',
    email: 'hello@example.com',
    message: 'Hello, I would like to talk about a role.',
  };
  assert.equal(contactInput.parse(data).name, 'Aditi');
  assert.equal(contactInput.safeParse({ ...data, website: 'spam' }).success, false);
});
test('invalid project categories and slugs are rejected', () => {
  assert.equal(projectInput.safeParse({ ...projects[0], slug: '$bad' }).success, false);
  assert.equal(projectInput.safeParse({ ...projects[0], category: 'hacked' }).success, false);
});
test('admin stays off unless credentials meet minimum length', () => {
  const pass = process.env.ADMIN_PASSWORD,
    secret = process.env.JWT_SECRET;
  process.env.ADMIN_PASSWORD = 'short';
  process.env.JWT_SECRET = 'short';
  assert.equal(adminEnabled(), false);
  assert.equal(passwordMatches('short'), false);
  if (pass === undefined) delete process.env.ADMIN_PASSWORD;
  else process.env.ADMIN_PASSWORD = pass;
  if (secret === undefined) delete process.env.JWT_SECRET;
  else process.env.JWT_SECRET = secret;
});
