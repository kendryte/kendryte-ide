#!/usr/bin/env bash

set -e

if [ "$(id -u)" -eq 0 ]; then
	echo "" >&2
	echo -e "\e[38;5;9;5mNO!\e[0m do not use root user." >&2
	echo -e "\tUse \e[38;5;14msudo -u XXXX $0\e[0m instead." >&2
	echo "" >&2
	exit 1
fi
if [ -z "$DISPLAY" ]; then
	echo "no DISPLAY environment variable." >&2
	exit 1
fi

# dnf install -y wget curl tar xz libstdc++ python2 \
#	 make gcc-c++ libsecret-devel libX11-devel libxkbfile-devel \
#	 gtk2 libXtst libXScrnSaver GConf2 alsa-lib \
#	 wqy-zenhei-fonts wqy-unibit-fonts wqy-bitmap-fonts

VSCODE_ROOT="$(dirname "$(dirname "$(realpath "${BASH_SOURCE[0]}")")")"
ROOT="$(dirname "${VSCODE_ROOT}")"

TARGET="${1-maix-ide}"
TARGET="${TARGET%/}"

echo $PATH
P=$(echo "$PATH" | sed 's#:/usr/nodejs/bin##g')
P+=":${ROOT}/nodejs/bin"
P+=":${VSCODE_ROOT}/.build/electron/toolchain"

cd "${ROOT}/${TARGET}"

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
	eval $(dbus-launch --sh-syntax)
	echo "D-Bus per-session daemon address is: $DBUS_SESSION_BUS_ADDRESS"
fi

if ! tmux has -t "=${TARGET}" ; then
	/bin/tmux -2 new-session -d -s "${TARGET}"
	
	/bin/tmux set-option mouse on
	/bin/tmux setenv HOME "$ROOT/HOME"
	/bin/tmux setenv PATH "$P"
	/bin/tmux setenv HISTFILE "/dev/null"
	/bin/tmux setenv HTTP_PROXY "http://127.0.0.1:8080"
	/bin/tmux setenv HTTPS_PROXY "http://127.0.0.1:8080"
fi

function sushell() {
	if ! tmux list-windows -t "=${TARGET}" | grep "$1" ; then
		/bin/tmux new-window -n "$1"
		/bin/tmux set-window-option allow-rename off
		/bin/tmux send-keys "$2" Enter
	fi
}

sushell compile 'yarn watch'
sushell ext-cmake 'bash ./my-scripts/ext/cmake.sh'
sushell ext-cpptools 'bash ./my-scripts/ext/cpptools.sh'
sushell vscode 'bash ./scripts/code.sh'

/bin/tmux kill-window -t 'bash' || true

/bin/tmux attach -E -t "=${TARGET}"
