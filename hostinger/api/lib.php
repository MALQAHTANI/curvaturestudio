<?php
// Shared helpers: config, database, JWT auth, access policy.
declare(strict_types=1);

function cfg(string $key, $default = null) {
  static $conf = null;
  if ($conf === null) {
    $conf = [];
    $local = __DIR__ . '/config.local.php';
    if (is_file($local)) {
      $loaded = require $local;
      if (is_array($loaded)) $conf = $loaded;
    }
  }
  // Environment variables win over the file, so Hostinger env vars work too.
  $env = getenv($key);
  if ($env !== false && $env !== '') return $env;
  return array_key_exists($key, $conf) ? $conf[$key] : $default;
}

function db(): PDO {
  static $pdo = null;
  if ($pdo === null) {
    $dsn = sprintf(
      'mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4',
      cfg('DB_HOST', 'localhost'),
      cfg('DB_PORT', '3306'),
      cfg('DB_NAME', '')
    );
    try {
      $pdo = new PDO($dsn, (string) cfg('DB_USER', ''), (string) cfg('DB_PASS', ''), [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
      ]);
    } catch (Throwable $e) {
      error_log('[db] ' . $e->getMessage());
      fail('Database connection failed', 500);
    }
  }
  return $pdo;
}

function cors(): void {
  $origin = (string) cfg('CORS_ORIGIN', '');
  if ($origin !== '') {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
  }
  header('Access-Control-Allow-Headers: Content-Type, Authorization');
  header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
  if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
  }
}

function out($data, int $status = 200): void {
  http_response_code($status);
  header('Content-Type: application/json; charset=utf-8');
  header('Cache-Control: no-store');
  echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  exit;
}

function fail(string $message, int $status = 400): void {
  out(['error' => ['message' => $message]], $status);
}

function body(): array {
  $raw = file_get_contents('php://input') ?: '';
  $json = json_decode($raw, true);
  return is_array($json) ? $json : [];
}

function uuid(): string {
  $b = random_bytes(16);
  $b[6] = chr((ord($b[6]) & 0x0f) | 0x40);
  $b[8] = chr((ord($b[8]) & 0x3f) | 0x80);
  return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($b), 4));
}

// ---------------------------------------------------------------- JWT (HS256)
function b64u(string $s): string { return rtrim(strtr(base64_encode($s), '+/', '-_'), '='); }
function b64u_dec(string $s): string {
  return base64_decode(strtr($s, '-_', '+/') . str_repeat('=', (4 - strlen($s) % 4) % 4)) ?: '';
}

function jwt_sign(array $claims, int $ttlSeconds = 60 * 60 * 24 * 7): string {
  $secret = (string) cfg('JWT_SECRET', '');
  if (strlen($secret) < 16) fail('Server auth secret is not configured', 500);
  $now = time();
  $payload = array_merge($claims, ['iat' => $now, 'exp' => $now + $ttlSeconds]);
  $head = b64u(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
  $body = b64u(json_encode($payload));
  $sig  = b64u(hash_hmac('sha256', "$head.$body", $secret, true));
  return "$head.$body.$sig";
}

function jwt_verify(string $token): ?array {
  $secret = (string) cfg('JWT_SECRET', '');
  $parts = explode('.', $token);
  if (count($parts) !== 3 || strlen($secret) < 16) return null;
  [$head, $body, $sig] = $parts;
  $expected = b64u(hash_hmac('sha256', "$head.$body", $secret, true));
  if (!hash_equals($expected, $sig)) return null;
  $claims = json_decode(b64u_dec($body), true);
  if (!is_array($claims) || ($claims['exp'] ?? 0) < time()) return null;
  return $claims;
}

/** Current signed-in user or null. */
function current_user(): ?array {
  $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
  if ($header === '' && function_exists('apache_request_headers')) {
    $all = apache_request_headers();
    foreach ($all as $k => $v) if (strcasecmp($k, 'Authorization') === 0) $header = $v;
  }
  if (stripos($header, 'Bearer ') !== 0) return null;
  $claims = jwt_verify(trim(substr($header, 7)));
  if (!$claims || empty($claims['sub'])) return null;
  $stmt = db()->prepare('SELECT id, email FROM users WHERE id = ? LIMIT 1');
  $stmt->execute([$claims['sub']]);
  $user = $stmt->fetch();
  if (!$user) return null;
  $r = db()->prepare("SELECT 1 FROM user_roles WHERE user_id = ? AND role = 'employee' LIMIT 1");
  $r->execute([$user['id']]);
  $user['is_employee'] = (bool) $r->fetchColumn();
  return $user;
}

function require_employee(): array {
  $user = current_user();
  if (!$user) fail('Unauthorized', 401);
  if (!$user['is_employee']) fail('Forbidden', 403);
  return $user;
}

// ------------------------------------------------------------------- Policy
// Whitelisted tables. Nothing outside this map is reachable through the API.
//   public_read      : anyone may read
//   force_published  : anonymous reads are limited to published rows
//   public_insert    : anyone may create a row (validated below)
//   json_cols        : stored as JSON, returned as arrays
function policy(): array {
  return [
    'projects' => [
      'cols' => ['id','title','description','category','client','year','cover_image','media_urls','services','tools','published','sort_order','created_at','updated_at'],
      'json_cols' => ['media_urls','services','tools'],
      'public_read' => true, 'force_published' => true,
    ],
    'studio_items' => [
      'cols' => ['id','title','description','cover_image','media_urls','published','sort_order','created_at','updated_at'],
      'json_cols' => ['media_urls'],
      'public_read' => true, 'force_published' => true,
    ],
    'clients' => [
      'cols' => ['id','name','logo_url','website','sort_order','published','created_at','updated_at'],
      'json_cols' => [],
      'public_read' => true, 'force_published' => true,
    ],
    'events' => [
      'cols' => ['id','name','description','event_date','cover_image','sort_order','published','created_at','updated_at'],
      'json_cols' => [],
      'public_read' => true, 'force_published' => true,
    ],
    'site_media' => [
      'cols' => ['id','slot','label','media_url','created_at','updated_at'],
      'json_cols' => [],
      'public_read' => true, 'force_published' => false,
    ],
    'contact_messages' => [
      'cols' => ['id','name','email','company','message','read','created_at'],
      'json_cols' => [],
      'public_read' => false, 'public_insert' => true,
    ],
    'event_registrations' => [
      'cols' => ['id','event_id','event_name','name','email','phone','note','read','created_at'],
      'json_cols' => [],
      'public_read' => false, 'public_insert' => true,
    ],
    'user_roles' => [
      'cols' => ['id','user_id','role','created_at'],
      'json_cols' => [],
      'public_read' => false,
    ],
  ];
}

function q(string $ident): string { return '`' . str_replace('`', '', $ident) . '`'; }
