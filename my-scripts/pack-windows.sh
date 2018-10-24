#!/bin/bash

set -e
cd "$(dirname "$(realpath "${BASH_SOURCE[0]}")")"
source fn.sh
set_path_when_developing
source common.sh
cd ..

detect_install_nodejs

### start
reset_asar

if [ -e "node_modules" ] ; then
	echo "Error: node_modules exists, must remove." >&2
	exit 1
fi

function yarn_location_of() {
	local WHAT=$1
	echo "${RELEASE_ROOT}/yarn-dir/$WHAT"
}

function yarn_install() {
	echo "install $1... (please wait)"
	pushd "$(yarn_location_of "$1")" &>/dev/null
	echo "  logfile is at `pwd`/install.log"
	yarn install &>install.log || dieFile "=======================" install.log
	echo "  install $1 complete."
	popd &>/dev/null
}

echo "prepare..."
node my-scripts/build-env/pack-win.prepare.js

export PATH="$(yarn_location_of .):$PATH"

### devDependencies
yarn_install devDependencies
DevModules="$(yarn_location_of devDependencies)/node_modules"

## link them
echo "  link dev modules to worktree"
"${DevModules}/.bin/lnk" ./.release/yarn-dir/devDependencies/node_modules ./

### dependencies
yarn_install dependencies
ModulesRoot="$(yarn_location_of dependencies)"
echo "  package it..."
echo "    (wd: $(pwd))"
echo "    \$0: $DevModules/.bin/gulp"
echo "         --gulpfile my-scripts/gulpfile/pack-win.js"
LOG="$ModulesRoot/pack.log"
"$DevModules/.bin/gulp" --gulpfile "my-scripts/gulpfile/pack-win.js" &>"$LOG" || dieFile "=======================" "$LOG"

## copy
pushd "$ModulesRoot" &>/dev/null
echo "    move asar result files..."
mv node_modules.asar.unpacked node_modules.asar "$VSCODE_ROOT"
popd &>/dev/null

### run post install (eg. install extensions node_modules)
echo "run post-install script..."
LOG="$(yarn_location_of postinstall.log)"
yarn run postinstall &>${LOG} || dieFile "=======================" "$LOG"
echo "Everything complete."

