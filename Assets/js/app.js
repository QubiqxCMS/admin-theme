// require('./includes/vue-loading-spinner');
// require('./includes/articles');
require('./includes/jquery-sortable');
// require('./includes/jscolor');
//
// //Theme
// require('./includes/app.min');
// require('./includes/actions');
// require('./includes/functions/app');
// require('./includes/functions/vendors');
//
// // require('./includes/bower_components/jquery/dist/jquery.min');
// // require('./includes/bower_components/bootstrap/dist/js/bootstrap.min');
import VueCharts from '../../../../node_modules/vue-chartjs'

window.VueChartJs = VueCharts;
require('./includes/jquery.peity.min');
require('./includes/tree.jquery');
// require('./includes/bower_components/flatpickr/dist/flatpickr.min');
//
// require('./includes/datepicker');
//

$(document).ready(function () {
    document.querySelector('.menu-button').addEventListener('click', () => {
        document.querySelector('.sidebar-menu').classList.toggle('-translate-x-full')
    });
    document.querySelector('.menu-button-close').addEventListener('click', () => {
        document.querySelector('.sidebar-menu').classList.toggle('-translate-x-full')
    });

    $('.tab').on('click', function (event) {
        var tab = $(event.target).attr('href');
        if (!tab) {
            return;
        }
        $('.tab-link.active').removeClass('active');
        $(event.target).addClass('active');
        $('.tab-pane').removeClass('active');
        $(tab).addClass('active');
    });
    $('.tab2').on('click', function (event) {
        var tab = $(event.target).attr('href');
        if (!tab) {
            return;
        }
        $('.tab-link2.active').removeClass('active');
        $(event.target).addClass('active');
        $('.tab-pane2').removeClass('active');
        $(tab).addClass('active');
    });
    function slugify(str) {
        var slug = '';
        var trimmed = $.trim(str);
        slug = trimmed.replace(/[^a-z0-9-]/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
        return slug.toLowerCase();
    }
    window.slugify = slugify;
});
