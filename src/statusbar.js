(function () {
    function patch() {
        const e1 = document.querySelector('#workbench\\.parts\\.statusbar');
        const e2 = document.querySelector('#workbench\\.parts\\.statusbar > .__CUSTOM_CSS_JS_INDICATOR_CLS');
        if (e1 && !e2) {
            let e = document.createElement('span');
            e.className = 'statusbar-item right __CUSTOM_CSS_JS_INDICATOR_CLS';
            e.innerHTML = `<i class="octicon octicon-paintcan"></i>`;
            e1.appendChild(e)
        }
    };
    setInterval(patch, 5000)
})();