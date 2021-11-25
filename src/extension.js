const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const msg = require("./messages").messages;
const uuid = require("uuid");
const fetch = require("node-fetch");
const Url = require("url");

function activate(context) {
	console.log("vscode-custom-css is active!");
	console.log(require.main.filename);
	const appDir = path.dirname(require.main.filename);
	const base = path.join(appDir, "vs", "code");
	const htmlFile = path.join(base, "electron-browser", "workbench", "workbench.html");
	const BackupFilePath = uuid =>
		path.join(base, "electron-browser", "workbench", `workbench.${uuid}.bak-custom-css`);

	async function getContent(url) {
		if (/^file:/.test(url)) {
			const fp = Url.fileURLToPath(url);
			return await fs.promises.readFile(fp);
		} else {
			const response = await fetch(url);
			return response.buffer();
		}
	}

	// ####  main commands ######################################################

	async function cmdInstall() {
		const uuidSession = uuid.v4();
		await createBackup(uuidSession);
		await performPatch(uuidSession);
	}

	async function cmdReinstall() {
		await uninstallImpl();
		await cmdInstall();
	}

	async function cmdUninstall() {
		await uninstallImpl();
		disabledRestart();
	}

	async function uninstallImpl() {
		const backupUuid = await getBackupUuid(htmlFile);
		if (!backupUuid) return;
		const backupPath = BackupFilePath(backupUuid);
		await restoreBackup(backupPath);
		await deleteBackupFiles();
	}

	// #### Backup ################################################################

	async function getBackupUuid(htmlFilePath) {
		try {
			const htmlContent = await fs.promises.readFile(htmlFilePath, "utf-8");
			const m = htmlContent.match(
				/<!-- !! VSCODE-CUSTOM-CSS-SESSION-ID ([0-9a-fA-F-]+) !! -->/
			);
			if (!m) return null;
			else return m[1];
		} catch (e) {
			vscode.window.showInformationMessage(msg.somethingWrong + e);
			throw e;
		}
	}

	async function createBackup(uuidSession) {
		try {
			let html = await fs.promises.readFile(htmlFile, "utf-8");
			html = clearExistingPatches(html);
			await fs.promises.writeFile(BackupFilePath(uuidSession), html, "utf-8");
		} catch (e) {
			vscode.window.showInformationMessage(msg.admin);
			throw e;
		}
	}

	async function restoreBackup(backupFilePath) {
		try {
			if (fs.existsSync(backupFilePath)) {
				await fs.promises.unlink(htmlFile);
				await fs.promises.copyFile(backupFilePath, htmlFile);
			}
		} catch (e) {
			vscode.window.showInformationMessage(msg.admin);
			throw e;
		}
	}

	async function deleteBackupFiles() {
		const htmlDir = path.dirname(htmlFile);
		const htmlDirItems = await fs.promises.readdir(htmlDir);
		for (const item of htmlDirItems) {
			if (item.endsWith(".bak-custom-css")) {
				await fs.promises.unlink(path.join(htmlDir, item));
			}
		}
	}

	// #### Patching ##############################################################

	async function performPatch(uuidSession) {
		const config = vscode.workspace.getConfiguration("vscode_custom_css");
		if (!patchIsProperlyConfigured(config)) {
			return vscode.window.showInformationMessage(msg.notConfigured);
		}

		let html = await fs.promises.readFile(htmlFile, "utf-8");
		html = clearExistingPatches(html);

		const injectHTML = await patchHtml(config);
		html = html.replace(/<meta.*http-equiv="Content-Security-Policy".*>/, "");

		let indicatorJS = "";
		if (config.statusbar) indicatorJS = await getIndicatorJs();

		html = html.replace(
			/(<\/html>)/,
			`<!-- !! VSCODE-CUSTOM-CSS-SESSION-ID ${uuidSession} !! -->\n` +
				"<!-- !! VSCODE-CUSTOM-CSS-START !! -->\n" +
				indicatorJS +
				injectHTML +
				"<!-- !! VSCODE-CUSTOM-CSS-END !! -->\n</html>"
		);
		try {
			await fs.promises.writeFile(htmlFile, html, "utf-8");
		} catch (e) {
			vscode.window.showInformationMessage(msg.admin);
			disabledRestart();
		}
		enabledRestart();
	}
	function clearExistingPatches(html) {
		html = html.replace(
			/<!-- !! VSCODE-CUSTOM-CSS-START !! -->[\s\S]*?<!-- !! VSCODE-CUSTOM-CSS-END !! -->\n*/,
			""
		);
		html = html.replace(/<!-- !! VSCODE-CUSTOM-CSS-SESSION-ID [\w-]+ !! -->\n*/g, "");
		return html;
	}

	function patchIsProperlyConfigured(config) {
		return config && config.imports && config.imports instanceof Array;
	}

	async function patchHtml(config) {
		let res = "";
		for (const item of config.imports) {
			const imp = await patchHtmlForItem(item);
			if (imp) res += imp;
		}
		return res;
	}
	async function patchHtmlForItem(url) {
		if (!url) return "";
		if (typeof url !== "string") return "";

		// Copy the resource to a staging directory inside the extension dir
		let parsed = new Url.URL(url);
		const ext = path.extname(parsed.pathname);

		try {
			const fetched = await getContent(url);
			if (ext === ".css") {
				return `<style>${fetched}</style>`;
			} else if (ext === ".js") {
				return `<script>${fetched}</script>`;
			} else {
				console.log(`Unsupported extension type: ${ext}`);
			}
		} catch (e) {
			console.error(e);
			vscode.window.showWarningMessage(msg.cannotLoad(url));
			return "";
		}
	}
	async function getIndicatorJs() {
		let indicatorJsPath;
		let ext = vscode.extensions.getExtension("be5invis.vscode-custom-css");
		if (ext && ext.extensionPath) {
			indicatorJsPath = path.resolve(ext.extensionPath, "src/statusbar.js");
		} else {
			indicatorJsPath = path.resolve(__dirname, "statusbar.js");
		}
		const indicatorJsContent = await fs.promises.readFile(indicatorJsPath, "utf-8");
		return `<script>${indicatorJsContent}</script>`;
	}

	function reloadWindow() {
		// reload vscode-window
		vscode.commands.executeCommand("workbench.action.reloadWindow");
	}
	function enabledRestart() {
		vscode.window
			.showInformationMessage(msg.enabled, { title: msg.restartIde })
			.then(reloadWindow);
	}
	function disabledRestart() {
		vscode.window
			.showInformationMessage(msg.disabled, { title: msg.restartIde })
			.then(reloadWindow);
	}

	const installCustomCSS = vscode.commands.registerCommand(
		"extension.installCustomCSS",
		cmdInstall
	);
	const uninstallCustomCSS = vscode.commands.registerCommand(
		"extension.uninstallCustomCSS",
		cmdUninstall
	);
	const updateCustomCSS = vscode.commands.registerCommand(
		"extension.updateCustomCSS",
		cmdReinstall
	);

	context.subscriptions.push(installCustomCSS);
	context.subscriptions.push(uninstallCustomCSS);
	context.subscriptions.push(updateCustomCSS);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}
exports.deactivate = deactivate;
