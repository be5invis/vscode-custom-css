# Custom CSS

Custom CSS to your VS Code. Based on [robertohuertasm](https://github.com/robertohuertasm)’s [vscode-icons](https://github.com/robertohuertasm/vscode-icons).

![screenshot](https://raw.githubusercontent.com/be5invis/vscode-custom-css/master/screenshot.png)(Yes, it can co-exist with [vscode-icons](https://github.com/robertohuertasm/vscode-icons).)

## Installation

Some people have reported that they cannot find the extension when they insert the installation command:
```
ext install vscode-custom-css
```

## Extension commands

As you know to access the command palette and introduce commands you can use ***F1*** (all OS), ***Ctrl+Shift+P*** (Windows & Linux) or ***Cmd+Shift+P*** (OS X).

- ***Enable Custom CSS*** : It enables custom CSS from:
  - File path configured in “`vscode_custom_css.file`” option.
  - Web or local URL configured in “`vscode_custom_css.import`” option. This importing mechanism uses `@import` and the CSS is placed before the original one, so use `!import` often to elevate its priority.

- ***Disable Custom CSS***: It will disable custom CSS.

##Windows users

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

- workbench.main.css

The extension will keep a copy of the original file in case something goes wrong. That's what the disable command will do for you.

As this extension modifies VS Code files it will get disabled with every VS Code update. You will have to enable icons again via command palette.

Take into account that this extension is still in beta so you may find some bugs while playing with it. Please, report them to [the issues section of the Github's repo](https://github.com/be5invis/vscode-custom-icons/issues).

**Please, leave a review if you can so the VS Code Team can know that this is a very demanded feature and, maybe, they can then provide a proper way to extend the IDE regarding icons and customizations soon enough. ;D**

More file extensions will be supported shortly!
