#!/usr/bin/env bash

set -e

cd "$(dirname "$(realpath "${BASH_SOURCE[0]}")")"
source build-env/fn.sh
set_path_when_developing
source build-env/common.sh
cd ..

detect_install_nodejs

ensure_node_modules_in_current_dir

node build/lib/electron.js || ./node_modules/.bin/gulp electron

if find_command stty &>/dev/null ; then
	function _term() {
		stty ${ORIG}
		trap - EXIT INT TERM
		exit 0
	}

	echo ""
	echo -e '\e[1;5;38;5;14m!!! Press Ctrl+K instead of Ctrl+C to stop this. !!!\e[0m'
	echo ""
	ORIG=$(stty -a | grep -oE 'intr\s*=\s*[^;]+' | sed 's/=//g')
	stty intr ^K
	trap _term EXIT INT TERM
fi

export FORCE_COLOR=yes

if (echo "$*" | grep -q -- "--slow") || [ ! -e "extensions/css-language-features/client/out" ] ; then
	gulp --no-respawning compile-extensions
	echo -e "\e[38;5;10mExtensions Compile complete...\e[0m"
else
	echo -e "\e[38;5;14mExtensions Recompile Skipped, add '--slow' to force do it!\e[0m"
fi

NATIVE_VSCODE_ROOT=$(native_path "${VSCODE_ROOT}/src")
echo -e "\e[38;5;14mCompile output processor: replace '${NATIVE_VSCODE_ROOT}/' with ''.\e[0m"

# prevent respawn, resolve windows Ctrl+C issue
node --max-old-space-size=4096 ./node_modules/gulp/bin/gulp.js -- watch-client \
	| sed "s#${NATIVE_VSCODE_ROOT}/##g"
