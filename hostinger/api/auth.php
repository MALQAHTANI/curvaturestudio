<?php
// Employee authentication: login, signup (bootstrap), me, logout.
declare(strict_types=1);
require __DIR__ . '/lib.php';
cors();

$action = $_GET['action'] ?? '';
$in = body();

if ($action === 'login') {
  $email = strtolower(trim((string) ($in['email'] ?? '')));
  $password = (string) ($in['password'] ?? '');
  if ($email === '' || $password === '') fail('Email and password are required');

  $stmt = db()->prepare('SELECT id, email, password_hash FROM users WHERE email = ? LIMIT 1');
  $stmt->execute([$email]);
  $user = $stmt->fetch();
  if (!$user || !password_verify($password, $user['password_hash'])) {
    usleep(300000);
    fail('Invalid login credentials', 401);
  }
  $r = db()->prepare("SELECT 1 FROM user_roles WHERE user_id = ? AND role = 'employee' LIMIT 1");
  $r->execute([$user['id']]);
  out([
    'token' => jwt_sign(['sub' => $user['id'], 'email' => $user['email']]),
    'user' => ['id' => $user['id'], 'email' => $user['email'], 'is_employee' => (bool) $r->fetchColumn()],
  ]);
}

if ($action === 'signup') {
  $email = strtolower(trim((string) ($in['email'] ?? '')));
  $password = (string) ($in['password'] ?? '');
  if (!filter_var($email, FILTER_VALIDATE_EMAIL)) fail('Invalid email address');
  if (strlen($password) < 8) fail('Password must be at least 8 characters');

  $hasUsers = (bool) db()->query('SELECT 1 FROM users LIMIT 1')->fetchColumn();
  $allow = filter_var((string) cfg('ALLOW_SIGNUP', false), FILTER_VALIDATE_BOOLEAN);
  // The very first account may always be created; after that signup must be
  // explicitly enabled in config.local.php.
  if ($hasUsers && !$allow) fail('Signup is disabled. Ask an administrator for an account.', 403);

  $exists = db()->prepare('SELECT 1 FROM users WHERE email = ? LIMIT 1');
  $exists->execute([$email]);
  if ($exists->fetchColumn()) fail('An account with this email already exists', 409);

  $id = uuid();
  db()->prepare('INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)')
      ->execute([$id, $email, password_hash($password, PASSWORD_BCRYPT)]);
  // First account becomes the employee automatically.
  if (!$hasUsers) {
    db()->prepare('INSERT INTO user_roles (id, user_id, role) VALUES (?, ?, ' . "'employee')")
        ->execute([uuid(), $id]);
  }
  out(['ok' => true]);
}

if ($action === 'me') {
  $user = current_user();
  if (!$user) out(['user' => null]);
  out(['user' => ['id' => $user['id'], 'email' => $user['email'], 'is_employee' => $user['is_employee']]]);
}

if ($action === 'change-password') {
  $user = require_employee();
  $current = (string) ($in['current_password'] ?? '');
  $next = (string) ($in['new_password'] ?? '');
  if (strlen($next) < 8) fail('New password must be at least 8 characters');
  $stmt = db()->prepare('SELECT password_hash FROM users WHERE id = ?');
  $stmt->execute([$user['id']]);
  if (!password_verify($current, (string) $stmt->fetchColumn())) fail('Current password is incorrect', 401);
  db()->prepare('UPDATE users SET password_hash = ? WHERE id = ?')
      ->execute([password_hash($next, PASSWORD_BCRYPT), $user['id']]);
  out(['ok' => true]);
}

// Tokens are stateless; the client simply discards it.
if ($action === 'logout') out(['ok' => true]);

fail('Unknown action', 404);
