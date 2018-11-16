MkDir $RELEASE_ROOT
MkDir $HOME
MkDir $PRIVATE_BINS
MkDir $TMP

if (!(Test-Path -Path $NODEJS)) {
	echo "Install Node.js"
	downloadFile "https://nodejs.org/dist/v8.11.2/win-x64/node.exe" "$TMP/node.exe"
	
	echo "Coping node.exe from $TMP/node.exe to $NODEJS_INSTALL"
	RimDir $NODEJS_INSTALL
	MkDir $NODEJS_INSTALL
	Copy-Item "$TMP/node.exe" "$NODEJS" -Force
}

echo "Detect Node.js: $( & $NODEJS --version )"
setSystemVar 'npm_config_target' $( cd $VSCODE_ROOT; node -p "require('./build/lib/electron').getElectronVersion();" )

if (!(Test-Path -Path "$PRIVATE_BINS/yarn.ps1")) {
	$tempDir = "$TMP/yarn-install"
	MkDir $tempDir
	
	downloadFile "https://s3.cn-northwest-1.amazonaws.com.cn/kendryte-ide/3rd-party/7zip/7za.exe" (resolvePath $PRIVATE_BINS '7za.exe')
	downloadFile "https://s3.cn-northwest-1.amazonaws.com.cn/kendryte-ide/3rd-party/7zip/7za.dll" (resolvePath $PRIVATE_BINS '7za.dll')
	downloadFile "https://s3.cn-northwest-1.amazonaws.com.cn/kendryte-ide/3rd-party/7zip/7zxa.dll" (resolvePath $PRIVATE_BINS '7zxa.dll')
	downloadFile "https://yarnpkg.com/latest.tar.gz" "$TMP/yarn.tgz"
	
	echo "Extracting yarn..."
	7za e -y "-o$TMP" -- "$TMP/yarn.tgz" | Out-Null
	if (!$?) {
		echo "  failed..."
		exit 1
	}
	7za x -y "-o$tempDir" -- "$TMP/yarn.tar" | Out-Null
	if (!$?) {
		echo "  failed..."
		exit 1
	}
	RimDir "$TMP/yarn.tar"
	
	cd $tempDir
	(Get-ChildItem -Directory | Select-Object -Index 0).Name | cd
	& "$NODEJS" ".\bin\yarn.js" `
		--prefer-offline --no-default-rc --no-bin-links `
		--cache-folder "$YARN_CACHE_FOLDER" `
		--global-folder "$NODEJS_INSTALL" `
		--link-folder "$YARN_FOLDER" `
	global add yarn@1.10.1
	cd $RELEASE_ROOT
	RimDir $tempDir
}

& $NODEJS "$VSCODE_ROOT/my-scripts/build-env/windows/pathinfo.js"
if (!$?) {
	throw "Network location ($VSCODE_ROOT) is not supported."
}

### yarn-install-build-tools
writeScriptFile yarn-install-build-tools @"
	[console]::WindowWidth=150
	[console]::WindowHeight=24
	[console]::BufferWidth=[console]::WindowWidth
	
	`$env:PATH='$PATH'
	`$env:YARN_CACHE_FOLDER='$YARN_CACHE_FOLDER'
	& '$NODEJS' ``
		'$NODEJS_INSTALL\node_modules\yarn\bin\yarn.js' ``
		global add windows-build-tools --vs2015 ``
			--prefer-offline --no-default-rc --no-bin-links ``
			--cache-folder '$YARN_CACHE_FOLDER' ``
	pause
"@
### yarn-install-build-tools

### npm
writeCmdFile npm @"
	@echo off
	set PRIVATE_BINS=$PRIVATE_BINS
	"$NODEJS" "$VSCODE_ROOT\my-scripts\build-env\mock-npm.js" %*
"@
### npm

### yarn
writeCmdFile yarn @"
	@echo off
	powershell.exe `"$PRIVATE_BINS/yarn.ps1`" %*
"@
### yarn

### yarn.ps
writeScriptFile yarn @"
	`$env:npm_config_arch='$npm_config_arch'
	`$env:npm_config_disturl='$npm_config_disturl'
	`$env:npm_config_runtime='$npm_config_runtime'
	`$env:npm_config_cache='$npm_config_cache'
	`$env:npm_config_target='$npm_config_target'
	`$env:VSCODE_ROOT='$VSCODE_ROOT'
	`$env:YARN_FOLDER='$YARN_FOLDER'
	`$env:YARN_CACHE_FOLDER='$YARN_CACHE_FOLDER'
	`$env:PREFIX='$YARN_FOLDER'
	if( `$args.Count -eq 0 ) {
		`$args += ('install')
	}
	
	`$BL=""
	if ( `$args[0] -eq "global" ) {
		`$BL="--no-bin-links"
	} else {
		`$BL="--bin-links"
	}
	
	& '$NODEJS' ``
		'$NODEJS_INSTALL\node_modules\yarn\bin\yarn.js' ``
			--prefer-offline --no-default-rc `$BL ``
			--use-yarnrc '$VSCODE_ROOT/.yarnrc' ``
			--cache-folder '$YARN_CACHE_FOLDER' ``
			--global-folder '$NODEJS_INSTALL' ``
			--link-folder '$NODEJS_INSTALL\node_modules' ``
		`$args
"@
### yarn.ps

### install node_modules for my scripts
if (!(Test-Path -Path "$VSCODE_ROOT\my-scripts\node_modules")){
	cd $VSCODE_ROOT\my-scripts
	yarn
}
### install node_modules for my scripts

if (!(Get-Command python -errorAction SilentlyContinue)) {
	echo "================================================="
	echo "  Try install windows-build-tools"
	echo "  Pplease wait result from new window"
	echo "  "
	echo "  You need press Enter to continue"
	echo "================================================="
	Start-Process powershell.exe "$NODEJS_BIN/yarn-install-build-tools.ps1" -Verb RunAs -Wait
	if (!$?) {
		throw "windows-build-tools cannot install"
	}
}
if (!(Get-Command python -errorAction SilentlyContinue)) {
	$PythonPath = (resolvePath $env:USERPROFILE .windows-build-tools\python27)
	throw "python cannot not install at $PythonPath, please install windows-build-tools and try again."
}

if (!(Test-Path -Path "$PRIVATE_BINS\git.bat")) {
	writeCmdFile finding-git @"
		@echo off
		set PATH=$ORIGINAL_PATH
		C:\Windows\System32\where.exe git
"@
	$GitLocation = (cmd.exe /c "finding-git")
	if (!$GitLocation) {
		throw "You need to install <github desktop>( https://desktop.github.com/ )."
	}
	
	writeCmdFile git @"
		@echo off
		set HOME=${ORIGINAL_HOME}
		set Path=${ORIGINAL_PATH}
	"$GitLocation" %*
"@
	
	cd $RELEASE_ROOT
	if (!(Test-Path -Path '.git')) {
		git init .
		echo '*' | Out-File -FilePath .gitignore -Encoding "ascii"
	}
}

cd $VSCODE_ROOT
$helpStrings = (node "my-scripts\build-env\help.js") | Out-String
setSystemVar 'helpStrings' $helpStrings
