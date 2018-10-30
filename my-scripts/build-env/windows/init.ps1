MkDir $RELEASE_ROOT
MkDir $HOME
MkDir $PRIVATE_BINS
MkDir $TMP

if (!(Test-Path -Path $NODEJS)) {
	echo "Install Node.js"
	downloadFile "https://s3.cn-northwest-1.amazonaws.com.cn/kendryte-ide/3rd-party/7zip/7za.exe" (resolvePath $PRIVATE_BINS '7za.exe')
	downloadFile "https://s3.cn-northwest-1.amazonaws.com.cn/kendryte-ide/3rd-party/7zip/7za.dll" (resolvePath $PRIVATE_BINS '7za.dll')
	downloadFile "https://s3.cn-northwest-1.amazonaws.com.cn/kendryte-ide/3rd-party/7zip/7zxa.dll" (resolvePath $PRIVATE_BINS '7zxa.dll')

	$tempDir = "$TMP/nodejs-install"
	MkDir $tempDir

	downloadFile "https://nodejs.org/dist/v8.11.2/win-x64/node.exe" "$TMP/node.exe"
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

	Copy-item "$TMP/node.exe" "$tempDir/node.exe"

	echo "Moving content from $tempDir to $NODEJS_INSTALL"
	RimDir $NODEJS_INSTALL
	Move-Item $tempDir $NODEJS_INSTALL -Force
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
& '$NODEJS' ``
	'$NODEJS_INSTALL\yarn-v1.10.1\bin\yarn.js' ``
	`$args ``
		--prefer-offline --no-default-rc ``
		--use-yarnrc '$VSCODE_ROOT/.yarnrc' ``
		--cache-folder '$YARN_CACHE_FOLDER' ``
		--global-folder '$YARN_FOLDER/global' ``
		--link-folder '$YARN_FOLDER/link' ``
		--temp-folder '$YARN_FOLDER/temp'
"@ > "$NODEJS_BIN/yarn.ps1"

echo @"
[console]::WindowWidth=120
[console]::WindowHeight=24
[console]::BufferWidth=[console]::WindowWidth
. $NODEJS_BIN/yarn.ps1 global add --no-bin-links windows-build-tools --vs2015
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

$YarnGlobal = (yarn global list)

if (!(echo "$YarnGlobal" | findstr -i node-gyp)) {
	yarn global add node-gyp
}else{
	echo "gyp exists"
}