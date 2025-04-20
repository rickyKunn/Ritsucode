<?php
require 'db.php';
require 'JWT.php';
header('Content-Type: application/json');

try {
    $headers = getallheaders();
    if ($_SERVER["REQUEST_METHOD"] !== "POST" || !isset($headers['Authorization'])) {
        echo json_encode(['status' => 'error', 'message' => 'Invalid request method or missing authorization header.']);
        exit();
    }

    $peerName = $_POST['peerName'] ?? '';
    $token = str_replace('Bearer ', '', $headers['Authorization']);

    if (empty($token) || empty($peerName)) {
        echo json_encode(['status' => 'error', 'message' => 'Token or peerName is missing']);
        exit();
    }

    $result = verify_jwt($token);
    if (!$result[0]) {
        echo json_encode(['status' => 'error', 'message' => 'Invalid token.']);
        exit();
    }

    $requesterName = $result[1]['username'];

    // 受信者のユーザーIDを取得
    $stmt = $conn->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$peerName]);
    $peer = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$peer) {
        // ユーザーが見つからなかった
        echo json_encode(['status' => 'error', 'message' => '見つかりませんでした']);
        exit();
    }
    $peerId = $peer['id'];

    $stmt = $conn->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$requesterName]);
    $requester = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$requester) {
        // 自分が見つからなかった
        echo json_encode(['status' => 'error', 'message' => '予期せぬエラーが起きました']);
        exit();
    }
    $requesterId = $requester['id'];

    $stmt = $conn->prepare("SELECT * FROM friendrequests WHERE requesterid = ? AND peerid = ? AND (status = 'pending' OR status = 'accepted')");
    $stmt->execute([$requesterId, $peerId]);
    $existingRequest = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($existingRequest) {
        // 送信済み
        echo json_encode(['status' => 'error', 'message' => 'すでに送ってるよ！']);
        exit();
    }

    $stmt = $conn->prepare("INSERT INTO friendrequests (requesterid, peerid, status) VALUES (?, ?, 'pending')");
    if ($stmt->execute([$requesterId, $peerId])) {
        echo json_encode(['status' => 'success']);
    } else {
        // データベースに送信できなかった
        echo json_encode(['status' => 'error', 'message' => '予期せぬエラーが起きました']);
    }
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'An unexpected error occurred: ' . $e->getMessage()]);
}
?>
