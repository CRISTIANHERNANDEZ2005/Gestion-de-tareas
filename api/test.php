<?php
header('Content-Type: application/json');

echo json_encode([
    'success' => true,
    'message' => 'PHP runtime is working correctly on Vercel',
    'timestamp' => date('Y-m-d H:i:s'),
    'php_version' => phpversion()
]);
?>