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
source common.sh
cd ..

if [ -z "${FOUND_CYGWIN}" ] ; then
	echo "running on windows." >&2
elif [ -z "${DISPLAY}" ]; then
	echo "no DISPLAY environment variable." >&2
	exit 1
fi

mkdir -p "${HOME}/.maix-dev/extensions"

ROOT="$(dirname "${VSCODE_ROOT}")"

TARGET="${1-maix-ide}"
TARGET="${TARGET%/}"

export TMUX_TMPDIR="$ROOT/HOME"

export EXTENSION_DIR="$ROOT/HOME/.maix-dev/extensions"
if [ -L "${EXTENSION_DIR}" ]; then
	unlink "${EXTENSION_DIR}"
elif [ -d "${EXTENSION_DIR}" ]; then
	rm -rf "${EXTENSION_DIR}"
fi
ln -s "${VSCODE_ROOT}/custom-extensions" "${EXTENSION_DIR}"

if test -z "$DBUS_SESSION_BUS_ADDRESS" ; then
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
	${TMUX} setenv HOME "$ROOT/HOME"
	${TMUX} setenv PATH "$P"
	${TMUX} setenv HISTFILE "/dev/null"
	${TMUX} setenv HTTP_PROXY "http://127.0.0.1:8080"
	${TMUX} setenv HTTPS_PROXY "http://127.0.0.1:8080"
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

sushell compile 'yarn watch'

lnext cmake-tools
sushell ext-cmake 'bash ./my-scripts/ext/cmake.sh'

lnext cmake-tools-helper
sushell ext-cmake-helper 'bash ./my-scripts/ext/cmake-helper.sh'

lnext cpptools
sushell ext-cpptools 'bash ./my-scripts/ext/cpptools.sh'

sushell vscode 'bash ./scripts/code.sh'

${TMUX} kill-window -t 'bash' || true

${TMUX} attach -E -t "=${TARGET}"
