#!/usr/bin/env bash
MakeNewDir $RELEASE_ROOT
MakeNewDir $HOME
MakeNewDir $PRIVATE_BINS
MakeNewDir $TMP

if [ ! -e "$NODEJS" ]; then
	echo "Install Node.js"

	if [ "$SYSTEM" = "linux" ]; then
		downloadFile "https://nodejs.org/dist/v8.11.2/node-v8.11.2-linux-x64.tar.xz" "$TMP/node.tar.xz"
	else
		downloadFile "https://nodejs.org/dist/v8.11.2/node-v8.11.2-darwin-x64.tar.xz" "$TMP/node.tar.xz"
	fi
	echo "Extracting node from $TMP/node.tar.xz to $NODEJS_INSTALL"
	RimDir "$NODEJS_INSTALL"
	MakeNewDir "$NODEJS_INSTALL"

	tar xf "$TMP/node.tar.xz" --strip-components 1 -C "$NODEJS_INSTALL"
	RimDir "$NODEJS_INSTALL/lib"
	MakeNewDir "$NODEJS_INSTALL/lib"
fi

if [ ! -e "$PRIVATE_BINS/yarn" ]; then
	tempDir="$TMP/yarn-install"
	MakeNewDir "$tempDir"

	downloadFile "https://yarnpkg.com/latest.tar.gz" "$TMP/yarn.tgz"

	echo "Extracting yarn..."
	cd "$tempDir"
	tar xf "$TMP/yarn.tgz" --strip-components 1
	"$NODEJS" "./bin/yarn.js" \
			--prefer-offline --no-default-rc --no-bin-links \
			--cache-folder "$YARN_CACHE_FOLDER" \
			--global-folder "$NODEJS_INSTALL" \
			--link-folder "$YARN_FOLDER" \
		global add yarn@1.10.1
	cd "$RELEASE_ROOT"
	RimDir "$tempDir"
fi

echo "Detect Node.js: $("$NODEJS" --version)"
export npm_config_target=$(cd "$VSCODE_ROOT" ; node -p "require('./build/lib/electron').getElectronVersion();" )

### npm
writeShFile npm "
	export PRIVATE_BINS='$PRIVATE_BINS'
	exec '$NODEJS' '$VSCODE_ROOT/my-scripts/build-env/mock-npm.js' %*
"
### npm

### yarn
writeShFile yarn "
	export npm_config_arch='$npm_config_arch'
	export npm_config_disturl='$npm_config_disturl'
	export npm_config_runtime='$npm_config_runtime'
	export npm_config_cache='$npm_config_cache'
	export npm_config_target='$npm_config_target'
	export VSCODE_ROOT='$VSCODE_ROOT'
	export YARN_FOLDER='$YARN_FOLDER'
	export YARN_CACHE_FOLDER='$YARN_CACHE_FOLDER'
	export PREFIX='$YARN_FOLDER'
	\$ARGS=(\"\$@\")
	if( \${ARGS[#]} -eq 0 ) {
		\$ARGS += ('install')
	}

	BL=''
	if [ \${ARGS[0]} -eq 'global' ]; then
		BL='--no-bin-links'
	else
		BL='--bin-links'
	fi

	exec '$NODEJS' \\
		'$NODEJS_INSTALL\node_modules\yarn\bin\yarn.js' \\
			--prefer-offline --no-default-rc \$BL \\
			--use-yarnrc '$VSCODE_ROOT/.yarnrc' \\
			--cache-folder '$YARN_CACHE_FOLDER' \\
			--global-folder '$NODEJS_INSTALL' \\
			--link-folder '$NODEJS_INSTALL\node_modules' \\
		\"\${ARGS[@]}\"
"
### yarn

function findCommand() {
	local PATH="${ORIGINAL_PATH}"
	command -v "$1"
}
function tryPy(){
	local PATH="${ORIGINAL_PATH}"
	if "$1" -V | grep -q ' 2.' 2>/dev/null ; then
		[ -e "$PRIVATE_BINS/python" ] && unlink "$PRIVATE_BINS/python"
		ln -s "$(findCommand "$1")" "$PRIVATE_BINS/python"
	fi
}
function dieInstall() {
	die "\e[38;5;14;1mpython 2.x\e[38;5;9m is not installed on your system, install it first."
}
if [ "$SYSTEM" = "linux" ]; then
	tryPy python2 || tryPy python || die "python 2.x is not installed on your system, install it first."
else
	tryPy python || die "python 2.x is not installed on your system, install it first."
fi

if ! findCommand "git" ; then
	die "git is not installed on your system, install it first."
fi
writeShFile git "
	@echo off
	set HOME='${ORIGINAL_HOME}'
	set Path='${ORIGINAL_PATH}'
	'$(findCommand "git")' %*
"

cd $VSCODE_ROOT
