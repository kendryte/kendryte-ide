# Maix IDE

Based on a wonderful editor: [VS Code](https://code.visualstudio.com) 

## Install
#### On RHEL(fedora/centos): 
```bash
bash ./my-scripts/prepare-development.sh
```
#### On Debian(Ubuntu):
	// TODO
#### On Windows:
* Nodejs from [nodejs download page](https://nodejs.org/dist/latest-v8.x/), download and install file named `node-v8.x.x-x64.msi`, you need `√ Add to Path`.
* Open a **PowerShell** with **Administrator** permission and run:
	```powershell
	npm install -g yarn
	npm install -g --add-python-to-path windows-build-tools
	```
* [Cygwin64](https://cygwin.com/install.html), with package: **(Do Not Install Python And Nodejs From Cygwin)**    
 `coreutils`
 `tmux`
 `git`
 `unzip`
 `p7zip`
 `grep`
 `sed` 
 `wget`
 `curl`
 `tar`
 `xz`
 
## Run From Source
1. install dependencies
	```bash
	yarn
	```
1. run
	```bash
	bash ./my-scripts/start-tmux.sh
	```

## Release

After install, you can run: (no `yarn install` is need)

```bash
bash ./my-scripts/build-windows.sh
# Or
bash ./my-scripts/build-linux.sh
```

Compressed release file will in .release folder.    
`.rpm`/`.deb`/`.msi` files will not generate.

#### Note:
1. you must have a "workspace" like this:
```
📁New Folder *<-- the "workspace"*    
   📁 maix-ide *<-- this project*    
   📁 HOME *<-- this will auto create during run*    
```
1. you need an user:
	* non-root
	* have write permission to the "workspace"

## License

Copyright (c) Microsoft Corporation. All rights reserved.

Licensed under the [MIT](LICENSE.txt) License.
