$('.add_image_field').click(function () {
    var random_number = Math.floor((Math.random() * 10000) + 1);
    $('.dynamic_images').append("<div class=\"form-group\"> " +
        "<label class=\"col-3 control-label\"></label> " +
        "<div class=\"col-12\"> " +
        "<div class=\"input-group file-selector\"> " +
        "<span class=\"input-group-btn\">" +
        "<span id=\"preview_image_" + random_number + "\" class=\"btn btn-outline-primary preview_image\" style=\"display: none;\"> " +
        "<i class=\"fa fa-eye\"></i> " +
        "<div class=\"file_preview file_preview_" + random_number + "\">" +
        "<img src=\"\"></div> </span> " +
        "<span id=\"preview_file_" + random_number + "\" class=\"btn btn-outline-primary\" data-toggle=\"modal\"" +
        "data-target=\"#file_selector_" + random_number + "\" >" +
        "<i class=\"fa fa-plus\"></i></span>" +
        "<span id=\"remove_image_" + random_number + "\" class=\"btn btn-outline-primary\" style=\"display: none;\"> " +
        "<i class=\"fas fa-times\"></i></span></span> " +
        "<input id=\"file_id_" + random_number + "\" type=\"hidden\" value=\"\" name=\"dynamic_file_id_" + random_number + "[file_id]\"> " +
        "<input id=\"delete_file_id_" + random_number + "\" type=\"hidden\" value=\"no\" name=\"dynamic_file_id_" + random_number + "[delete]\"> " +
        "<input id=\"db_id_file_id" + random_number + "\" type=\"hidden\" value=\"\" name=\"dynamic_file_id_" + random_number + "[db_id]\"> " +
        "<input value='Select a file' id=\"file_full_name_" + random_number + "\" data-toggle=\"modal\" " +
        "data-target=\"#files-selector\" type=\"text\"" +
        "value=\"\" placeholder=\"\" class=\"form-control file_full_name\" disabled> </div> </div> </div> " +
        "<div id=\"file_selector_" + random_number + "\" class=\"modal fade\" role=\"dialog\"> " +
        "<div class=\"modal-dialog\"> <div class=\"modal-content\"> <div class=\"modal-header\"> " +
        "<button type=\"button\" class=\"close\" data-dismiss=\"modal\">&times;</button> " +
        "<h4 class=\"modal-title\">Select a image</h4> </div> <div class=\"files-modal-body\"> " +
        "<div class=\"row\"> <div class=\"container-fluid\"> <table class=\"table table-hover\"> " +
        "<thead> <tr> <th></th> <th>Name</th> <th>Filesize</th> <th>Created at</th> </tr> </thead> " +
        "<tbody id=\"files_string_" + random_number + "\"> " +
        "</tbody> </table> </div> </div> </div> <div class=\"modal-footer\"> " +
        "<button type=\"button\" class=\"btn btn-default\" data-dismiss=\"modal\">Close</button> </div> " +
        "</div> </div> </div>" +
        "<script>$('#preview_file_" + random_number + "').click(function () {" +
        "var view_settings_id = '" + random_number + "';" +
        "var request = $.ajax({" +
        "url: \"/qubiqx/files/api/get_images\"," +
        "data: {" +
        "'view_settings_id': view_settings_id," +
        "}" +
        "});" +
        "request.done(function (data) {" +
        "$(\"#files_string_" + random_number + "\").html(data);" +
        "});" +
        "});" +
        "$(document).on(\"click\", \".folder_tr_" + random_number + "\", function () {" +
        "var folder_id = $(this).data('folder_id');" +
        "var view_settings_id = '" + random_number + "';" +
        "var request_folder = $.ajax({" +
        "url: \"/qubiqx/files/api/get_images/\" + folder_id," +
        "data: {" +
        "'folder_id': folder_id," +
        "'view_settings_id': view_settings_id," +
        "}" +
        "});" +
        "request_folder.done(function (data) {" +
        "$(\"#files_string_" + random_number + "\").html(data);" +
        "});" +
        "});" +
        "$(document).on(\"click\", \".file_tr_" + random_number + "\", function () {" +
        "var file_id = $(this).data('file_id');" +
        "var file_full_name = $(this).data('file_full_name');" +
        "var file_name = $(this).data('file_name');" +
        "$('#preview_image_" + random_number + "').css('display', 'inline-block');" +
        "$('#remove_image_" + random_number + "').css('display', 'inline-block');" +
        "$('#preview_file_" + random_number + "').css('display', 'none');" +
        "$('#file_id_" + random_number + "').val(file_id);" +
        "$('#file_full_name_" + random_number + "').val(file_full_name);" +
        "var request_folder = $.ajax({" +
        "url: \"/qubiqx/files/api/get_file_url\"," +
        "data: {" +
        "'file_name': file_name," +
        "}" +
        "});" +
        "request_folder.done(function (data) {" +
        "$('.file_preview_" + random_number + "').html(\"<img src='\" + data + \"'>\");" +
        "});" +
        "});" +
        "$(document).on(\"click\", \"#remove_image_" + random_number + "\", function () {" +
        "$('#preview_image_" + random_number + "').css('display', 'none');" +
        "$('#remove_image_" + random_number + "').css('display', 'none');" +
        "$('#preview_file_" + random_number + "').css('display', 'inline-block');" +
        "$('#file_id_" + random_number + "').val(\"\");" +
        "$('#file_full_name_" + random_number + "').val(\"Select a file\");" +
        "$('.file_preview_" + random_number + "').html(\"\");" +
        "});</script>");
});