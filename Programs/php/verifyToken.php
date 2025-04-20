<?php
require 'db.php';
require 'JWT.php'; 

header('Content-Type: application/json');

$headers = getallheaders();
if (isset($headers['Authorization'])) {
    $token = str_replace('Bearer ', '', $headers['Authorization']);
    $result = verify_jwt($token);

    if ($result[0]) {
        $stmt = $conn->prepare("SELECT id, password, username FROM users WHERE username = ?");
        $stmt->execute([$result[1]["username"]]);
        $user = $stmt->fetch();
        if($user){
            echo json_encode(['status' => 'success', 'username' => $result[1]["username"], 'id' => $result[1]["id"]]);

        }
        else{
            echo json_encode(['status' => 'error', 'message' => 'No User found']);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Invalid token']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => $result[1]]);
}
?>
