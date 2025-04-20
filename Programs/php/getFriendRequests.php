<?php
require 'db.php';
require 'JWT.php';
header('Content-Type: application/json');

try {
    $headers = getallheaders();
    if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($headers['Authorization'])) {
        $token = str_replace('Bearer ', '', $headers['Authorization']);

        if (empty($token)) {
            echo json_encode(['status' => 'error', 'message' => 'Token is missing']);
            exit();
        }

        $result = verify_jwt($token);
        if ($result[0]) {
            $username = $result[1]['username'];

            // ユーザーIDの取得
            $stmt = $conn->prepare("SELECT id FROM users WHERE username = ?");
            $stmt->execute([$username]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$user) {
                echo json_encode(['status' => 'error', 'message' => 'User not found.']);
                exit();
            }
            $userId = $user['id'];

            // フレンドリクエストの取得
            $stmt = $conn->prepare("
                SELECT fr.id, u.username AS requester_username 
                FROM friendrequests fr
                JOIN users u ON fr.requesterid = u.id
                WHERE fr.peerid = ? AND fr.status = 'pending'
            ");
            $stmt->execute([$userId]);
            $friendRequests = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(['success' => true, 'requests' => $friendRequests]);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Invalid token.']);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Invalid request method.']);
    }
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'An unexpected error occurred: ' . $e->getMessage()]);
}
?>
