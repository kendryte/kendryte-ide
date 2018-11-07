#!/usr/bin/env bash

set -e
cd "${VSCODE_ROOT}"

function prompt_path(){
	local PW="$1"
	local NL="${1#$VSCODE_ROOT}"
	if [ "$NL" = "$PW" ]; then
		echo -e "[\e[38;5;10m$2\e[0m $(basename "$1")]$ "
	elif [ -n "$NL" ]; then
		echo -e "[\e[38;5;14mKendryteIDE\e[0m ${NL#/}]$ "
	else
		echo -e "[\e[38;5;14mKendryteIDE\e[0m]$ "
	fi
}
export -f prompt_path
export PROMPT_COMMAND='echo -en "\e]0;Kendryte IDE Source Code :: $(pwd)\007"'
export PS1='$(prompt_path "\w" "\u")'

show-help

echo -e "\e[38;5;10m > The anwser is 42 <\e[0m"

cd "${VSCODE_ROOT}" # required last item
set +e
