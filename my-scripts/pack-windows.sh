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
	echo "${HOME}/yarn-dir/$WHAT"
}

function yarn_install() { # what
	local WHAT=$1
	local TARGET="$(yarn_location_of ${WHAT})"
	mkdir -p "${TARGET}"

	echo 'disturl "https://atom.io/download/electron"
target "2.0.7"
runtime "electron"
cache-folder "'${YARN_CACHE_FOLDER}'"
' > "${TARGET}/.yarnrc"
	node -p "JSON.stringify({dependencies: require('./package.json').$WHAT})" > "${TARGET}/package.json"
	cp -f "yarn.lock" "${TARGET}"

	pushd "${TARGET}" &>/dev/null
	yarn install -y --use-yarnrc .yarnrc --prefer-offline --cache-folder "${YARN_CACHE_FOLDER}"
	popd &>/dev/null
}

if ! command -v "lnk" &>/dev/null ; then
	npm install lnk-cli --global
fi

DevModules="$(yarn_location_of devDependencies)/node_modules"
yarn_install devDependencies
lnk $(native_path "${DevModules}") ./

ModulesRoot="$(yarn_location_of dependencies)"
yarn_install dependencies

echo "install complete..."

export ARG_CODE_ROOT="$(native_path "$VSCODE_ROOT")"
export ARG_MODULES="$(native_path "$ModulesRoot")"


C_YARN="$(command -v yarn)"
O_YARN="$(cygpath -w "${C_YARN}")"

C_YARN_RC="$(yarn_location_of .yarnrc)"
O_YARN_RC="$(cygpath -w "${C_YARN_RC}")"

echo 'disturl "https://atom.io/download/electron"
target "2.0.7"
runtime "electron"
' > "${C_YARN_RC}"

cd "$(yarn_location_of .)"
echo "exec '${C_YARN}' --use-yarnrc '${O_YARN_RC}' --prefer-offline --cache-folder '${YARN_CACHE_FOLDER}' \"\$@\"" > yarn
echo "@echo off
\"${O_YARN}\" --use-yarnrc \"${O_YARN_RC}\" --prefer-offline --cache-folder \"${YARN_CACHE_FOLDER}\" %*" > yarn.cmd
chmod a+x yarn yarn.cmd

export PATH="$(yarn_location_of .):$PATH"

"$DevModules/.bin/gulp" --gulpfile "${ARG_CODE_ROOT}/my-scripts/gulpfile/pack-win.js"

cd "$ModulesRoot"
echo ":: $ModulesRoot"
mv node_modules.asar.unpacked node_modules.asar "$VSCODE_ROOT"

cd "$VSCODE_ROOT"
yarn run postinstall
