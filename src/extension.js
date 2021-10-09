const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const msg = require("./messages").messages;
const uuid = require("uuid");
const fetch = require("node-fetch");
const Url = require("url");

const clickableButtonCSS = `
.monaco-workbench .part.editor.has-watermark > .content.empty > .watermark {
  z-index: 1;
}
.monaco-keybinding > .monaco-keybinding-key {
  position: relative;
}
.monaco-keybinding > .monaco-keybinding-key:active {
  top: 0.2em;
}
`;

function activate(context) {
	console.log("clickable-button-hints is active!");
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
				/<!-- !! CLICKABLE-BUTTON-HINTS-SESSION-ID ([0-9a-fA-F-]+) !! -->/
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
		let html = await fs.promises.readFile(htmlFile, "utf-8");
		html = clearExistingPatches(html);

		html = html.replace(/<meta.*http-equiv="Content-Security-Policy".*>/, "");

		html = html.replace(
			/(<\/html>)/,
			`<!-- !! CLICKABLE-BUTTON-HINTS-SESSION-ID ${uuidSession} !! -->\n` +
				"<!-- !! CLICKABLE-BUTTON-HINTS-START !! -->\n" +
				`<style>${clickableButtonCSS}</style>` +
				"<!-- !! CLICKABLE-BUTTON-HINTS-END !! -->\n</html>"
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
			/<!-- !! CLICKABLE-BUTTON-HINTS-START !! -->[\s\S]*?<!-- !! CLICKABLE-BUTTON-HINTS-END !! -->\n*/,
			""
		);
		html = html.replace(/<!-- !! CLICKABLE-BUTTON-HINTS-SESSION-ID [\w-]+ !! -->\n*/g, "");
		return html;
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

	const installClickableButtonHints = vscode.commands.registerCommand(
		"extension.installClickableButtonHints",
		cmdInstall
	);
	const uninstallClickableButtonHints = vscode.commands.registerCommand(
		"extension.uninstallClickableButtonHints",
		cmdUninstall
	);
	const updateClickableButtonHints = vscode.commands.registerCommand(
		"extension.updateClickableButtonHints",
		cmdReinstall
	);

	context.subscriptions.push(installClickableButtonHints);
	context.subscriptions.push(uninstallClickableButtonHints);
	context.subscriptions.push(updateClickableButtonHints);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}
exports.deactivate = deactivate;
