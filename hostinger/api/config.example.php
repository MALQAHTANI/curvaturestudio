<?php
// -------------------------------------------------------------------
// Copy this file to config.local.php on the server and fill the values.
// config.local.php is blocked from HTTP access by api/.htaccess and must
// NEVER be committed or exposed to the frontend.
// -------------------------------------------------------------------
return [
  // MySQL (hPanel → Databases → MySQL Databases)
  'DB_HOST'     => 'localhost',
  'DB_NAME'     => 'uXXXXXX_curvature',
  'DB_USER'     => 'uXXXXXX_curvature',
  'DB_PASS'     => 'your-mysql-password',
  'DB_PORT'     => '3306',

  // Random 64-char secret used to sign login tokens.
  // Generate with: php -r "echo bin2hex(random_bytes(32));"
  'JWT_SECRET'  => 'replace-with-a-long-random-string',

  // Absolute path of the uploads folder and the public URL that serves it.
  'UPLOAD_DIR'  => dirname(__DIR__) . '/uploads',
  'UPLOAD_URL'  => '/uploads',

  // Max upload size in bytes (50 MB) — keep in sync with php.ini limits.
  'MAX_UPLOAD'  => 52428800,

  // Allowed browser origin. Use '' when the API lives on the same domain
  // as the site (recommended). Example for a split setup:
  // 'https://curvaturestudio.com'
  'CORS_ORIGIN' => '',

  // Set to true only for the very first signup, then back to false.
  'ALLOW_SIGNUP' => false,
];
