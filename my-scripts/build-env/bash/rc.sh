#!/usr/bin/env bash

set -e

if [ -e "${ORIGINAL_HOME-$HOME}/.bashrc" ]; then
	source "${ORIGINAL_HOME-$HOME}/.bashrc" || {
			echo "Warning: can not load .bashrc"
		}
fi

MY_SCRIPT_ROOT="$(dirname "$(realpath "${BASH_SOURCE[0]}")")"

cd "$MY_SCRIPT_ROOT"
. fn.sh
cd "$MY_SCRIPT_ROOT"
. env.sh

if [ -z "${AlreadyInited}" ]; then
	cd "$MY_SCRIPT_ROOT"
	. init.sh
	cd "$MY_SCRIPT_ROOT"
	. listcommands.sh

	export AlreadyInited=yes
fi

cd "${VSCODE_ROOT}"

function prompt_path(){
	local PW="$1"
	local NL="${1#$VSCODE_ROOT}"
	if [ "$NL" = "$PW" ]; then
		echo -e "[\[\e[38;5;10m\]\u\[\e[0m\] $(basename "$1")]$ "
	elif [ -n "$NL" ]; then
		echo -e "[\[\e[38;5;14m\]KendryteIDE\[\e[0m\] ${NL#/}]$ "
	else
		echo -e "[\[\e[38;5;14m\]KendryteIDE\[\e[0m\]]$ "
	fi
}
function prompt() {
	echo -en "\e]0;Kendryte IDE Source Code :: $(pwd)\007"
	export PS1="$(prompt_path "$(pwd)")"
}
export -f prompt_path
export -f prompt
export PROMPT_COMMAND="prompt"

echo -e "\ec"

show-help

echo
echo -e "\e[38;5;10m > The anwser is 42 <\e[0m"
echo

cd "${VSCODE_ROOT}" # required last item
set +e
