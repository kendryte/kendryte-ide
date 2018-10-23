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
mkdir -p data

echo -en '\ec'
if [ "$SYSTEM" = "windows" ]; then
	cmd /c my-scripts\\build-env\\start-code-encode.cmd "$@" 2>&1
else
	bash scripts/code.sh "$@"
fi
