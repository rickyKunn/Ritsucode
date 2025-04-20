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

    $result = verify_jwt($token);
    if (!$result[0]) {
        echo json_encode(['status' => 'error', 'message' => 'Invalid token.']);
        exit();
    }

    $username = $result[1]['username'];

    // ユーザーIDを取得
    $stmt = $conn->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch();
    if (!$user) {
        echo json_encode(['status' => 'error', 'message' => 'User not found.']);
        exit();
    }
    $userId = $user['id'];

    // フレンドリストを取得
    $stmt = $conn->prepare("
        SELECT DISTINCT u.id, u.username 
        FROM friends f
        JOIN users u ON (u.id = f.friendid OR u.id = f.userid)
        WHERE (f.userid = :userId OR f.friendid = :userId) AND u.id != :userId
    ");
    $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
    $stmt->execute();
    $friends = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['status' => 'success', 'friends' => $friends]);
} catch (PDOException $e) {
    error_log($e->getMessage());
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
} catch (Exception $e) {
    error_log($e->getMessage());
    echo json_encode(['status' => 'error', 'message' => 'An unexpected error occurred: ' . $e->getMessage()]);
}
?>
