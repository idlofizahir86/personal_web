<?php
header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);
if (!$data) {
    echo json_encode(["message" => "Invalid input"]);
    exit;
}

$file = 'dialog_data_new.json';
$newEntry = ["intent" => $data['intent'], "message" => $data['message']];

if (!file_exists($file)) {
    file_put_contents($file, json_encode($newEntry) . PHP_EOL);
} else {
    file_put_contents($file, json_encode($newEntry) . PHP_EOL, FILE_APPEND);
}

echo json_encode(["message" => "Data saved successfully"]);
?>
