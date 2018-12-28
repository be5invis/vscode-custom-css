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

   **VERY IMPORTANT**: Items in `vscode_custom_css.imports` must be **URL**s. Plain file paths are **NOT URLs**.

   - **Windows File URL Example**: `file:///C:/Users/MyUserName/Documents/custom.css`
     - The `C:/` part is **REQUIRED.**

   - **MacOS and Linux File URL Example**: `file:///Users/MyUserName/Documents/custom.css`
   - [See here](https://en.wikipedia.org/wiki/File_URI_scheme) for more details.

3. Restart VSCode with proper permission to modify itself:

   1. **Windows**: Restart with Administrator Permission.

   2. **MacOS and Linux**: See instructions below.

4. Activate command "Reload Custom CSS and JS".

5. Restart.


## Extension commands

As you know to access the command palette and introduce commands you can use ***F1*** (all OS), ***Ctrl+Shift+P*** (Windows & Linux) or ***Cmd+Shift+P*** (OS X).

- ***Enable Custom CSS and JS*** : It enables custom CSS and JS URLs listed in “`vscode_custom_css.imports`”, an array containing URLs of your custom CSS and JS files, in your user settings.
- ***Disable Custom CSS and JS***: It will disable custom CSS.
- ***Reload Custom CSS and JS***: Disable and then re-enable it.

## Windows users

**In Windows, make sure you run your VS Code in Administrator mode before enabling or disabling your custom style!**

## Mac and Linux users
**The extension would NOT if Code cannot modify itself.** The cases include:

- Code files being read-only, like on a read-only file system or,
- Code is not started with the permissions to modify itself.

**You need to claim ownership on Code's installation directory, by running this command**:

```sh
sudo chown -R $(whoami) <Path to Code>
```

The placeholder `<Path to Code>` means the path to VSCode installation. It is typically:

- `/Applications/Visual Studio Code.app/Contents/MacOS/Electron`, on MacOS;
- `/Applications/Visual Studio Code - Insiders.app/Contents/MacOS/Electron`, on MacOS when using Insiders branch;
- `/usr/share/code`, on most Linux;
- `/opt/visual-studio-code/` on Arch Linux.

Mac and Linux package managers may have customized installation path. Please double check your path is correct.

# Disclaimer

This extension modifies some VS Code files so use it at your own risk.
Currently, icons are not supported by the extension functionality that VS Code provides so this extension solves this issue by injecting code into:

- `electron-browser/index.html`.

The extension will keep a copy of the original file in case something goes wrong. That's what the disable command will do for you.

As this extension modifies VS Code files it will get disabled with every VS Code update. You will have to enable icons again via command palette.

Take into account that this extension is still in beta so you may find some bugs while playing with it. Please, report them to [the issues section of the Github's repo](https://github.com/be5invis/vscode-custom-css/issues).

**Please, leave a review if you can so the VS Code Team can know that this is a very demanded feature and, maybe, they can then provide a proper way to extend the IDE regarding icons and customizations soon enough. ;D**

More file extensions will be supported shortly!
