#!/bin/bash

set -e

cd custom-extensions/maix.cpptools-666.6.6

if [ ! -e node_modules ]; then
	yarn
fi
yarn watch