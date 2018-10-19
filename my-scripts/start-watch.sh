#!/usr/bin/env bash

set -e

cd "$(dirname "$(realpath "${BASH_SOURCE[0]}")")"
source fn.sh
set_path_when_developing
source common.sh
cd ..

detect_install_nodejs

ensure_node_modules_in_current_dir

node build/lib/electron.js || ./node_modules/.bin/gulp electron

if command -v stty &>/dev/null ; then
	stty intr ^K
	echo ""
	echo -e '\e[1;5;38;5;14m!!! Press Ctrl+K instead of Ctrl+C to stop this. !!!\e[0m'
	echo ""
	ORIG=$(stty -a | grep -oE 'intr\s*=\s*[^;]+' | sed 's/=//g')
	trap "stty ${ORIG}" EXIT INT TERM
fi

export FORCE_COLOR=yes
yarn watch | sed "s#${VSCODE_ROOT}/src/##g"
