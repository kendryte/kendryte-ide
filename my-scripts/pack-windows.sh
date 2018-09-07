#!/bin/bash

set -e
cd "$(dirname "$(realpath "${BASH_SOURCE[0]}")")"
source fn.sh
set_path_when_developing
source common.sh
cd ..

### start
reset_asar

function yarn_location_of() {
	local WHAT=$1
	local REL=$2
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
	PATH="$ORIGINAL_PATH" yarn install -y --use-yarnrc .yarnrc --prefer-offline
	popd &>/dev/null
}

if [ -e "node_modules" ] ; then
	echo "Error: node_modules exists, must remove." >&2
	exit 1
fi

if ! command -v "lnk" &>/dev/null ; then
	npm install lnk-cli --global
fi

DevModules="$(yarn_location_of devDependencies)/node_modules"
#yarn_install devDependencies
lnk $(native_path "${DevModules}") ./

ModulesRoot="$(yarn_location_of dependencies)"
#yarn_install dependencies

export ARG_CODE_ROOT="$(native_path "$VSCODE_ROOT")"
export ARG_MODULES="$(native_path "$ModulesRoot")"

"$DevModules/.bin/gulp" --gulpfile "${ARG_CODE_ROOT}/my-scripts/gulpfile/pack-win.js"

cd "$ModulesRoot"
mv node_modules.asar.unpacked node_modules.asar "$VSCODE_ROOT"