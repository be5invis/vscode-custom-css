# Custom CSS and JS

### **SPECIAL NOTE: If Code complains about that it is corrupted, simply click “Don't show again”.**
### **NOTE: Every time after Code is updated, please re-enable Custom CSS.**
### **NOTE: Every time you change the configuration, please re-enable Custom CSS.**

Custom CSS to your VS Code. Based on [robertohuertasm](https://github.com/robertohuertasm)’s [vscode-icons](https://github.com/robertohuertasm/vscode-icons).

![screenshot](https://raw.githubusercontent.com/be5invis/vscode-custom-css/master/screenshot.png)

## Getting Started

1. Install this extension.

2. Add to `settings.json`:

   ```json
       "vscode_custom_css.imports": [""],
       "vscode_custom_css.policy": true,
   ```

   **VERY IMPORTANT**: Items in `vscode_vustom_css.imports` must be **URL**s. Plain file paths are **NOT URLs**.

3. Restart VSCode with proper permission to modify itself:

   1. **Windows**: Restart with Administrator Permission.

   2. **Mac**: Close the VSCode and open the terminal and run a command. Then restart VSCode.

      For VSCode:

      ```shell
      sudo chown -R $(whoami) '/Applications/Visual Studio Code.app/Contents/MacOS/Electron'
      ```

      For VSCode Insiders:

      ```shell
      sudo chown -R $(whoami) '/Applications/Visual Studio Code - Insiders.app/Contents/MacOS/Electron'
      ```

   3. **Linux**: Close the VSCode and open the terminal and run a command. Then restart VSCode.

      For VSCode:

      ```bash
      sudo chown -R $(whoami) /usr/share/code
      ```

      For VSCode Insiders:

      ```bash
      sudo chown -R $(whoami) /usr/share/code-insiders
      ```

4. Activate command "Reload Custom CSS and JS".

5. Restart.


## Extension commands

As you know to access the command palette and introduce commands you can use ***F1*** (all OS), ***Ctrl+Shift+P*** (Windows & Linux) or ***Cmd+Shift+P*** (OS X).

- ***Enable Custom CSS and JS*** : It enables custom CSS and JS URLs listed in “`vscode_custom_css.imports`”, an array containing URLs of your custom CSS and JS files, in your user settings.
  - **IMPORTANT**: Items in “`vscode_custom_css.imports`” should be URLs, instead of file paths. For local files, prefix it with “`file://`”.
- ***Disable Custom CSS and JS***: It will disable custom CSS.
- ***Reload Custom CSS and JS***: Disable and then re-enable it.

## Windows users

**In Windows, make sure you run your VS Code in Administrator mode before enabling or disabling your custom style!**

## Linux users
**Linux also requires you to reclaim ownership of the vs code folders** 
You can achieve this by executing this on your terminal (Ubuntu):
```sh
#for vs code:
sudo chown -R $(whoami) /usr/share/code
#for vs code insiders:
sudo chown -R $(whoami) /usr/share/code-insiders
#if you want to check your folder's owner:
ls -la /usr/share/code
#if you want to rollback this permissions back to root:
sudo chown -R root /usr/share/code
```

# Disclaimer
This extension modifies some VS Code files so use it at your own risk.
Currently, icons are not supported by the extension functionality that VS Code provides so this extension solves this issue by injecting code into:

- `electron-browser/index.html`.

The extension will keep a copy of the original file in case something goes wrong. That's what the disable command will do for you.

As this extension modifies VS Code files it will get disabled with every VS Code update. You will have to enable icons again via command palette.

Take into account that this extension is still in beta so you may find some bugs while playing with it. Please, report them to [the issues section of the Github's repo](https://github.com/be5invis/vscode-custom-css/issues).

**Please, leave a review if you can so the VS Code Team can know that this is a very demanded feature and, maybe, they can then provide a proper way to extend the IDE regarding icons and customizations soon enough. ;D**

More file extensions will be supported shortly!
