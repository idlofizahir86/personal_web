<?php
header('Content-Type: application/json');

$optionsFile = 'options.json';
$dataFile = 'dialog_data_new.json';

// Ambil daftar intent dari options.json
$options = [];
if (file_exists($optionsFile)) {
    $optionsData = json_decode(file_get_contents($optionsFile), true);
    $options = $optionsData['options'] ?? [];
}

// Ambil data dari dialog_data_new.json
$counts = [];
if (file_exists($dataFile)) {
    $data = file($dataFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    $entries = array_map('json_decode', $data);

    foreach ($entries as $entry) {
        if ($entry && isset($entry->intent)) {
            $intent = $entry->intent;
            $counts[$intent] = ($counts[$intent] ?? 0) + 1;
        }
    }
}

// Gabungkan semua intent, set jumlah 0 jika tidak ditemukan
$result = [];
foreach ($options as $intent) {
    $count = $counts[$intent] ?? 0;
    $result[] = ["intent" => $intent, "count" => $count];
}

echo json_encode($result);
?>
