var vscode = require('vscode');
var fs = require('fs');
var path = require('path');
var events = require('events');
var msg = require('./messages').messages;
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

var fileUrl = require('file-url');

function activate(context) {

	console.log('vscode-customcss is active!');

	process.on('uncaughtException', function (err) {
		if (/ENOENT|EACCES|EPERM/.test(err.code)) {
			vscode.window.showInformationMessage(msg.admin);
			return;
		}
	});

	var eventEmitter = new events.EventEmitter();
	var isWin = /^win/.test(process.platform);
	var appDir = path.dirname(require.main.filename);

	var base = appDir + (isWin ? '\\vs\\code' : '/vs/code');

	var htmlFile = base + (isWin ? '\\electron-browser\\workbench\\workbench.html' : '/electron-browser/workbench/workbench.html');
	var htmlFileBack = base + (isWin ? '\\electron-browser\\workbench\\workbench.html.bak-customcss' : '/electron-browser/workbench/workbench.bak-customcss');

	function httpGet(theUrl)
	{
		var xmlHttp = null;

		xmlHttp = new XMLHttpRequest();
		xmlHttp.open( "GET", theUrl, false );
		xmlHttp.send( null );
		return xmlHttp.responseText;
	}

	function replaceCss() {
		var config = vscode.workspace.getConfiguration("vscode_custom_css");
		console.log(config);
		if (!config || !config.imports || !(config.imports instanceof Array)) {
			vscode.window.showInformationMessage(msg.notconfigured);
			console.log(msg.notconfigured);
			fUninstall();
			return;
		};
		var injectHTML = config.imports.map(function (x) {
			if (!x) return;
			if (typeof x === 'string') {
				if (/^file.*\.js$/.test(x)) return '<script src="' + x + '"></script>';
				if (/^file.*\.css$/.test(x)) return '<link rel="stylesheet" href="' + x + '"/>';
				if (/^http.*\.js$/.test(x)) return '<script>' + httpGet(x) + '</script>';
				if (/^http.*\.css$/.test(x)) return '<style>' + httpGet(x) + '</style>';
			}
		}).join('');
		try {
			var html = fs.readFileSync(htmlFile, 'utf-8');
			html = html.replace(/<!-- !! VSCODE-CUSTOM-CSS-START !! -->[\s\S]*?<!-- !! VSCODE-CUSTOM-CSS-END !! -->/, '');

			if (config.policy) {
				html = html.replace(/<meta.*http-equiv="Content-Security-Policy".*>/, '');
			}

			var indicatorClass = ''
			var indicatorJS = ''
			if (config.statusbar){
				indicatorClass = '__CUSTOM_CSS_JS_INDICATOR_CLS'
				indicatorJS = `<script src="${fileUrl(__dirname + '/statusbar.js')}"></script>`
			}

			html = html.replace(/(<\/html>)/,
				'<!-- !! VSCODE-CUSTOM-CSS-START !! -->' + indicatorJS + injectHTML + '<!-- !! VSCODE-CUSTOM-CSS-END !! --></html>');
			fs.writeFileSync(htmlFile, html, 'utf-8');
			enabledRestart();
		} catch (e) {
			console.log(e);
		}
	}

	function timeDiff(d1, d2) {
		var timeDiff = Math.abs(d2.getTime() - d1.getTime());
		return timeDiff;
	}

	function hasBeenUpdated(stats1, stats2) {
		var dbak = new Date(stats1.ctime);
		var dor = new Date(stats2.ctime);
		var segs = timeDiff(dbak, dor) / 1000;
		return segs > 60;
	}

	function cleanCssInstall() {
		var c = fs.createReadStream(htmlFile).pipe(fs.createWriteStream(htmlFileBack));
		c.on('finish', function () {
			replaceCss();
		});
	}

	function installItem(bakfile, orfile, cleanInstallFunc) {
		fs.stat(bakfile, function (errBak, statsBak) {
			if (errBak) {
				// clean installation
				cleanInstallFunc();
			} else {
				// check htmlFileBack's timestamp and compare it to the htmlFile's.
				fs.stat(orfile, function (errOr, statsOr) {
					if (errOr) {
						vscode.window.showInformationMessage(msg.smthingwrong + errOr);
					} else {
						var updated = hasBeenUpdated(statsBak, statsOr);
						if (updated) {
							// some update has occurred. clean install
							cleanInstallFunc();
						}
					}
				});
			}
		});
	}

	function emitEndUninstall() {
		eventEmitter.emit('endUninstall');
	}

	function restoredAction(isRestored, willReinstall) {
		if (isRestored >= 1) {
			if (willReinstall) {
				emitEndUninstall();
			} else {
				disabledRestart();
			}
		}
	}

	function restoreBak(willReinstall) {
		var restore = 0;
		fs.unlink(htmlFile, function (err) {
			if (err) {
				vscode.window.showInformationMessage(msg.admin);
				return;
			}
			var c = fs.createReadStream(htmlFileBack).pipe(fs.createWriteStream(htmlFile));
			c.on('finish', function () {
				fs.unlinkSync(htmlFileBack);
				restore++;
				restoredAction(restore, willReinstall);
			});
		});
	}

	function reloadWindow() {
		// reload vscode-window
		vscode.commands.executeCommand("workbench.action.reloadWindow");
	}

	function enabledRestart() {
		vscode.window.showInformationMessage(msg.enabled, { title: msg.restartIde })
			.then(function (msg) {
				reloadWindow();
			});
	}
	function disabledRestart() {
		vscode.window.showInformationMessage(msg.disabled, { title: msg.restartIde })
			.then(function (msg) {
				reloadWindow();
			});
	}

	// ####  main commands ######################################################

	function fInstall() {
		installItem(htmlFileBack, htmlFile, cleanCssInstall);
	}

	function fUninstall(willReinstall) {
		fs.stat(htmlFileBack, function (errBak, statsBak) {
			if (errBak) {
				if (willReinstall) {
					emitEndUninstall();
				}
				return;
			}
			fs.stat(htmlFile, function (errOr, statsOr) {
				if (errOr) {
					vscode.window.showInformationMessage(msg.smthingwrong + errOr);
				} else {
					restoreBak(willReinstall);
				}
			});
		});
	}

	function fUpdate() {
		eventEmitter.once('endUninstall', fInstall);
		fUninstall(true);
	}

	var installCustomCSS = vscode.commands.registerCommand('extension.installCustomCSS', fInstall);
	var uninstallCustomCSS = vscode.commands.registerCommand('extension.uninstallCustomCSS', fUninstall);
	var updateCustomCSS = vscode.commands.registerCommand('extension.updateCustomCSS', fUpdate);

	context.subscriptions.push(installCustomCSS);
	context.subscriptions.push(uninstallCustomCSS);
	context.subscriptions.push(updateCustomCSS);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
