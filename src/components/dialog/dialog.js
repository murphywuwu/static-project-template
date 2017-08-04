class Dialog {
    constructor ( time ) {
        this.el_dialog = $('[data-dialog]');
        this.el_dialog_msg = $('[data-msg]');

        this.time = time;
    }
    show () {
        this.el_dialog.removeClass('hide');
        this.delay();
    }
    hide () {
        this.el_dialog.addClass('hide');
    }
    delay () {
        setTimeout( this.hide.bind(this), this.time )
    }
    tips ( msg ) {
        this.el_dialog_msg.text(msg);
        this.show();
    }
}

module.exports = Dialog;