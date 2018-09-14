# Kendryte IDE

Based on a wonderful editor: [VS Code](https://code.visualstudio.com)

## Install
#### On RHEL(fedora/centos):
```bash
bash ./my-scripts/prepare-development.sh
```
#### On Debian(Ubuntu):
	// TODO
#### On Windows:
***Do not install nodejs on your system (make sure no node.exe in PATH)***
* [Cygwin64](https://cygwin.com/install.html), with package: **(Do Not Install Python And Nodejs From Cygwin)**
 `coreutils`
 `git`
 `unzip`
 `p7zip`
 `grep`
 `sed`
 `wget`
 `curl`
 `tar`
 `xz`

## Run From Source (Windows)
(from cygwin window)
1. install dependencies
	```bash
	bash ./my-scripts/pack-windows.sh
	```
1. watch src change and compile:
	```bash
	bash ./my-scripts/start-watch-windows.sh
	```
1. double click `scripts/code.bat` in file explorer

*No `yarn add`, modify `package.json` by hand, and run `bash ./my-scripts/pack-windows.sh`*

## Run From Source (Linux & Mac)
1. install dependencies
	```bash
	yarn
	```
1. run:
	```bash
	bash ./my-scripts/start-tmux.sh
	```

#### Run From Source Note:
1. you must have a "workspace" like this:
```
📁New Folder *<-- the "workspace"*
   📁 kendryte-ide *<-- this project*
   📁 HOME *<-- this will auto create during run*
```
1. you need an user:
	* non-root (linux)
	* have write permission to the "workspace"


## Make Release

To make a release, you only need to download source code, no install needed.

```bash
bash ./my-scripts/build-windows.sh
# Or
bash ./my-scripts/build-linux.sh
```

Compressed release file will in .release folder.
`.rpm`/`.deb`/`.msi` files will not generate.

## License

Copyright (c) Microsoft Corporation. All rights reserved.

Licensed under the [MIT](LICENSE.txt) License.