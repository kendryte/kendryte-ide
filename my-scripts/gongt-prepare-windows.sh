#!/usr/bin/env bash

set -e

cd "$(dirname "$(realpath "${BASH_SOURCE[0]}")")"
cd ..

function R() {
	echo "+ $*"
	"$@"
}

if [ ! -e packages ]; then
	R mkdir -p /cygdrive/d/Projects/packages
	R cmd /C "mklink /J \"$(cygpath -w ./packages)\" \"$(cygpath -w /cygdrive/d/Projects/packages)\"" | iconv -f GBK
fi

if [ -d node_modules ]; then
	R rm -rf node_modules
fi
if [ ! -e node_modules ]; then
	R bash my-scripts/pack-windows.sh
fi
