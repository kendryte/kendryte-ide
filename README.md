# Kendryte IDE

基于开源的[VS Code](https://code.visualstudio.com)
Based on a wonderful editor: [VS Code](https://code.visualstudio.com)

这里是开发说明，使用相关信息在：    
* [论坛](https://forum.kendryte.com/)
* [Issue List](https://github.com/kendryte/kendryte-ide/issues)

# 开发、发布前的准备
1. 安装系统级依赖：
	1. Windows:
		* 仅支持**Windows 10 64位**，且安装了较新的更新。
		* [Git](https://git-scm.com/)，安装时选择 “Run Git from the Windows Command Prompt”
	2. Linux:
		* 仅支持比较新的发行版（比如**最新版**Ubuntu、Fedora、Arch等，不支持CentOS、老的Ubuntu等）
		* 安装以下软件包（`dnf install -y`、`apt install -y`……）
		```dnf
	    bash tmux wget curl tar xz findutils git
	    make gcc-c++ libstdc++ gtk2 libXtst libXScrnSaver GConf2 alsa-lib
	    libsecret-devel libX11-devel libxkbfile-devel
	    wqy-zenhei-fonts wqy-unibit-fonts wqy-bitmap-fonts # locale font
        ```
	3. Mac:
		* 先确认系统版本较新
		* 如果没有homebrew需要先安装
		```bash
		brew install coreutils findutils gnu-tar gnu-sed gawk gnutls gnu-indent gnu-getopt wget md5sha1sum gnutls --with-default-names
		```
1. 启动一个终端（如果是windows，则启动powershell，而不是cmd）
1. 下载源码，cd进去 `git clone git@github.com:kendryte/kendryte-ide.git && cd kendryte-ide`
1. 加载所需的环境： 👈 之后每次从这步开始
	1. windows：`.\my-scripts\start.ps1` 如果提示禁止运行，参考 [powershell运行策略](https://docs.microsoft.com/zh-cn/powershell/module/microsoft.powershell.core/about/about_execution_policies?view=powershell-6)
	1. Linux & Mac: `./my-scripts/start.sh`
1. 等待安装必须的依赖，完成时，会提示 “ > The anwser is 42 < ”

😘 每个命令行窗口都需要运行 start.ps1 或者 start.sh。    
😘 但首次运行成功（或失败）前，不要同时运行另一个，容易产生冲突。

## 通过源码运行
1. 需要开启至少2个终端窗口
1. 首次调试时，执行 prepare-development，等它完成（可能会很久）
1. 其中一个终端窗口执行 start-watch
1. 等待约1分钟，显示类似“compilation success”的消息后，继续下一步
1. 在另外一个窗口执行 start-code

## 发布新版本
1. 首次运行时，执行 prepare-release，等它完成
1. build
1. 等待半小时左右，生成的文件保存在 `.release/release-files`

### 说明：
* 除了下面说明外，所有脚本都不需要管理员权限。程序中包含大量第三方代码，使用root或管理员权限导致问题概不负责。
* 调试需要6GB左右（磁盘空间）
* 生成需要4GB左右
* 调试和生成使用的文件夹不同，同时又要调试又要生成，则需要10GB

### windows 上的特别说明：
* 首次运行 start.ps1 的时候可能会请求管理员权限，以安装编译器（msbuild等）
* 不要用 `yarn add`，直接修改 `package.json` 然后再次执行 prepare-development

# License

Copyright (c) Microsoft Corporation. All rights reserved.

Licensed under the [MIT](LICENSE.txt) License.