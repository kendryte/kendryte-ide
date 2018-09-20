#!/usr/bin/env bash

set -e

cd "$(dirname "$(realpath "${BASH_SOURCE[0]}")")"
source fn.sh
set_path_when_developing
source common.sh
cd ..

echo -n "detect nodejs: "
echo $(command -v node)" -> "$(node -v)

ensure_node_modules_in_current_dir

if [ "$SYSTEM" = "windows" ]; then
	cmd /c scripts\\code.bat 2>&1 | iconv -f GBK -t UTF8
else
	bash scripts/code.sh
fi
