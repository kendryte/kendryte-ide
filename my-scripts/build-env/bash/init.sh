#!/usr/bin/env bash
_PASSARG='"$@"'

function dieInstall() {
	die "\e[38;5;14;1mpython 2.x\e[38;5;9m is not installed on your system, install it first."
}
function diePermission() {
	die "You [$(whoami)]($(id -u)) do not have write permission to this dir: \n  $(ls -dlh "${1}")\nNeed run \e[38;5;14msudo chown -R $(whoami) '$VSCODE_ROOT'\e[0m"
}

touch "$VSCODE_ROOT" || diePermission "$VSCODE_ROOT"

MakeNewDir "$RELEASE_ROOT" || diePermission "$(dirname "$RELEASE_ROOT")"
MakeNewDir "$HOME" || diePermission "$(dirname "$HOME")"
MakeNewDir "$PRIVATE_BINS" || diePermission "$(dirname "$PRIVATE_BINS")"
MakeNewDir "$TMP" || diePermission "$(dirname "$TMP")"

touch "$RELEASE_ROOT" || die "You [$(whoami)]($(id -u)) do not have write permission to this dir: \n  $(ls -dlh "${RELEASE_ROOT}")\nNeed to chown to you."

export HISTFILE="$HOME/.bash_history"

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
	RimDir "$NODEJS_INSTALL/bin/npm"
	RimDir "$NODEJS_INSTALL/bin/npx"
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
	exec '$NODEJS' '$VSCODE_ROOT/my-scripts/build-env/mock-npm.js' $_PASSARG
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
	ARGS=($_PASSARG)
	if [ \${#ARGS[@]} -eq 0 ]; then
		ARGS+=('install')
	fi

	BL=''
	if [ \${ARGS[0]} = 'global' ]; then
		BL='--no-bin-links'
	else
		BL='--bin-links'
	fi

	exec '$NODEJS' \\
		'$NODEJS_INSTALL/node_modules/yarn/bin/yarn.js' \\
			--prefer-offline --no-default-rc \$BL \\
			--use-yarnrc '$VSCODE_ROOT/.yarnrc' \\
			--cache-folder '$YARN_CACHE_FOLDER' \\
			--global-folder '$NODEJS_INSTALL' \\
			--link-folder '$NODEJS_INSTALL\node_modules' \\
		\"\${ARGS[@]}\"
"
### yarn

### x-www-browser
writeShFile x-www-browser "
echo -e \"\e[38;5;11mRequest to Start Browser: \$*\e[0m\"
# MSG=\"\$(echo \"\$*\" | sed -e 's/\\/\\\\/g' -e 's/&/\&amp;/g' -e 's/</\&lt;/g' -e 's/>/\&gt;/g')\"
# zenity --info --title='Request to Start Browser' --text=\"\$MSG\" --width=800 --height=240 &
"

### x-www-browser

function findCommand() {
	local PATH="${ORIGINAL_PATH}"
	command -v "$1"
}

echo -n "Detect Python: "
function tryPy(){
	local PATH="${ORIGINAL_PATH}"
	if "$1" -V 2>&1 | grep -q ' 2.' 2>/dev/null ; then
		[ -e "$PRIVATE_BINS/python" ] && unlink "$PRIVATE_BINS/python"
		ln -s "$(findCommand "$1")" "$PRIVATE_BINS/python"
		"$PRIVATE_BINS/python" -V
	fi
}
if [ "$SYSTEM" = "linux" ]; then
	tryPy python2 || tryPy python || die "python 2.x is not installed on your system, install it first."
else
	tryPy python || die "python 2.x is not installed on your system, install it first."
fi

echo -n "Detect Git: "
if ! findCommand "git" &>/dev/null ; then
	die "git is not installed on your system, install it first."
fi
writeShFile git "
	export HOME='${ORIGINAL_HOME}'
	export Path='${ORIGINAL_PATH}'
	'$(findCommand "git")' $_PASSARG
"
"$PRIVATE_BINS/git" --version


if ! findCommand "7z" &>/dev/null ; then
	die "p7zip is not installed on your system, install it first."
fi
writeShFile 7z "
	'$(findCommand "7z")' $_PASSARG
"

cd $VSCODE_ROOT
