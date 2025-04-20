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

    $token = str_replace('Bearer ', '', $headers['Authorization']);
    $requestId = $_POST['requestId'] ?? null;
    $response = $_POST['response'] ?? null;

    if (empty($token) || empty($requestId) || empty($response)) {
        echo json_encode(['status' => 'error', 'message' => 'Token, requestId, or response is missing.']);
        exit();
    }

    $result = verify_jwt($token);
    if (!$result[0]) {
        echo json_encode(['status' => 'error', 'message' => 'Invalid token.']);
        exit();
    }

    $username = $result[1]['username'];

    // ユーザーIDを取得
    $stmt = $conn->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$user) {
        echo json_encode(['status' => 'error', 'message' => 'User not found.']);
        exit();
    }
    $userId = $user['id'];

    // フレンド申請の存在を確認
    $stmt = $conn->prepare("SELECT * FROM friendrequests WHERE id = ? AND peerid = ?");
    $stmt->execute([$requestId, $userId]);
    $friendRequest = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$friendRequest) {
        echo json_encode(['status' => 'error', 'message' => 'Friend request not found.']);
        exit();
    }

    if ($response !== 'accepted' && $response !== 'rejected') {
        echo json_encode(['status' => 'error', 'message' => 'Invalid response.']);
        exit();
    }

    // フレンド申請のステータスを更新
    $stmt = $conn->prepare("UPDATE friendrequests SET status = ? WHERE id = ?");
    if (!$stmt->execute([$response, $requestId])) {
        echo json_encode(['status' => 'error', 'message' => 'Failed to update friend request.']);
        exit();
    }

    if ($response === 'accepted') {
        // フレンド関係を挿入
        $stmt = $conn->prepare("INSERT INTO friends (userid, friendid) VALUES (?, ?), (?, ?)");
        if (!$stmt->execute([$userId, $friendRequest['requesterid'], $friendRequest['requesterid'], $userId])) {
            echo json_encode(['status' => 'error', 'message' => 'Failed to add friend.']);
            exit();
        }
        echo json_encode(['status' => 'success', 'message' => 'Friend request accepted.']);
    } else {
        echo json_encode(['status' => 'success', 'message' => 'Friend request rejected.']);
    }
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'An unexpected error occurred: ' . $e->getMessage()]);
}
?>
