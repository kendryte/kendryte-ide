#!/bin/bash

set -e
cd "$(dirname "$(realpath "${BASH_SOURCE[0]}")")"

if test -e node_modules.asar ; then
	echo "remove node_modules.asar..."
	rm -f node_modules.asar
fi

if test -e node_modules.asar.unpacked ; then
	echo "remove node_modules.asar.unpacked..."
	rm -rf node_modules.asar.unpack
fi

set -x
#asar pack node_modules node_modules.asar --unpack *.node --unpack *.dll --unpack *.exe  --unpack *.pdb
gulp --gulpfile ./my-scripts/gulpfile/pack-win.js