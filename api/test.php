<?php
// Simple test file to verify PHP runtime on Vercel
header('Content-Type: application/json');

// Get PHP version and check if it's a supported version
$phpVersion = phpversion();
$versionParts = explode('.', $phpVersion);
$majorVersion = (int)$versionParts[0];
$minorVersion = (int)$versionParts[1];

// Check if PHP version is 7.4 or higher
$isSupportedVersion = ($majorVersion > 7) || ($majorVersion == 7 && $minorVersion >= 4);

echo json_encode([
    'success' => true,
    'message' => 'PHP runtime is working correctly on Vercel',
    'php_version' => $phpVersion,
    'is_supported_version' => $isSupportedVersion,
    'timestamp' => date('Y-m-d H:i:s')
]);
?>