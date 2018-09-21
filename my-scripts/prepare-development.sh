#!/usr/bin/env bash

npm -g install yarn

set -e

cd "$(dirname "$(realpath "${BASH_SOURCE[0]}")")"

if [ "$SYSTEM" = "windows" ]; then
	cd ..
	exec bash my-scripts/pack-windows.sh
else
	source fn.sh
	set_path_when_developing
	source common.sh
	
	cd ..
	
	detect_install_nodejs
	yarn install --prefer-offline --cache-folder "${YARN_CACHE_FOLDER}"
fi
