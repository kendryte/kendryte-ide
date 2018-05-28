#!/usr/bin/env bash

export ARCH="$1"
export npm_config_arch="$ARCH"

export VSCODE_ROOT="$(dirname "$(dirname "$(realpath "${BASH_SOURCE[0]}")")")"
export RELEASE_ROOT="${VSCODE_ROOT}/.release"
export ARCH_RELEASE_ROOT="${VSCODE_ROOT}/.release/${ARCH}"
export YARN_CACHE_FOLDER="${VSCODE_ROOT}/.build/yarn-cache"

export REAL_HOME="$HOME"
export HOME="${RELEASE_ROOT}/FAKE_HOME"

export NODEJS="${RELEASE_ROOT}/nodejs/${ARCH}/bin/node"

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
P="${RELEASE_ROOT}/nodejs/bin:$P"
P="${RELEASE_ROOT}/toolchain-multilib/bin:$P"
export PATH="$P"
