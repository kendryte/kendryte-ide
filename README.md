# Kendryte IDE

Based on a wonderful editor: [VS Code](https://code.visualstudio.com)

## Install
#### On Linux
install with your package manager: (`-dev` insteadof `-devel` on Ubuntu)
```text
bash tmux wget curl tar xz findutils git
make gcc-c++ libstdc++ gtk2 libXtst libXScrnSaver GConf2 alsa-lib
libsecret-devel libX11-devel libxkbfile-devel
wqy-zenhei-fonts wqy-unibit-fonts wqy-bitmap-fonts # locale font
```

*If you use any desktop environment, you probably already installed all of them*

#### On Windows:
* git for windows (must install in PATH).
* [Cygwin64](https://cygwin.com/install.html), with package:
 `coreutils`
 `unzip`
 `grep`
 `sed`
 `wget`
 `curl`
 `tar`
 `xz`

*In theory, any bash env with these packages is ok, but not tested*

#### On MacOS:
```bash
brew install coreutils findutils gnu-tar gnu-sed gawk gnutls gnu-indent gnu-getopt wget md5sha1sum
```


## Run From Source
1. Open a terminal. (cygwin terminal on windows)
1. get source and chdir into: `git clone git@github.com:kendryte/kendryte-ide.git && cd kendryte-ide`
1. install dependencies: `bash ./my-scripts/prepare-development.sh`
1. watch src change and compile: `bash ./my-scripts/start-watch.sh`
1. after watch print success, open another cygwin window.
1. start main app: `bash ./my-scripts/start-code.sh`

#### Warning On Windows:
DO NOT use `yarn add`s.
modify `package.json` by hand, and run `bash ./my-scripts/pack-windows.sh` again.

#### Warning On Linux:
`start-code.sh` must run without root. If you are using root, run `sudo -u NormalUser bash ./my-scripts/start-code.sh` instead.

#### Note On Both platform:
1. you must have a "workspace" like this:
```
📁 New Folder *<-- the "workspace"*
   📁 kendryte-ide *<-- this project*
   📁 HOME *<-- this will auto create during run*
```
1. you need an user with write permission to the "workspace" and all sub directories


## Make Release

To make a release, you only need to download source code, no install needed.

```bash
bash ./my-scripts/build-windows.sh
# Or
bash ./my-scripts/build-linux.sh
```

Compressed release file will in .release folder.
`.rpm`/`.deb`/`.msi` files will not generate.

## Follow upstream (https://github.com/Microsoft/vscode) update:
```bash
bash ./my-scripts/follow-upstream.sh
```
Then use IDE merge "microsoft" branch into "development".
Check override of edits in vscode source after merge.

## License

Copyright (c) Microsoft Corporation. All rights reserved.

Licensed under the [MIT](LICENSE.txt) License.