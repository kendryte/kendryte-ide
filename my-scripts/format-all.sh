#!/usr/bin/env bash

set -e

cd "$(dirname "$(realpath "${BASH_SOURCE[0]}")")"
source fn.sh
set_path_when_developing
source common.sh
cd ..

detect_install_nodejs

ensure_node_modules_in_current_dir

echo -e '\ec'

set +e
echo "running reformat on ALL source files, this will use about 1min. please wait." >&2
echo "waiting for 'yarn gulp hygiene'" >&2
OUT="$(yarn --cache-folder "${YARN_CACHE_FOLDER}" gulp hygiene 2>&1)"
RET=$?
echo "$OUT" >&2
set -e

if [ ${RET} -ne 0 ]; then
	echo -e "\e[38;5;9mgulp hygiene return ${RET}.\e[0m" >&2
fi

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

echo -e "

=====================
\e[38;5;10mAll supported file reformatted ! But you need to run 'gulp hygiene' again now.\e[0m

"
