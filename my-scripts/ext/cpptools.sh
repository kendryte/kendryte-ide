#!/bin/bash

cd custom-extensions/vscode-cpptools

if [ ! -e node_modules ]; then
	yarn
fi
yarn watch