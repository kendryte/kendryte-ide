#!/usr/bin/env bash

echo "waiting for 'yarn gulp hygiene'" >&2
OUT="$(yarn --cache-folder '${YARN_CACHE_FOLDER}' gulp hygiene 2>&1)"
echo "$OUT" >&2
echo "$OUT" | grep 'File not formatted:' | sed 's/File not formatted://g' | xargs -n1 -IF bash -c '
echo -e "\e[38;5;14mF\e[0m"
tsfmt -r F
git add F
'


echo "$OUT" | grep '.css' | sed -E 's/\(.+$//g' | uniq | xargs -n1 -IF bash -c '
echo -e "\e[38;5;11mF\e[0m"
css-beautify --end-with-newline --indent-with-tabs -r -f F
git add F
'

