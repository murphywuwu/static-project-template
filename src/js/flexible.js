!(function (root) {
    var docEl = document.documentElement,
        timer = null,
        width, last;
    var meta=document.getElementsByTagName("meta")[1];
    var dpr = window.devicePixelRatio;

    // iOS，对于2和3的屏，用2倍的方案，其余的用1倍方案
    var isAndroid = window.navigator.appVersion.match(/android/gi);
    var isIPhone = window.navigator.appVersion.match(/iphone/gi);
    var devicePixelRatio = window.devicePixelRatio;
    if (isIPhone) {
       // iOS下，对于2和3的屏，用2倍的方案，其余的用1倍方案
       if (devicePixelRatio >= 3 && (!dpr || dpr >= 3)) {
           dpr = 3;
       } else if (devicePixelRatio >= 2 && (!dpr || dpr >= 2)){
           dpr = 2;
       } else {
           dpr = 1;
       }
    } else {
       // 其他设备下，仍旧使用1倍的方案
       dpr = 1;
    }

    function changeRem () {

        docEl.setAttribute('data-dpr', dpr);
        width = docEl.getBoundingClientRect().width;

        if (last === width) { return; }
        last = width;

        if ( width > 540 ) {
          width = 640;
          docEl.style.width = 640 + 'px';
          docEl.style.marginLeft = 'auto';
          docEl.style.marginRight = 'auto';
        }

        root.rem = width / 20;

        // 中兴U930_TD
        if (/ZTE U930_TD/.test(navigator.userAgent)) {
            root.rem = root.rem * 1.13;

            // 华为P8Max
        } else if (/HUAWEI P8max/i.test(navigator.userAgent) && !/alipay/i.test(navigator.userAgent)) {
            root.rem = root.rem / 1.15;
        }
        docEl.style.fontSize = root.rem + 'px';
    }

    changeRem();

    root.addEventListener('resize', function () {
        clearTimeout(timer);
        timer = setTimeout(changeRem, 300);
    });

    root.addEventListener('orientationchange', function () {
        clearTimeout(timer);
        timer = setTimeout(changeRem, 300);
    });
}(window,undefined));
