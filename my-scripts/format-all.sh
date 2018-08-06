#!/usr/bin/env bash

npm run -s precommit 2>&1 | grep 'File not formatted:' | sed 's/File not formatted://g' | xargs -n1 -IF bash -c '
echo -e "\e[38;5;14mF\e[0m"
tsfmt -r F
'


npm run -s precommit 2>&1 | grep '.css' | sed -E 's/\(.+$//g' | uniq | xargs -n1 -IF bash -c '
echo -e "\e[38;5;11mF\e[0m"
css-beautify --end-with-newline --indent-with-tabs -r -f F
'

