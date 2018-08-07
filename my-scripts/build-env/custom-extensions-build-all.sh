#!/usr/bin/env bash

TARGET="$1"

set -e

for I in ./custom-extensions/*/tsconfig.json ; do
	echo "building: $I ..."
	./node_modules/.bin/tsc -p "$I"
done

cp -ru ./custom-extensions/*/ "${TARGET}/resources/app/extensions"
