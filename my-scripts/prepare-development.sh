#!/usr/bin/env bash

npm -g install yarn

set -e

cd "$(dirname "$(realpath "${BASH_SOURCE[0]}")")"

if [ "$SYSTEM" = "windows" ]; then
	cd ..
	exec bash my-scripts/pack-windows.sh
else
	source build-env/fn.sh
	set_path_when_developing
	source build-env/common.sh

	cd ..

	detect_install_nodejs
	yarn install
fi
