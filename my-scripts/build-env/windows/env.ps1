if (!$env:ORIGINAL_HOME) {
	setSystemVar 'ORIGINAL_HOME' $HOME
}
if (!$env:ORIGINAL_PATH) {
	setSystemVar 'ORIGINAL_PATH' $env:PATH
}

setSystemVar 'VSCODE_ROOT' (resolvePath $PSScriptRoot ..\..\..)
setSystemVar 'RELEASE_ROOT' (resolvePath $VSCODE_ROOT .release)
setSystemVar 'ARCH_RELEASE_ROOT' (resolvePath $RELEASE_ROOT kendryte-ide-release-x64)
setSystemVar 'FAKE_HOME' (resolvePath $RELEASE_ROOT FAKE_HOME)
setSystemVar 'HOME' $FAKE_HOME

setSystemVar 'NODEJS_INSTALL' (resolvePath $HOME nodejs)
setSystemVar 'NODEJS_BIN' $NODEJS_INSTALL
setSystemVar 'NODEJS' (resolvePath $NODEJS_BIN node.exe)

setSystemVar 'YARN_FOLDER' (resolvePath $RELEASE_ROOT yarn)
setSystemVar 'PREFIX' $YARN_FOLDER
setSystemVar 'YARN_CACHE_FOLDER' (resolvePath $YARN_FOLDER cache)

setSystemVar 'PRIVATE_BINS' (resolvePath $RELEASE_ROOT wrapping-bins)

$CommonPaths = "C:\WINDOWS\system32;C:\WINDOWS;C:\WINDOWS\System32\Wbem;C:\WINDOWS\System32\WindowsPowerShell\v1.0"
$PythonPath = (resolvePath $env:USERPROFILE .windows-build-tools\python27)
$LocalNodePath = (resolvePath $VSCODE_ROOT node_modules\.bin)
$BuildingNodePath = (resolvePath $VSCODE_ROOT my-scripts\node_modules\.bin)
setSystemVar 'PATH' "$PRIVATE_BINS;$PythonPath;$NODEJS_BIN;$BuildingNodePath;$LocalNodePath;$CommonPaths"

if ($env:HTTP_PROXY) {
	setSystemVar 'HTTPS_PROXY' "$env:HTTP_PROXY"
	setSystemVar 'ALL_PROXY' "$env:HTTP_PROXY"
}

setSystemVar 'TMP' "${RELEASE_ROOT}/tmp"
setSystemVar 'TEMP' "${TMP}"

setSystemVar 'npm_config_arch' "x64"
setSystemVar 'npm_config_disturl' "https://atom.io/download/electron"
setSystemVar 'npm_config_runtime' "electron"
setSystemVar 'npm_config_cache' "$TMP/npm-cache"
