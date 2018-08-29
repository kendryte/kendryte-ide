#!/usr/bin/env bash

set -e
cd "$(dirname "$(realpath "${BASH_SOURCE[0]}")")"
cd ..

if [ -e ".yarnrc.bak" ]; then
	rm -f .yarnrc
	mv .yarnrc.bak .yarnrc
fi
