const mix = require('laravel-mix');
const tailwindcss = require('tailwindcss');

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel application. By default, we are compiling the Sass
 | file for the application as well as bundling up all the JS files.
 |
 */

mix.js('./Themes/Admin/Assets/js/app.js', './public/Themes/Admin/js')
  .js('./Themes/Admin/Assets/js/fullcalendar.js', './public/Themes/Admin/js')
  .sass('./Themes/Admin/Assets/scss/Aurora Online.scss', './public/Themes/Admin/css/AuroraOnline.css', {}, [
    tailwindcss('./Themes/Admin/Assets/tailwind.config.js'),
  ])
  .sass('./Themes/Admin/Assets/scss/Cijferadvies.scss', './public/Themes/Admin/css', {}, [
    tailwindcss('./Themes/Admin/Assets/tailwind.config.js'),
  ])
  .sass('./Themes/Admin/Assets/scss/Eclesia.scss', './public/Themes/Admin/css', {}, [
    tailwindcss('./Themes/Admin/Assets/tailwind.config.js'),
  ])
  .sass('./Themes/Admin/Assets/scss/PuntenCo.scss', './public/Themes/Admin/css', {}, [
    tailwindcss('./Themes/Admin/Assets/tailwind.config.js'),
  ])
  .sass('./Themes/Admin/Assets/scss/file-manager.scss', './public/Themes/Admin/css')
  .sass('./Themes/Admin/Assets/scss/Qubiqx.scss', './public/Themes/Admin/css', {}, [
    tailwindcss('./Themes/Admin/Assets/tailwind.config.js'),
  ])
  .sass('./Themes/Admin/Assets/scss/Studentenweekend.scss', './public/Themes/Admin/css', {}, [
    tailwindcss('./Themes/Admin/Assets/tailwind.config.js'),
  ])
  .copy('./Themes/Admin/Assets/files', './public/Themes/Admin/themefiles')
  .options({
    processCssUrls: false,
  })
  .disableNotifications();
