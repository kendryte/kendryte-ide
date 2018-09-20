#!/usr/bin/env bash

set -e

cd "$(dirname "$(realpath "${BASH_SOURCE[0]}")")"
source fn.sh
set_path_when_developing
source common.sh
cd ..

detect_install_nodejs

ensure_node_modules_in_current_dir

node build/lib/electron.js || ./node_modules/.bin/gulp electron

yarn watch
