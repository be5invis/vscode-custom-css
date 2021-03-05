const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const msg = require("./messages").messages;
const mkdirp = require("mkdirp");
const uuid = require("uuid");
const fetch = require("node-fetch");
const Url = require("url");
const rmfr = require("rmfr");

function activate(context) {
	console.log("vscode-custom-css is active!");

	process.on("uncaughtException", function (err) {
		if (/ENOENT|EACCES|EPERM/.test(err.code)) {
			vscode.window.showInformationMessage(msg.admin);
			return;
		}
	});

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

	async function fInstall() {
		await deleteBackupFiles();
		const uuidSession = uuid.v4();
		await fs.promises.copyFile(htmlFile, BackupFilePath(uuidSession));
		await performPatch(uuidSession);
	}

	function fUpdate() {
		return fUninstallImpl(true);
	}

	function fUninstall() {
		return fUninstallImpl(false);
	}

	async function fUninstallImpl(willReinstall) {
		try {
			await fs.promises.stat(htmlFile);
		} catch (errHtml) {
			return vscode.window.showInformationMessage(msg.somethingWrong + errHtml);
		}
		const backupUuid = await getBackupUuid(htmlFile);
		if (!backupUuid) {
			await uninstallComplete(true, willReinstall);
			return;
		}

		const backupPath = BackupFilePath(backupUuid);
		try {
			await fs.promises.stat(backupPath);
			await restoreBak(backupPath, willReinstall);
		} catch (e) {
			await uninstallComplete(true, willReinstall);
		}
	}

	// #### Support commands ######################################################

	async function getBackupUuid(fp) {
		const htmlContent = await fs.promises.readFile(fp, "utf-8");
		const m = htmlContent.match(/<!-- !! VSCODE-CUSTOM-CSS-SESSION-ID ([0-9a-fA-F-]+) !! -->/);
		if (!m) return null;
		else return m[1];
	}

	async function performPatch(uuidSession) {
		const config = vscode.workspace.getConfiguration("vscode_custom_css");
		if (!patchIsProperlyConfigured(config)) {
			return vscode.window.showInformationMessage(msg.notConfigured);
		}

		let html = await fs.promises.readFile(htmlFile, "utf-8");
		html = clearExistingPatches(html);

		const staging = await createStagingDir(uuidSession);

		const injectHTML = await patchHtml(staging, config);
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
	async function createStagingDir(uuidSession) {
		const stagingDirBase = path.resolve(__dirname, "../.staging-custom-css");
		await rmfr(stagingDirBase);
		const staging = path.resolve(stagingDirBase, uuidSession);
		await mkdirp(staging);
		return staging;
	}
	async function patchHtml(staging, config) {
		let res = "";
		for (const item of config.imports) {
			const imp = await patchHtmlForItem(staging, item);
			if (imp) res += imp;
		}
		return res;
	}
	async function patchHtmlForItem(staging, url) {
		if (!url) return "";
		if (typeof url !== "string") return "";

		// Copy the resource to a staging directory inside the extension dir
		let parsed = new Url.URL(url);
		const ext = path.extname(parsed.pathname);

		const uuidFile = uuid.v4();
		try {
			const fetched = await getContent(url);
			const tempPath = path.resolve(staging, uuidFile + ext);
			await fs.promises.writeFile(tempPath, fetched);
			if (ext === ".css") {
				return `<link rel="stylesheet" href="${Url.pathToFileURL(tempPath)}"/>\n`;
			} else if (ext === ".js") {
				return `<script src="${Url.pathToFileURL(tempPath)}"></script>\n`;
			} else {
				console.log(`Unsupported extension type: ${ext}`);
			}
		} catch (e) {
			vscode.window.showInformationMessage(msg.cannotLoad(url));
			console.log(e);
		}
	}
	async function getIndicatorJs() {
		return `<script src="${Url.pathToFileURL(`${__dirname}/statusbar.js`)}"></script>\n`;
	}

	async function uninstallComplete(succeeded, willReinstall) {
		if (!succeeded) return;
		if (willReinstall) {
			await fInstall();
		} else {
			await deleteBackupFiles();
			disabledRestart();
		}
	}

	async function restoreBak(backupFilePath, willReinstall) {
		try {
			await fs.promises.unlink(htmlFile);
		} catch (e) {
			return vscode.window.showInformationMessage(msg.admin);
		}

		await fs.promises.copyFile(backupFilePath, htmlFile);
		await uninstallComplete(true, willReinstall);
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

	const installCustomCSS = vscode.commands.registerCommand("extension.installCustomCSS", () =>
		fInstall()
	);
	const uninstallCustomCSS = vscode.commands.registerCommand("extension.uninstallCustomCSS", () =>
		fUninstall()
	);
	const updateCustomCSS = vscode.commands.registerCommand("extension.updateCustomCSS", () =>
		fUpdate()
	);

	context.subscriptions.push(installCustomCSS);
	context.subscriptions.push(uninstallCustomCSS);
	context.subscriptions.push(updateCustomCSS);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}
exports.deactivate = deactivate;
