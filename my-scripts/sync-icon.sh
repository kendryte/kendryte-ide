#!/bin/bash

set -x
set -e

cd "$(dirname "$(realpath "${BASH_SOURCE[0]}")")"
cd ..
cd resources

convert -background none -resize 1024x1024 -gravity center -extent 1024x1024 logo.svg linux/code.png

convert -background none -resize 512x512 -gravity center -extent 512x512 logo.svg -define icon:auto-resize win32/code.ico
convert -background none -resize 70x70 -gravity center -extent 70x70 logo.svg win32/code_70x70.png
convert -background none -resize 150x150 -gravity center -extent 150x150 logo.svg win32/code_150x150.png
