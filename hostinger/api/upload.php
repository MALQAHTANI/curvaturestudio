<?php
// Employee-only media upload. Stores the file under /uploads and returns its URL.
declare(strict_types=1);
require __DIR__ . '/lib.php';
cors();
require_employee();

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') fail('Method not allowed', 405);
if (!isset($_FILES['file'])) fail('No file received');

$file = $_FILES['file'];
if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) fail('Upload failed (code ' . $file['error'] . ')');

$max = (int) cfg('MAX_UPLOAD', 52428800);
if (($file['size'] ?? 0) > $max) fail('File is too large. Maximum is ' . round($max / 1048576) . ' MB', 413);

$imageExt = ['jpg','jpeg','png','webp','gif','avif','svg','heic','heif','bmp','tiff'];
$videoExt = ['mp4','mov','webm','mkv','avi','m4v','ogv','3gp'];
$ext = strtolower(pathinfo((string) $file['name'], PATHINFO_EXTENSION));
if (!in_array($ext, array_merge($imageExt, $videoExt), true)) {
  fail('Unsupported file format. Only images and videos are accepted.');
}

$dir = (string) cfg('UPLOAD_DIR', dirname(__DIR__) . '/uploads');
if (!is_dir($dir) && !@mkdir($dir, 0755, true)) fail('Uploads folder is not writable', 500);

$name = uuid() . '.' . $ext;
if (!move_uploaded_file($file['tmp_name'], rtrim($dir, '/') . '/' . $name)) {
  fail('Could not store the file', 500);
}

$base = rtrim((string) cfg('UPLOAD_URL', '/uploads'), '/');
out(['url' => $base . '/' . $name, 'path' => $name]);
