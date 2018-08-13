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

#### Run From Source Note:
1. you must have a "workspace" like this:
```
📁New Folder *<-- the "workspace"*    
   📁 maix-ide *<-- this project*    
   📁 HOME *<-- this will auto create during run*    
```
1. you need an user:
	* non-root
	* have write permission to the "workspace"


## Make Release

After install, you can run: (no `yarn install` is need)

```bash
bash ./my-scripts/build-windows.sh
# Or
bash ./my-scripts/build-linux.sh
```

Compressed release file will in .release folder.    
`.rpm`/`.deb`/`.msi` files will not generate.

## maix SDK & toolchain
sdk and toolchain must found inside a folder `packages/`:
* when developing: inside source root, next to `package.json`.
* when released: inside application root, next to `Maix IDE.exe`

On linux, [maix-toolchain](https://github.com/Canaan-Creative/maix-toolchain) can be build with:
```bash
cd maix-toolchain
./configure --prefix=`pwd`/dist
make -j$(nproc)
\cp -r dist/. /path/to/maix-ide/packages/toolchain
```

[maix-sdk](https://github.com/Canaan-Creative/maix-sdk) can be build with:
After toolchain is ready for use
 1. open IDE
 1. open folder of the SDK source
 1. click "Build" button
 1. copy "build/archive/" folder to `packages/` and rename to "SDK" (Uppercase)

## License

Copyright (c) Microsoft Corporation. All rights reserved.

Licensed under the [MIT](LICENSE.txt) License.
