<?php
// Single guarded data endpoint. Accepts a whitelisted query descriptor:
// { table, action: select|insert|update|delete, columns, filters, order, limit, single, values }
declare(strict_types=1);
require __DIR__ . '/lib.php';
cors();

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') fail('Method not allowed', 405);

$in = body();
$table = (string) ($in['table'] ?? '');
$action = (string) ($in['action'] ?? 'select');
$policies = policy();
if (!isset($policies[$table])) fail('Unknown table', 404);
$p = $policies[$table];
$allowedCols = $p['cols'];
$jsonCols = $p['json_cols'];

$user = current_user();
$isEmployee = $user !== null && $user['is_employee'];

// ------------------------------------------------------------- authorization
if ($action === 'select') {
  if (!$isEmployee && empty($p['public_read'])) fail('Unauthorized', 401);
} elseif ($action === 'insert') {
  if (!$isEmployee && empty($p['public_insert'])) fail('Unauthorized', 401);
} else {
  if (!$isEmployee) fail('Unauthorized', 401);
}
if ($table === 'user_roles' && $action !== 'select') fail('Forbidden', 403);

// ------------------------------------------------------------------- helpers
$filters = is_array($in['filters'] ?? null) ? $in['filters'] : [];
$where = [];
$params = [];
foreach ($filters as $f) {
  $col = (string) ($f['column'] ?? '');
  if (!in_array($col, $allowedCols, true) && $col !== 'user_id') fail("Invalid filter column: $col");
  $op = (string) ($f['op'] ?? 'eq');
  $val = $f['value'] ?? null;
  if ($op === 'eq') {
    if ($val === null) { $where[] = q($col) . ' IS NULL'; continue; }
    if (is_bool($val)) $val = $val ? 1 : 0;
    $where[] = q($col) . ' = ?';
    $params[] = $val;
  } elseif ($op === 'in' && is_array($val) && $val) {
    $where[] = q($col) . ' IN (' . implode(',', array_fill(0, count($val), '?')) . ')';
    foreach ($val as $v) $params[] = $v;
  } else {
    fail("Unsupported filter operator: $op");
  }
}
// Anonymous visitors only ever see published rows.
if ($action === 'select' && !$isEmployee && !empty($p['force_published'])) {
  $where[] = '`published` = 1';
}
$whereSql = $where ? ' WHERE ' . implode(' AND ', $where) : '';

function decode_row(array $row, array $jsonCols): array {
  foreach ($jsonCols as $c) {
    if (array_key_exists($c, $row)) {
      $decoded = json_decode((string) ($row[$c] ?? '[]'), true);
      $row[$c] = is_array($decoded) ? $decoded : [];
    }
  }
  foreach (['published', 'read'] as $b) {
    if (array_key_exists($b, $row)) $row[$b] = (bool) $row[$b];
  }
  return $row;
}

/** Filter incoming values to whitelisted columns, encoding JSON columns. */
function clean_values($raw, array $allowedCols, array $jsonCols): array {
  if (!is_array($raw)) return [];
  $out = [];
  foreach ($raw as $k => $v) {
    if (!in_array($k, $allowedCols, true) || $k === 'id' || $k === 'created_at' || $k === 'updated_at') continue;
    if (in_array($k, $jsonCols, true)) $v = json_encode(is_array($v) ? array_values($v) : [], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    elseif (is_bool($v)) $v = $v ? 1 : 0;
    elseif (is_array($v)) continue;
    $out[$k] = $v;
  }
  return $out;
}

// ------------------------------------------------------------------- actions
try {
  if ($action === 'select') {
    $cols = $in['columns'] ?? null;
    if (is_array($cols) && $cols) {
      foreach ($cols as $c) if (!in_array($c, $allowedCols, true)) fail("Invalid column: $c");
      $select = implode(', ', array_map('q', $cols));
    } else {
      $select = implode(', ', array_map('q', $allowedCols));
    }
    $orderSql = '';
    $orders = is_array($in['order'] ?? null) ? $in['order'] : [];
    $parts = [];
    foreach ($orders as $o) {
      $col = (string) ($o['column'] ?? '');
      if (!in_array($col, $allowedCols, true)) fail("Invalid order column: $col");
      $parts[] = q($col) . (($o['ascending'] ?? true) ? ' ASC' : ' DESC');
    }
    if ($parts) $orderSql = ' ORDER BY ' . implode(', ', $parts);

    $limitSql = '';
    $limit = $in['limit'] ?? null;
    if (!empty($in['single'])) $limit = 1;
    if (is_int($limit) || (is_string($limit) && ctype_digit($limit))) {
      $limitSql = ' LIMIT ' . max(1, min(1000, (int) $limit));
    }

    $stmt = db()->prepare("SELECT $select FROM " . q($table) . $whereSql . $orderSql . $limitSql);
    $stmt->execute($params);
    $rows = array_map(fn($r) => decode_row($r, $jsonCols), $stmt->fetchAll());
    out(['data' => !empty($in['single']) ? ($rows[0] ?? null) : $rows]);
  }

  if ($action === 'insert') {
    $rowsIn = $in['values'] ?? [];
    if (isset($rowsIn['0']) || (is_array($rowsIn) && array_is_list($rowsIn))) $list = $rowsIn;
    else $list = [$rowsIn];

    $inserted = [];
    foreach ($list as $raw) {
      $vals = clean_values($raw, $allowedCols, $jsonCols);
      // Public submissions are validated and cannot set moderation columns.
      if (!$isEmployee) {
        unset($vals['read']);
        if ($table === 'contact_messages') {
          foreach (['name', 'email', 'message'] as $req) {
            if (trim((string) ($vals[$req] ?? '')) === '') fail("Missing field: $req");
          }
          if (!filter_var($vals['email'], FILTER_VALIDATE_EMAIL)) fail('Invalid email address');
          if (mb_strlen((string) $vals['message']) > 5000) fail('Message is too long');
        }
        if ($table === 'event_registrations') {
          foreach (['name', 'email'] as $req) {
            if (trim((string) ($vals[$req] ?? '')) === '') fail("Missing field: $req");
          }
          if (!filter_var($vals['email'], FILTER_VALIDATE_EMAIL)) fail('Invalid email address');
        }
      }
      foreach ($jsonCols as $c) if (!array_key_exists($c, $vals)) $vals[$c] = '[]';
      $vals['id'] = uuid();
      $cols = array_keys($vals);
      $sql = 'INSERT INTO ' . q($table) . ' (' . implode(', ', array_map('q', $cols)) . ') VALUES ('
        . implode(', ', array_fill(0, count($cols), '?')) . ')';
      db()->prepare($sql)->execute(array_values($vals));
      $inserted[] = $vals['id'];
    }
    out(['data' => $inserted]);
  }

  if ($action === 'update') {
    $vals = clean_values($in['values'] ?? [], $allowedCols, $jsonCols);
    if (!$vals) fail('Nothing to update');
    if (!$where) fail('Update requires a filter');
    $set = implode(', ', array_map(fn($c) => q($c) . ' = ?', array_keys($vals)));
    $stmt = db()->prepare('UPDATE ' . q($table) . " SET $set" . $whereSql);
    $stmt->execute(array_merge(array_values($vals), $params));
    out(['data' => ['affected' => $stmt->rowCount()]]);
  }

  if ($action === 'delete') {
    if (!$where) fail('Delete requires a filter');
    $stmt = db()->prepare('DELETE FROM ' . q($table) . $whereSql);
    $stmt->execute($params);
    out(['data' => ['affected' => $stmt->rowCount()]]);
  }
} catch (Throwable $e) {
  error_log('[query] ' . $e->getMessage());
  fail('Database error', 500);
}

fail('Unknown action', 400);
