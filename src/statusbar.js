(function () {
	function patch() {
		const e1 = document.querySelector(".right-items");
		const e2 = document.querySelector(".right-items .__CUSTOM_CSS_JS_INDICATOR_CLS");
		if (e1 && !e2) {
			let e = document.createElement("div");
			e.id = "be5invis.vscode-custom-css";
			e.title = "Custom CSS and JS";
			e.className = "statusbar-item right __CUSTOM_CSS_JS_INDICATOR_CLS";
			e.innerHTML = `<a tabindex="-1"><span class="codicon codicon-paintcan"></span></a>`;
			e1.appendChild(e);
		}
	}
	setInterval(patch, 5000);
})();
