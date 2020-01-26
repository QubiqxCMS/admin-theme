<?php

foreach (explode("\n", file_get_contents('../../../../../../../.env')) as $e) {
    if (strpos($e, 'APP_URL') !== false) {
        $l = explode('=', $e);
        $app_url = $l[1];
    }
    if (strpos($e, 'FRONTEND_THEME') !== false) {
        $l = explode('=', $e);
        $frontend_theme = $l[1];
    }
}

// Absolute URL to upload folder via HTTP.
// Will affect to client (JS) part of plugins.
// By default script is configured to automatically detect it.
// If you want to change it, do it like this:
$config['BaseUrl'] = $app_url.'/Themes/'.$frontend_theme.'/files';
// $config['BaseUrl'] = env('APP_URL') . '/Themes/' . env('FRONTEND_THEME') . '/files';
//$config['BaseUrl'] = preg_replace('/(uploader\.php.*)/', 'userfiles/', $_SERVER['PHP_SELF']);
//$config['BaseUrl'] = '/public/Themes/' . env('FRONTEND_THEME') . '/files';
// Absolute or relative path to directory on the server where uploaded files will be stored.
// Used by this PHP script only.
// By default it automatically detects the directory.
// You can change it, see this example:
// $config['BaseDir'] = "/var/www/ckeditor_or_tinymce/jsplus_uploader/userfiles/";
$config['BaseDir'] = '../../../../../../../public/Themes/'.$frontend_theme.'/files';
//$config['BaseDir'] = '/public/';
$config['ResourceType']['Files'] = [
    'maxSize' => 0,            // maxSize in bytes for uploaded files, 0 for any
    'allowedExtensions' => '*',    // means any extensions are allowed
];

$config['ResourceType']['Images'] = [
    'maxSize' => 16 * 1024 * 1024,    // maxSize in bytes for uploaded images, 0 for any
    'allowedExtensions' => 'bmp,gif,jpeg,jpg,png',
];

$config['JPEGQuality'] = 95; // Will be used for resizing JPEG images

// Some restrictions to avoid server overload / DDoS
$config['MaxImgResizeWidth'] = 2000;
$config['MaxImgResizeHeight'] = 2000;
$config['MaxThumbResizeWidth'] = 500;
$config['MaxThumbResizeHeight'] = 500;

$config['AllowExternalWebsites'] = ''; // Crossdomain upload is disabled by default
// If you want to enable it use this code:
// $config['AllowExternalSites'] = 'http://yoursite.com';
// or to allow all websites (with caution!):
// $config['AllowExternalWebsites'] = '*';

if (substr($config['BaseUrl'], -1) !== '/') {
    $config['BaseUrl'] .= '/';
}
if (substr($config['BaseDir'], -1) !== '/' && substr($config['BaseDir'], -1) !== '\\') {
    $config['BaseDir'] .= '/';
}
