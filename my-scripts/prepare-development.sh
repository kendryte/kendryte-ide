#!/usr/bin/env bash

npm -g install yarn

set -e

cd "$(dirname "$(realpath "${BASH_SOURCE[0]}")")"
source fn.sh
set_path_when_developing
source common.sh
cd ..

if [ "$SYSTEM" = "windows" ]; then
	exec bash my-script/pack-windows.sh
else
	bash my-script/prepare-release.sh
	yarn install --prefer-offline --cache-folder "${YARN_CACHE_FOLDER}"
fi
