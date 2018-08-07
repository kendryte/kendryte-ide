#!/usr/bin/env bash

export ARCH="$1"
export npm_config_arch="$ARCH"

export VSCODE_ROOT="$(dirname "$(dirname "$(realpath "${BASH_SOURCE[0]}")")")"
export RELEASE_ROOT="${VSCODE_ROOT}/.release"
export ARCH_RELEASE_ROOT="${VSCODE_ROOT}/.release/${ARCH}"
export YARN_CACHE_FOLDER="${VSCODE_ROOT}/.build/yarn-cache"

export REAL_HOME="$HOME"
export HOME="${RELEASE_ROOT}/FAKE_HOME"

function die() {
	echo -en "\n\e[38;5;9m" >&2
	echo -n  "$1" >&2
	echo -e "\e[0m\n" >&2
	exit 1
}

function nodeBinPath() {
	echo "${RELEASE_ROOT}/nodejs/${ARCH}/bin/$1"
}

if [ -z "$ARCH" ]; then
	die "no ARCH param."
fi

P="$PATH"

if find /bin -name 'cygwin*.dll' &>/dev/null ; then
	SYSTEM="windows"
	P="${RELEASE_ROOT}/nodejs/${ARCH}/bin:$P"
	export NODEJS="${RELEASE_ROOT}/nodejs/${ARCH}/node.exe"
else
	SYSTEM="linux"
	P="${RELEASE_ROOT}/nodejs/bin:$P"
	export NODEJS="${RELEASE_ROOT}/nodejs/${ARCH}/bin/node"
fi

P="${RELEASE_ROOT}/toolchain-multilib/bin:$P"
export PATH="$P"


trap step_end EXIT INT TERM

SN=0
SN_LIST=()
STAT_SHOW=
function step(){
	local oldEset=${-//[^e]/}
	set +e

	SN=$((SN + 1))
	local title="$1"
	shift

	echo -e "\e[38;5;14mStep ${SN}: $title:\e[0m"
	echo " -- $*"

	bash -c "while true; do sleep 1; echo -ne \"\rRunning: $title\r\"; done" &
	STAT_SHOW=$!

	"$@"
	local RET=$?

	kill -9 "${STAT_SHOW}"

	if [ $RET -eq 0 ] ; then
		echo -e "\e[38;5;10mStep ${SN}: $title Susccess.\e[0m"
		SN_LIST+=("$title: \e[38;5;10mSusccess\e[0m")
	else
		echo -e "\e[38;5;9mStep ${SN}: $title Failed.\e[0m"
		SN_LIST+=("$title: \e[38;5;9mFailed\e[0m")
	fi

	if [[ -n "$oldEset" ]]; then set -e; else set +e; fi

	return $RET
}
function step_end() {
	if [ $SN -eq 0 ]; then
		return
	fi
	echo "Stopping Running task..."
	kill -9 "${STAT_SHOW}"
	sleep 1
	echo "=========================="
	for I in "${SN_LIST[@]}" ; do
		echo -e "  $I"
	done
	echo "=========================="
}