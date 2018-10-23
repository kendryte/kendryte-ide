#!/usr/bin/env bash

set -e

cd "$(dirname "$(realpath "${BASH_SOURCE[0]}")")"
source fn.sh
set_path_when_developing
source common.sh
cd ..

detect_install_nodejs

ensure_node_modules_in_current_dir

unset VSCODE_PORTABLE

function do_start(){
	echo -e "\e[38;5;14;1m> $*\e[0m"
	exec "$@"
}

echo -en '\ec'
if [ "$SYSTEM" = "windows" ]; then
	mkdir -p data
	do_start cmd /c my-scripts\\build-env\\start-code-encode.cmd "$@" 2>&1
elif [ "$SYSTEM" = "mac" ]; then
	mkdir -p ~/kendryte-ide-user-data
	
	if [ -L ../data ] && [ "$(readlink ../data)" != ~/kendryte-ide-user-data ] ; then
		unlink ../data
		ln -s ~/kendryte-ide-user-data ../data
	fi
	
	do_start bash scripts/code.sh "$@"
else
	mkdir -p data
	do_start bash scripts/code.sh "$@"
fi
