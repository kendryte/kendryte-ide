#!/bin/bash

cd custom-extensions/vscode-cmake-tools

if [ ! -e node_modules ]; then
	yarn
fi
yarn compile