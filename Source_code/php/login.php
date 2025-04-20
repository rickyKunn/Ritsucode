<?php
require 'db.php';
require 'JWT.php';
header('Content-Type: application/json');

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $response = array();
    $email = $_POST['email'];
    $password = $_POST['password'];
    $stmt = $conn->prepare("SELECT id, password, verified, username FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();
        
    if ($user &&  password_verify($password,$user['password'])) {
        $token = generate_jwt($user['username'],$user['id']);
        if($user['verified'] === "1"){
            $response['status'] = 'success';
            $response['JWT'] = $token;
        } 
        else{
            $response['status'] = 'error';
            $response['message'] = "You did not verify";    
        }
    }
    else{
        $response['status'] = 'error';
        $response['message'] = "Mail Address or password is wrong.";

    }

    echo json_encode($response);
}

?>