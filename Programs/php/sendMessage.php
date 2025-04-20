<?php
require 'db.php';
require 'JWT.php';
header('Content-Type: application/json');

$headers = getallheaders();
if ($_SERVER["REQUEST_METHOD"] !== "POST" || !isset($headers['Authorization'])) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method or missing authorization header.']);
    exit();
}

$token = str_replace('Bearer ', '', $headers['Authorization']);
$peerId = $_POST['Id'] ?? '';
$message = $_POST['message'] ?? '';
$type = $_POST['type'] ?? '';
if (empty($token) || empty($peerId) || empty($message) || empty($type)) {
    echo json_encode(['status' => 'error', 'message' => 'Token, friendId, or message is missing']);
    exit();
}

$result = verify_jwt($token);
if (!$result[0]) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid token']);
    exit();
}

$userId = $result[1]['id'];

if($type === "friend"){
    $stmt = $conn->prepare("INSERT INTO messages (senderid, receiverid, content) VALUES (?, ?, ?)");
    if ($stmt->execute([$userId, $peerId, $message])) {
        echo json_encode(['status' => 'success']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Failed to send message']);
    }
}
else if($type === "group"){
    $stmt = $conn->prepare("INSERT INTO groupmessages (groupid, userid, message) VALUES (?, ?, ?)");
    if ($stmt->execute([$peerId, $userId, $message])) {
        echo json_encode(['status' => 'success']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Failed to send message']);
    }
}

?>
