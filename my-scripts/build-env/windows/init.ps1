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

if (!(Test-Path -Path "$NODEJS_BIN/yarn.ps1")) {
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

echo "Detect Node.js: $( & $NODEJS --version )"
setSystemVar 'npm_config_target' $( cd $VSCODE_ROOT; node -p "require('./build/lib/electron').getElectronVersion();" )

echo @"
`$env:npm_config_arch='$npm_config_arch'
`$env:npm_config_disturl='$npm_config_disturl'
`$env:npm_config_runtime='$npm_config_runtime'
`$env:npm_config_cache='$npm_config_cache'
`$env:npm_config_target='$npm_config_target'
`$env:VSCODE_ROOT='$VSCODE_ROOT'
`$env:YARN_FOLDER='$YARN_FOLDER'
`$env:YARN_CACHE_FOLDER='$YARN_CACHE_FOLDER'
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
"@ > "$NODEJS_BIN/yarn.ps1"

echo @"
@echo off
powershell.exe `"$NODEJS_BIN/yarn.ps1`" %*
"@ | Out-File -Encoding "ascii" "$NODEJS_BIN/yarn.cmd"

echo @"
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
"@  > "$NODEJS_BIN/yarn-install-build-tools.ps1"

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

echo @"
@echo off
set PATH=$ORIGINAL_PATH
C:\Windows\System32\where.exe git
"@ | Out-File -Encoding "ascii" "$TMP/finding-git.cmd"
$GitLocation = (cmd.exe /c "$TMP/finding-git.cmd")
if (!$GitLocation) {
	throw "You need to install <github desktop>( https://desktop.github.com/ )."
}


echo @"
@echo off
set HOME=${ORIGINAL_HOME}
set Path=${ORIGINAL_PATH}
"$GitLocation" %*
"@ | Out-File -Encoding "ascii" "$NODEJS_BIN/git.cmd"

$helpStrings = (node "my-scripts\build-env\help.js") | Out-String
setSystemVar 'helpStrings' $helpStrings
