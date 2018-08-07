#!/usr/bin/env bash

export ARCH="$1"
if [ -z "$ARCH" ]; then
	ARCH=x64
fi

export npm_config_arch="$ARCH"

export VSCODE_ROOT="$(dirname "$(dirname "$(realpath "${BASH_SOURCE[0]}")")")"
export RELEASE_ROOT="${VSCODE_ROOT}/.release"
export ARCH_RELEASE_ROOT="${VSCODE_ROOT}/.release/maix-ide-release-${ARCH}"
export YARN_CACHE_FOLDER="${VSCODE_ROOT}/.build/yarn-cache"

export REAL_HOME="$HOME"
export HOME="${RELEASE_ROOT}/FAKE_HOME"

P="$PATH"
P="${RELEASE_ROOT}/nodejs/${ARCH}/bin:$P"

export FOUND_CYGWIN=$(find /bin -name 'cygwin*.dll')
if [ -n "${FOUND_CYGWIN}" ]; then
	SYSTEM="windows"
	export NODEJS="${RELEASE_ROOT}/nodejs/${ARCH}/node.exe"
	export NODEJS_BIN="${RELEASE_ROOT}/nodejs/${ARCH}"
else
	SYSTEM="linux"
	export NODEJS="${RELEASE_ROOT}/nodejs/${ARCH}/bin/node"
	export NODEJS_BIN="${RELEASE_ROOT}/nodejs/${ARCH}/bin"
fi

P="${RELEASE_ROOT}/toolchain-multilib/bin:$P"
export PATH="$P"
echo -e "\e[38;5;14mPATH=$PATH\e[0m"