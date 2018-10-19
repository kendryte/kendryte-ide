#!/usr/bin/env bash

set -e
cd "$(dirname "$(realpath "${BASH_SOURCE[0]}")")"
cd ..
if [ -e .yarnrc.bak ]; then
	echo ".yarnrc.bak exists, something not completed, refuse to commit."
	exit 1
fi

node -e "
const { writeFileSync } = require('fs');
const p = require('./package.json');
const d = new Date;
p.patchVersion = d.getFullYear().toFixed(0)
                + (d.getMonth() + 1)
                + d.getDate()
                + '.'
                + d.getHours()
                + d.getMinutes()
                + d.getSeconds();
p.patchVersion = parseFloat(p.patchVersion);
writeFileSync('./package.json', JSON.stringify(p, null, 2) + '\n', 'utf8');
"
git add package.json
