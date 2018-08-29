#!/usr/bin/env bash

set -e
cd "$(dirname "$(realpath "${BASH_SOURCE[0]}")")"
cd ..
if [ -e .yarnrc.bak ]; then
	echo ".yarnrc.bak exists, something not completed, refuse to commit."
	exit 1
fi
