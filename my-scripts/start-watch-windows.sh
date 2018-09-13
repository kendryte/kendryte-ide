#!/usr/bin/env bash

set -e

cd "$(dirname "$(realpath "${BASH_SOURCE[0]}")")"
source fn.sh
set_path_when_developing
source common.sh
cd ..

echo -n $(command -v node)" -> "$(node -v)

if ! [ -e node_modules ]; then
	die "Emmmm, yarn install ?"
fi

node build/lib/electron.js || ./node_modules/.bin/gulp electron

yarn watch
