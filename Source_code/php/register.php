<?php
header('Content-Type: application/json');

require 'db.php';
require 'JWT.php';
require 'verifyMail.php'; 
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = $_POST['username'];
    $email = $_POST['email'];
    $password = $_POST['password'];

    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    $response = array();

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $response['status'] = 'error';
        $response['message'] = 'Invalid email format.';
        echo json_encode($response);
        exit;
    }

    $sql = "SELECT id FROM users WHERE username = :username OR email = :email";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':username', $username, PDO::PARAM_STR);
    $stmt->bindParam(':email', $email, PDO::PARAM_STR);
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
    if (count($rows) > 0) {
        
        $response['status'] = 'error';
        $response['message'] = 'Username or email already exists.';
    } else {
        $verifycode = rand(100000, 999999);
        $sql = "INSERT INTO users (username, email, password, verifycode) VALUES (:username, :email, :password, :verifycode)";
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':username', $username, PDO::PARAM_STR);
        $stmt->bindParam(':email', $email, PDO::PARAM_STR);
        $stmt->bindParam(':password', $hashed_password, PDO::PARAM_STR);
        $stmt->bindParam(':verifycode', $verifycode, PDO::PARAM_STR);
        if ($stmt->execute()) {
            $successSend =  sendVerifyMail($email, $verifycode);
            if($successSend === true){
                $userid = $conn->lastInsertId();
                $token = generate_jwt( $username,$userid);
                $response['status'] = 'success';
                $response['JWT'] = $token; 
                $response['id'] = $userid;
            }
            else{
                $response['status'] = 'error';
                $response['message'] = "Error: Could not send email.";
            }

        } else {
            $response['status'] = 'error';
            $response['message'] = "Error: Could not execute query.";
        }
    }

    echo json_encode($response);
}
?>