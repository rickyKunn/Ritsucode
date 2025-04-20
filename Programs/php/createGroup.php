<?php
require 'db.php';
require 'JWT.php';

header('Content-Type: application/json');

$groupName = $_POST['groupName'] ?? '';
$userId = $_POST['userId'] ?? '';
$members = $_POST['members'] ?? [];
$headers = getallheaders();

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    if (empty($groupName) || empty($userId) || empty($members) ) {
        echo json_encode(['status' => 'error', 'message' => 'Group name, user ID or members are missing']);
        exit();
    }
    $token = str_replace('Bearer ', '', $headers['Authorization']);
    $result = verify_jwt($token);
    if (!$result[0]) {
        echo json_encode(['status' => 'error', 'message' => 'Invalid token.']);
        exit();
    }

    try {    
        $stmt = $conn->prepare("INSERT INTO groups (groupname) VALUES (?)");
        $stmt->execute([$groupName]);
        $groupId = $conn->lastInsertId();
    
        $stmt = $conn->prepare("INSERT INTO groupmembers (groupid, userid) VALUES (?, ?)");
        $stmt->execute([$groupId, $userId]);
    
        foreach ($members as $memberId) {
            $stmt->execute([$groupId, $memberId]);
        }
    
        echo json_encode(['status' => 'success', 'groupid' => $groupId]);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => 'Failed to create group: ' . $e->getMessage()]);
    }
}

