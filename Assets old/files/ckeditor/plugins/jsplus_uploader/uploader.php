<?php

declare(strict_types=1);
require_once 'config.php';

function fail($msg)
{
    $uploadResult[0] = false;
    $uploadResult[1] = $msg;
    sendResponse($uploadResult);
    die;
}

function sendResponse($uploadResult, $baseUrl)
{
    global $config;
    if ($config['AllowExternalWebsites'] != '') {
        header('Access-Control-Allow-Origin: '.$config['AllowExternalWebsites']);
    }

    if ($_GET['client'] == 'plupload') {
        if ($uploadResult[0] === true) {
            echo $baseUrl.$uploadResult[1][0];
        } else {
            echo '!'.$uploadResult[1];
        }
    } elseif ($_GET['client'] == 'tinymce') {
        $result = '';
        if ($uploadResult[0] === true) {
            foreach ($uploadResult[1] as $f) {
                if (strlen($result) > 0) {
                    $result .= '|';
                }
                $result .= $baseUrl.$f;
            }
        } else {
            $result = '!'.$uploadResult[1];
        }

        echo $result;
    } else {
        $CKEditorFuncNum = $_GET['CKEditorFuncNum'];
        if ($uploadResult[0] === true) {
            echo '<script type="text/javascript">window.parent.CKEDITOR.tools.callFunction('.$CKEditorFuncNum.", '".$baseUrl.$uploadResult[1][0]."', '');</script>";
        } else {
            echo '<script type="text/javascript">window.parent.CKEDITOR.tools.callFunction('.$CKEditorFuncNum.", '', '".$uploadResult[1]."');</script>";
        }
    }
}

function getThumbFileName($fileName)
{
    $a = explode('.', $fileName);
    $a[count($a) - 2] .= '_small';

    return implode('.', $a);
}

function uploadFile(
    $name,
    $tmp_name,
    $error,
    $size,
    $toDir,
    $allowedExtensions,
    $maxSize,
    $imgEnlarge,
    $imgWidth,
    $imgHeight,
    $doThumb,
    $thumbEnlarge,
    $thumbWidth,
    $thumbHeight
) {
    if ($error != 0) {
        $message = "There was an upload error for file  `'.${name}.'`, code #".$error.". Check your server's configuration";
        switch ($error) {
            case UPLOAD_ERR_INI_SIZE:   $message = "The uploaded file `'.${name}.'` exceeds the upload_max_filesize directive in php.ini"; break;
            case UPLOAD_ERR_FORM_SIZE:  $message = "The uploaded file `'.${name}.'` exceeds the MAX_FILE_SIZE directive that was specified in the HTML form"; break;
            case UPLOAD_ERR_PARTIAL:    $message = "The uploaded file  `'.${name}.'` was only partially uploaded"; break;
            case UPLOAD_ERR_NO_FILE:    $message = 'No file was uploaded'; break;
            case UPLOAD_ERR_NO_TMP_DIR: $message = 'Missing a temporary folder on your server'; break;
            case UPLOAD_ERR_CANT_WRITE: $message = 'Failed to write file to disk on your server'; break;
            case UPLOAD_ERR_EXTENSION:  $message = 'File upload stopped by extension'; break;
        }

        return [false, $message];
    }

    if ($size == 0) {
        return [false, 'File `'.$name.'` size = 0'];
    }

    if ($maxSize > 0 && $size > $maxSize) {
        return [false, 'Size of file `'.$name.'` exceeds the limit of '.$maxSize.' bytes'];
    }

    $a = explode('.', $name);
    $type = $a[count($a) - 1];
    error_log($type);
    if ($allowedExtensions[0] != '*' && !in_array(strtolower($type), array_map('strtolower', $allowedExtensions))) {
        return [false, 'Wrong extension for file `'.$name.'`. Allowed extensions are: '.implode(', ', $allowedExtensions)];
    }

    $fileName;
    $fileNameThumb;

    // Search for file name
    $ok = false;
    $i = -1;
    do {
        $i++;
        if ($i == 0) {
            $fileName = $name;
        } else {
            $fileName = $i.'_'.$name;
        }
        $ok = !is_file($toDir.$fileName);
        if ($doThumb) {
            $fileNameThumb = getThumbFileName($fileName);
            $ok = $ok && !file_exists($toDir.$fileNameThumb);
        }
    } while (!$ok);

    $filePath = $toDir.$fileName;
    if (is_uploaded_file($tmp_name)) {
        $moveResult = move_uploaded_file($tmp_name, $filePath);
    } else {
        $moveResult = rename($tmp_name, $filePath);
    }
    if ($moveResult === false) {
        return [false, 'Error while moving uploaded file to destination folder: check folder permissions on server side'];
    }

    if ($imgWidth > 0 || $imgHeight > 0) {
        $err = resizeImg(
            $filePath,
            $imgEnlarge,
            $imgWidth,
            $imgHeight,
            true
        );
        if ($err != null) {
            return [false, 'Error while resizing image `'.$name.'`: '.$err];
        }
    }

    if ($doThumb) {
        $err = resizeImg(
            $filePath,
            $thumbEnlarge,
            $thumbWidth,
            $thumbHeight,
            false
        );
        if ($err != null) {
            return [false, 'Error while making thumbnail of image `'.$name.'`: '.$err];
        }
    }

    return [true, $fileName];
}

// return array(ok?, tmp_file_name / error_text)
function rehost($url, $maxSize)
{
    if ($maxSize > 0) {
        $bytes = file_get_contents($url, false, null, -1, $maxSize);
    } else {
        $bytes = file_get_contents($url);
    }

    if ($bytes == false) {
        return [false, 'Unable to locate file on external server'.($maxSize > 0 ? ' or file size limit exceeded' : '')];
    }

    // $http_response_header filled by file_get_contents()
    foreach ($http_response_header as $header) {
        if (strpos(strtolower($header), 'content-disposition') !== false) {
            $tmp_name = explode('=', $header);
            if ($tmp_name[1]) {
                $file = trim($tmp_name[1], '";\'');
            }
        }
    }
    if (!isset($file)) {
        $stripped_url = preg_replace('/\\?.*/', '', $url);
        $file = basename($stripped_url);
    }

    $tmpDir = sys_get_temp_dir();
    if (file_exists($tmpDir.'/'.$file)) {
        $n = 1;
        do {
            $n++;
        } while (file_exists($tmpDir.'/'.$n.'_'.$file));
        $file = $n.'_'.$file;
    }
    $tmpFile = $tmpDir.'/'.$file;

    $bytesDownloaded = file_put_contents($tmpFile, $bytes);
    if ($bytesDownloaded === false) {
        return [false, 'Unable to write downloaded data to: '.$tmpFile];
    }

    return [true, $tmpFile];
}

// If any error returns array(false, string)
// If all ok, returns array(true, array(file1, file2, ...))
function upload($doThumb, $imgEnlarge, $imgWidth, $imgHeight, $thumbEnlarge, $thumbWidth, $thumbHeight)
{
    global $config;
    if (!empty($_GET) && isset($_GET['type']) && array_key_exists($_GET['type'], $config['ResourceType'])) {
        $rType = $config['ResourceType'][$_GET['type']];
    } else {
        return [false, 'Resource type (type) is defined incorrectly ('.$_GET['type'].')'];
    }

    if (!isset($_GET['rehost'])) {
        if (isset($_FILES['file'])) { // for Plupload
            $_FILES['upload'] = $_FILES['file'];
        } elseif (isset($_FILES['files'])) { // for JQuery File Upload
            $_FILES['upload'] = $_FILES['files'];
        }

        if (!isset($_FILES['upload'])) {
            return [false, 'No files to process'];
        }

        $data = $_FILES['upload'];
        $files = [];
        if (is_array($data['name'])) {
            for ($i = 0; count($data['name']) > $i; $i++) {
                $files[] = [
                    'name' => $data['name'][$i],
                    'tmp_name' => $data['tmp_name'][$i],
                    'error' => $data['error'][$i],
                    'size' => $data['size'][$i],
                ];
            }
        } else {
            $files[] = $data;
        }
    } else {
        if (isset($_GET['url'])) {
            $result = rehost($_GET['url'], $rType['maxSize']);
            if ($result[0] === true) {
                $name = basename($result[1]);
                $file = [
                    'name' => $name,
                    'tmp_name' => $result[1],
                    'size' => filesize($result[1]),
                    'error' => '',
                ];
                $files = [];
                $files[] = $file;
            } else {
                return $result;
            }
        } else {
            return [false, 'No URL to process'];
        }
    }

    $resultFiles = [];
    foreach ($files as $file) {
        $fileResult = uploadFile(
            $file['name'],
            $file['tmp_name'],
            $file['error'],
            $file['size'],
            $config['BaseDir'],
            explode(',', $rType['allowedExtensions']),
            $rType['maxSize'],
            $imgEnlarge,
            $imgWidth,
            $imgHeight,
            $doThumb,
            $thumbEnlarge,
            $thumbWidth,
            $thumbHeight
        );
        if ($fileResult[0] !== true) {
            return $fileResult;
        } // error

        $resultFiles[] = $fileResult[1];
    }

    return [true, $resultFiles];
}

function resizeImg($sourceFile, $resizeOnLess, $maxWidth, $maxHeight, $resizeself)
{
    global $config;
    if ($maxWidth <= 0 && $maxHeight <= 0 && $resizeself) {
        return;
    }

    $sourceImageAttr = @getimagesize($sourceFile);
    if ($sourceImageAttr === false) {
        return 'unable to get image size';
    }

    switch ($sourceImageAttr['mime']) {
        case 'image/gif':
                if (@imagetypes() & IMG_GIF) {
                    $oImage = @imagecreatefromgif($sourceFile);
                } else {
                    $ermsg = 'GIF images are not supported';
                }

            break;
        case 'image/jpeg':
                if (@imagetypes() & IMG_JPG) {
                    $oImage = @imagecreatefromjpeg($sourceFile);
                } else {
                    $ermsg = 'JPEG images are not supported';
                }

            break;
        case 'image/png':
                if (@imagetypes() & IMG_PNG) {
                    $oImage = @imagecreatefrompng($sourceFile);
                } else {
                    $ermsg = 'PNG images are not supported';
                }

            break;
        case 'image/wbmp':
                if (@imagetypes() & IMG_WBMP) {
                    $oImage = @imagecreatefromwbmp($sourceFile);
                } else {
                    $ermsg = 'WBMP images are not supported';
                }

            break;
        default:
            $ermsg = $sourceImageAttr['mime'].' images are not supported';
        break;
    }

    if (isset($ermsg) || $oImage === false) {
        return $ermsg;
    }

    if ($maxWidth > 0 && $maxHeight > 0) {
        $xscale = imagesx($oImage) / $maxWidth;
        $yscale = imagesy($oImage) / $maxHeight;
    } elseif ($maxWidth > 0) {
        $xscale = imagesx($oImage) / $maxWidth;
        $yscale = $xscale;
    } elseif ($maxHeight > 0) {
        $yscale = imagesy($oImage) / $maxHeight;
        $xscale = $yscale;
    } else {
        $yscale = 1;
        $xscale = 1;
    }

    if ($yscale > $xscale) {
        $newWidth = round(imagesx($oImage) * (1 / $yscale));
        $newHeight = round(imagesy($oImage) * (1 / $yscale));
    } else {
        $newWidth = round(imagesx($oImage) * (1 / $xscale));
        $newHeight = round(imagesy($oImage) * (1 / $xscale));
    }

    $resizeRequired =
        $newWidth > 0
        &&
        ($resizeOnLess || imagesx($oImage) > $newWidth)
        &&
        $xscale != 1;

    if ($resizeRequired) {
        // Resize is required
        $newImage = imagecreatetruecolor($newWidth, $newHeight);
        imagealphablending($newImage, false);
        imagesavealpha($newImage, true);
        imagecopyresampled($newImage, $oImage, 0, 0, 0, 0, $newWidth, $newHeight, imagesx($oImage), imagesy($oImage));
        $oImage = $newImage;
    }

    if (!$resizeself) {
        $sourceFileArr = explode('.', $sourceFile);
        $sourceFileArr[count($sourceFileArr) - 2] .= '_small';
        $destFile = implode('.', $sourceFileArr);
    } else {
        if ($resizeRequired) {
            unlink($sourceFile);
        }
        $destFile = $sourceFile;
    }

    if ($resizeRequired) {
        switch ($sourceImageAttr['mime']) {
            case 'image/gif':
                imagegif($oImage, $destFile);
                break;
            case 'image/jpeg':
                imagejpeg($oImage, $destFile, $config['JPEGQuality']);
                break;
            case 'image/png':
                imagepng($oImage, $destFile);
                break;
            case 'image/wbmp':
                imagewbmp($oImage, $destFile);
                break;
        }
    } elseif ($destFile != $sourceFile) {
        copy($sourceFile, $destFile);
    }

    @imagedestroy($oImage);
    @imagedestroy($newImage);
}

function run()
{
    global $config;
    if (!isset($config)) {
        $result = [false, 'Uploader\'s config not found. Check globals are on your server'];
    } else {
        // Original image resize options
        $imgEnlarge = false;
        if (isset($_GET['ie'])) {
            if ($_GET['ie'] == '1') {
                $imgEnlarge = true;
            } else {
                fail('Image Resize (ie) value is incorrect ('.$_GET['ie'].')');
            }
        }
        $imgWidth = 0;
        if (isset($_GET['iw'])) {
            $imgWidth = $_GET['iw'];
        }
        if (preg_match('/^\d{1, 5}$/', $imgWidth) != null) {
            fail('Image Width (iw) value is not positive integer number ('.$imgWidth.')');
        }
        if ($imgWidth > $config['MaxImgResizeWidth']) {
            fail('Image Width (iw) value is too big ('.$imgWidth.')');
        }
        $imgHeight = 0;
        if (isset($_GET['ih'])) {
            $imgHeight = $_GET['ih'];
        }
        if (preg_match('/^\d{1, 5}$/', $imgHeight) != null) {
            fail('Image Height (ih) value is not positive integer number ('.$imgHeight.')');
        }
        if ($imgHeight > $config['MaxImgResizeHeight']) {
            fail('Image Height (ih) value is too big ('.$imgHeight.')');
        }

        // Thumbnail resize options
        $thumbEnlarge = false;
        if (isset($_GET['te'])) {
            if ($_GET['te'] == '1') {
                $thumbEnlarge = true;
            } else {
                fail('Thumbnail Resize (te) value is incorrect ('.$_GET['te'].')');
            }
        }
        $thumbWidth = 0;
        if (isset($_GET['tw'])) {
            $thumbWidth = $_GET['tw'];
        }
        if (preg_match('/^\d{1, 5}$/', $thumbWidth) != null) {
            fail('Thumbnail Width (tw) value is not positive integer number ('.$thumbWidth.')');
        }
        if ($thumbWidth > $config['MaxThumbResizeWidth']) {
            fail('Thumbnail Width (tw) value is too big ('.$thumbWidth.')');
        }
        $thumbHeight = 0;
        if (isset($_GET['th'])) {
            $thumbHeight = $_GET['th'];
        }
        if (preg_match('/^\d{1, 5}$/', $thumbHeight) != null) {
            fail('Thumbnail Height (th) value is not positive integer number ('.$thumbHeight.')');
        }
        if ($thumbHeight > $config['MaxThumbResizeHeight']) {
            fail('Thumbnail Height (th) value is too big ('.$thumbHeight.')');
        }

        $doThumb = $_GET['type'] == 'Images' && isset($_GET['makeThumb']);

        $result = upload(
            $doThumb,
            $imgEnlarge,
            $imgWidth,
            $imgHeight,
            $thumbEnlarge,
            $thumbWidth,
            $thumbHeight
        );
    }

    sendResponse(
        $result,
        $config['BaseUrl']
    );
}

run();
