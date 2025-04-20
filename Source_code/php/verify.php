<?php
require 'db.php';

header('Content-Type: application/json');

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $response = array();
    $verifycode = $_POST['verifycode'];
    $username = $_POST['username'];
    $stmt = $conn->prepare("SELECT * FROM users WHERE username = ? AND verifycode = ?");
    $stmt->execute([$username, $verifycode]);
    $user = $stmt->fetch();
    if ($user) {
        $stmt = $conn->prepare("UPDATE users SET verified = 1 WHERE username = ? AND verifycode = ?");
        $stmt->execute([$username, $verifycode]);
        if ($stmt->rowCount() > 0) {
            $response['status'] = 'success';

        }
        else{
            $response['status'] = 'error';
            $response['message'] = "DB error happened.";
        }
        
    } 
    else{
        $response['status'] = 'error';
        $response['message'] = "verifycode was wrong.";
    }
    echo json_encode($response);
}
?>