var Dialog = require('../components/dialog/dialog');
var dialog = new Dialog(2000);

$('[data-btn="apply"]').on('click', function ( e ) {
    var $target = $(e.target);
    var is_apply = $target.hasClass('success');

    if ( !is_apply ) {
        $target.addClass('success');
        dialog.tips('报名成功，稍后会有工作人员跟您联系。');
    };
});