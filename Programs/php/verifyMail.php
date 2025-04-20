<?php
require '/home/rickyhome/public_html/php/PHPMailer/src/PHPMailer.php';
require '/home/rickyhome/public_html/php/PHPMailer/src/Exception.php';
require '/home/rickyhome/public_html/php/PHPMailer/src/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

function sendVerifyMail($email, $verification_code) {
    $mail = new PHPMailer(true);

    try {
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true; 
        $mail->Username = 'kobayashiritsuki@gmail.com';
        $mail -> Password = 'tkpv nndi qzpz urfn';
        $mail -> SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = 587;
        $mail -> CharSet ='UTF-8';

        $mail->setFrom('kobayashiritsuki@gmail.com', 'Ritsucode'); 
        $mail->addAddress($email);

        $mail->isHTML(true);
        $mail->Subject = 'メールアドレス確認';
        $mail->Body    = "あなたの認証コードは $verification_code です。";

        $mail->send();
        return true;
    } catch (Exception $e) {
        return false;
    }
}
?>