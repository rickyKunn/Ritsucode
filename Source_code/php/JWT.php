<?php
function generate_jwt($username, $id) {
    $header = json_encode(['alg' => 'HS256', 'typ' => 'JWT']);
    $payload = json_encode(['username' => $username,'id' => $id, 'exp' => time() + 86400]); 
    $base64UrlHeader = base64UrlEncode($header);
    $base64UrlPayload = base64UrlEncode($payload);
    $signature = hash_hmac('sha256', "$base64UrlHeader.$base64UrlPayload", 'NoOneWillKnowThisPasswordWithoutMeHaha$$', true);
    $base64UrlSignature = base64UrlEncode($signature);
    return "$base64UrlHeader.$base64UrlPayload.$base64UrlSignature";
}

function verify_jwt($token) {
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return [false,'Invalid token structure']; // トークンの不成立
    }

    $header = json_decode(base64UrlDecode($parts[0]), true);
    $payload = json_decode(base64UrlDecode($parts[1]), true);
    $signature_provided = $parts[2];

    $signature_verified = hash_hmac('sha256', "$parts[0].$parts[1]", 'NoOneWillKnowThisPasswordWithoutMeHaha$$', true);
    $base64UrlSignature = base64UrlEncode($signature_verified);

    if ($base64UrlSignature !== $signature_provided) {
        return [false,'Invalid signature']; // 署名の不一致
    }

    if ($payload['exp'] <= time()) {
        return [false ,'Token expired']; // トークンの有効期限が切れている

    }
    return [true,$payload];
}

function base64UrlEncode($data) {
    return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($data));
}

function base64UrlDecode($data) {
    return base64_decode(str_replace(['-', '_'], ['+', '/'], $data));
}
?>
