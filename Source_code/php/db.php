<?php
$servername = "localhost";
$username = "root";
$password = ""; 
$dbname = "rickyHome_database"; 

$database_path = '/home/rickyhome/rickyHome_database.db';

try {
    $conn = new PDO("sqlite:" . $database_path);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

} catch (PDOException $e) {
    die(json_encode(array("status" => "error", "message" => "接続失敗: " . $e->getMessage())));

}
?>