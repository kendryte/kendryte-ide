#!/usr/bin/env bash

TARGET="$1"

set -e

source "./my-scripts/fn.sh"
source "./my-scripts/common.sh"

for I in ./custom-extensions/*/package.json ; do
	DIR_NAME="$(dirname "$I")"
	EXT_NAME="$(basename "$I")"
	if hash_deps_check_changed "${EXT_NAME}" "${I}" ; then
		echo "installing dependencies: $EXT_NAME ..."
		pushd "$DIR_NAME" &>/dev/null
		yarn install
		popd &>/dev/null
		
		hash_deps_save "${EXT_NAME}" "${I}"
	fi
done

for I in ./custom-extensions/*/tsconfig.json ; do
	echo "building: $I ..."
	./node_modules/.bin/tsc -p "$I"
done

cp -ru ./custom-extensions/*/ "${TARGET}/resources/app/extensions"
