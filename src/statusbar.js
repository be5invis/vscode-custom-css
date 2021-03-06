/* eslint-env browser */
(function () {
	function patch() {
		const e1 = document.querySelector(".right-items");
		const e2 = document.querySelector(".right-items .__CUSTOM_CSS_JS_INDICATOR_CLS");
		if (e1 && !e2) {
			let e = document.createElement("div");
			e.id = "be5invis.vscode-custom-css";
			e.title = "Custom CSS and JS";
			e.className = "statusbar-item right __CUSTOM_CSS_JS_INDICATOR_CLS";
			{
				const a = document.createElement("a");
				a.tabIndex = -1;
				{
					const span = document.createElement("span");
					span.className = "codicon codicon-paintcan";
					a.appendChild(span);
				}
				e.appendChild(a);
			}
			e1.appendChild(e);
		}
	}
	setInterval(patch, 5000);
})();
