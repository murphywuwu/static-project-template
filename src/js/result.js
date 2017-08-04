var Dialog = require('../components/dialog/dialog');
var dialog = new Dialog(2000);

$('[data-btn="apply"]').on('click', function () {
    dialog.tips('报名成功，稍后会有工作人员跟您联系。');
});