<?php
// Generates (and caches) a downscaled version of an uploaded image.
// Used by the dashboard grid so large originals do not slow it down.
declare(strict_types=1);
require __DIR__ . '/lib.php';

$file = (string) ($_GET['f'] ?? '');
$width = (int) ($_GET['w'] ?? 480);
if ($file === '' || preg_match('/[^A-Za-z0-9._-]/', $file)) { http_response_code(404); exit('Not found'); }
$width = max(64, min(2000, $width));

$dir = rtrim((string) cfg('UPLOAD_DIR', dirname(__DIR__) . '/uploads'), '/');
$src = $dir . '/' . $file;
if (!is_file($src)) { http_response_code(404); exit('Not found'); }

$ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
$raster = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
$serveOriginal = !in_array($ext, $raster, true) || !function_exists('imagecreatetruecolor');

$cacheDir = $dir . '/.thumbs';
$cache = $cacheDir . '/' . $width . '-' . $file;

function send(string $path): void {
  $mime = ['jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg', 'png' => 'image/png', 'webp' => 'image/webp',
           'gif' => 'image/gif', 'svg' => 'image/svg+xml', 'avif' => 'image/avif'][strtolower(pathinfo($path, PATHINFO_EXTENSION))] ?? 'application/octet-stream';
  header('Content-Type: ' . $mime);
  header('Cache-Control: public, max-age=2592000');
  header('Content-Length: ' . (string) filesize($path));
  readfile($path);
  exit;
}

if ($serveOriginal) send($src);
if (is_file($cache) && filemtime($cache) >= filemtime($src)) send($cache);

$info = @getimagesize($src);
if (!$info) send($src);
[$w, $h] = $info;
if ($w <= $width) send($src);

$image = match ($ext) {
  'jpg', 'jpeg' => @imagecreatefromjpeg($src),
  'png'         => @imagecreatefrompng($src),
  'webp'        => function_exists('imagecreatefromwebp') ? @imagecreatefromwebp($src) : null,
  'gif'         => @imagecreatefromgif($src),
  default       => null,
};
if (!$image) send($src);

$newH = (int) round($h * ($width / $w));
$thumb = imagecreatetruecolor($width, $newH);
imagealphablending($thumb, false);
imagesavealpha($thumb, true);
imagecopyresampled($thumb, $image, 0, 0, 0, 0, $width, $newH, $w, $h);

if (!is_dir($cacheDir)) @mkdir($cacheDir, 0755, true);
$ok = match ($ext) {
  'png'  => @imagepng($thumb, $cache, 8),
  'gif'  => @imagegif($thumb, $cache),
  'webp' => function_exists('imagewebp') ? @imagewebp($thumb, $cache, 82) : false,
  default => @imagejpeg($thumb, $cache, 82),
};
imagedestroy($image);
imagedestroy($thumb);

send($ok && is_file($cache) ? $cache : $src);
