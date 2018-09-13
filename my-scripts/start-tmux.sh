#!/usr/bin/env bash

set -e

if [ "$(id -u)" -eq 0 ]; then
	echo "" >&2
	echo -e "\e[38;5;9;5mNO!\e[0m do not use root user." >&2
	echo -e "\tUse \e[38;5;14msudo -u XXXX $0\e[0m instead." >&2
	echo "" >&2
	exit 1
fi

cd "$(dirname "$(realpath "${BASH_SOURCE[0]}")")"
source fn.sh
set_path_when_developing
source common.sh
cd ..

if [ -n "${FOUND_CYGWIN}" ] ; then
	echo "running on windows." >&2
elif [ -z "${DISPLAY}" ]; then
	echo "no DISPLAY environment variable." >&2
	exit 1
fi

mkdir -p "${HOME}/.maix-dev/extensions"

ROOT="$(dirname "${VSCODE_ROOT}")"

TARGET="${1-maix-ide}"
TARGET="${TARGET%/}"

export TMUX_TMPDIR="$HOME"

if [ -z "${FOUND_CYGWIN}" ] && test -z "$DBUS_SESSION_BUS_ADDRESS" ; then
	## if not found, launch a new one
	eval $(dbus-launch --sh-syntax) || true
	if [ -z "$DBUS_SESSION_BUS_ADDRESS" ]; then
		echo "D-Bus per-session daemon address is: $DBUS_SESSION_BUS_ADDRESS"
	else
		echo "D-Bus was not found"
	fi
fi

TMUX=/usr/bin/tmux

if ! ${TMUX} has -t "=${TARGET}" ; then
	${TMUX} -2 new-session -d -s "${TARGET}"

	${TMUX} set-option mouse on
	${TMUX} setenv HOME "$HOME"
	${TMUX} setenv PATH "$PATH"
	${TMUX} setenv DISPLAY "${DISPLAY}"
	${TMUX} setenv HISTFILE "/dev/null"
	${TMUX} setenv ALL_PROXY "${HTTP_PROXY}"
	${TMUX} setenv HTTP_PROXY "${HTTP_PROXY}"
	${TMUX} setenv HTTPS_PROXY "${HTTP_PROXY}"
fi

function sushell() {
	if ! tmux list-windows -t "=${TARGET}" | grep "$1" ; then
		${TMUX} new-window -n "$1"
		${TMUX} set-window-option allow-rename off
		${TMUX} send-keys "$2" Enter
	fi
}

function lnext(){
	node "./my-scripts/build-env/ln-extension.js" "$1"
}

if [ -z "${FOUND_CYGWIN}" ]; then
	START_CODE_SCRIPT='bash ./scripts/code.sh'
else
	START_CODE_SCRIPT='unset PYTHON && history -c && ./scripts/code.bat'
	CWD="cd '$(pwd)' && "
fi

sushell compile "${CWD}yarn watch --cache-folder '${YARN_CACHE_FOLDER}'"

sushell vscode "${CWD}${START_CODE_SCRIPT}"

${TMUX} kill-window -t 'bash' || true

${TMUX} attach -E -t "=${TARGET}"
