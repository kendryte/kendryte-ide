#!/bin/bash

set -e

cd custom-extensions/maix.cmake-tools-666.6.6

if [ ! -e node_modules ]; then
	yarn
fi
yarn compile