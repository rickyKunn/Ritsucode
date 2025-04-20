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

    $stmt = $conn->prepare("
    SELECT g.id AS groupid, g.groupname, gm.userid
    FROM groups g
    JOIN groupmembers gm ON g.id = gm.groupid
    WHERE g.id IN (
        SELECT groupid
        FROM groupmembers
        WHERE userid = ?
    )
    ORDER BY g.id
");
    $stmt->execute([$userId]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $groups = [];
    foreach ($rows as $row) {
        $groupid = $row['groupid'];
        if (!isset($groups[$groupid])) {
            $groups[$groupid] = [
                'groupid' => $row['groupid'],
                'groupname' => $row['groupname'],
                'groupmembers' => []
            ];
        }
        $groups[$groupid]['groupmembers'][] = $row['userid'];
    }

    $groups = array_values($groups);


    echo json_encode(['status' => 'success', 'groups' => $groups]);
} catch (PDOException $e) {
    error_log($e->getMessage());
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
} catch (Exception $e) {
    error_log($e->getMessage());
    echo json_encode(['status' => 'error', 'message' => 'An unexpected error occurred: ' . $e->getMessage()]);
}
?>