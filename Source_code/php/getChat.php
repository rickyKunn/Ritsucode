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
$Id = $_POST['Id'] ?? '';
$type = $_POST['type'] ?? '';
if (empty($token) || empty($Id)|| empty($type)) {
    echo json_encode(['status' => 'error', 'message' => 'Token or Id or type is missing']);
    exit();
}

$result = verify_jwt($token);
if (!$result[0]) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid token']);
    exit();
}

$userId = $result[1]['id'];

if($type === "friend"){
    $stmt = $conn->prepare("SELECT * FROM messages WHERE (senderid = ? AND receiverid = ?) OR (senderid = ? AND receiverid = ?)");
    $stmt->execute([$userId, $Id, $Id, $userId]);
    $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(['status' => 'success', 'messages' => $messages]);
}
else if($type === "group"){
    $stmt = $conn->prepare("
        SELECT gm.id, gm.userid, gm.message, gm.timestamp, u.username
        FROM groupmessages gm
        JOIN users u ON gm.userid = u.id
        WHERE gm.groupid = ?
        ORDER BY gm.timestamp ASC
");
$stmt->execute([$Id]);
$messages = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode(['status' => 'success', 'messages' => $messages]);
}
?>
