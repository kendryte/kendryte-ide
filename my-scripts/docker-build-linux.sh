#!/usr/bin/env bash

############# prepare
set -e
cd "$(dirname "$(realpath "${BASH_SOURCE[0]}")")"
source build-env/fn.sh
source build-env/common.sh "$@"
cd ..

echo 8000000 > /proc/sys/fs/file-max
ulimit -n 1000000

{
	cat .gitignore
	echo ""
	echo ".idea/"
}  > .dockerignore

set -x
docker build -t "vscode-build-base-env" -f ./my-scripts/build-env/Dockerfile .
