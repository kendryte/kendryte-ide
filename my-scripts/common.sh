#!/usr/bin/env bash

export ARCH="$1"
if [ -z "$ARCH" ]; then
	ARCH=x64
fi

export npm_config_arch="$ARCH"

if [ -z "${VSCODE_ROOT}" ]; then
	export VSCODE_ROOT="$(dirname "$(dirname "$(realpath "${BASH_SOURCE[0]}")")")"
fi

if [ -z "${RELEASE_ROOT}" ]; then
	export RELEASE_ROOT="${VSCODE_ROOT}/.release"
	export ARCH_RELEASE_ROOT="${VSCODE_ROOT}/.release/maix-ide-release-${ARCH}"
fi

if [ -z "${REAL_HOME}" ]; then
	export REAL_HOME="${HOME}"
	export HOME="${RELEASE_ROOT}/FAKE_HOME"
fi

if [ -z "${TOOLCHAIN_BIN}" ]; then
	export TOOLCHAIN_BIN="${VSCODE_ROOT}/packages/toolchain/bin"
fi

if [ -n "${HTTP_PROXY}${http_proxy}" ]; then
	export HTTP_PROXY="${HTTP_PROXY-"${http_proxy}"}"
	export HTTPS_PROXY="${HTTP_PROXY}" http_proxy="${HTTP_PROXY}" https_proxy="${HTTP_PROXY}"
fi

if [ -z "${FOUND_CYGWIN}" ] || [ -z "${NODEJS}" ] ; then
	export FOUND_CYGWIN=$(find /bin -name 'cygwin*.dll')
	export YARN_CACHE_FOLDER="${HOME}/yarn-cache"
	if [ -n "${FOUND_CYGWIN}" ]; then
		export SYSTEM="windows"
		export NODEJS="${RELEASE_ROOT}/nodejs/${ARCH}/node.exe"
		export NODEJS_BIN="${RELEASE_ROOT}/nodejs/${ARCH}"
		export YARN_CACHE_FOLDER="$(cygpath -m "${YARN_CACHE_FOLDER}")"
		function sudo() { "$@"; }
	else
		export SYSTEM="linux"
		export NODEJS="${RELEASE_ROOT}/nodejs/${ARCH}/bin/node"
		export NODEJS_BIN="${RELEASE_ROOT}/nodejs/${ARCH}/bin"
		if ! command -v sudo &>/dev/null ; then
			function sudo() { "$@"; }
		fi
	fi
fi

if [ -n "${ORIGINAL_PATH}" ]; then
	export ORIGINAL_PATH="$PATH"
fi
export PATH="./node_modules/.bin:${TOOLCHAIN_BIN}:${NODEJS_BIN}:/bin:/usr/bin:/usr/sbin"
export PATH="./node_modules/.bin:${TOOLCHAIN_BIN}:${NODEJS_BIN}:/bin:/usr/bin:/usr/sbin"
if [ "$SYSTEM" = "windows" ]; then
	PATH="$PATH:$(cygpath -W):$(cygpath -S):$(cygpath -S)/Wbem:$(cygpath -S)/WindowsPowerShell/v1.0/"
fi

printf '%*s\n' "${COLUMNS:-$(tput cols)}" '' | tr ' ' =
echo -e "\e[1;38;5;9mSYSTEM\e[0m=\e[2m${SYSTEM}\e[0m"
echo -e "\e[1;38;5;9mARCH\e[0m=\e[2m${ARCH}\e[0m"
echo -e "\e[1;38;5;9mVSCODE_ROOT\e[0m=\e[2m${VSCODE_ROOT}\e[0m"
echo -e "\e[1;38;5;9mYARN_CACHE_FOLDER\e[0m=\e[2m${YARN_CACHE_FOLDER}\e[0m"
echo -e "\e[1;38;5;9mRELEASE_ROOT\e[0m=\e[2m${RELEASE_ROOT}\e[0m"
echo -e "\e[1;38;5;9mARCH_RELEASE_ROOT\e[0m=\e[2m${ARCH_RELEASE_ROOT}\e[0m"
echo -e "\e[1;38;5;9mPATH\e[0m=\e[2m${PATH}\e[0m"
echo -e "\e[1;38;5;9mREAL_HOME\e[0m=\e[2m${REAL_HOME}\e[0m"
echo -e "\e[1;38;5;9mHOME\e[0m=\e[2m${HOME}\e[0m"
echo -e "\e[1;38;5;9mFOUND_CYGWIN\e[0m=\e[2m${FOUND_CYGWIN}\e[0m"
echo -e "\e[1;38;5;9mNODEJS\e[0m=\e[2m${NODEJS}\e[0m"
echo -e "\e[1;38;5;9mNODEJS_BIN\e[0m=\e[2m${NODEJS_BIN}\e[0m"
echo -e "\e[1;38;5;9mHTTP_PROXY\e[0m=\e[2m${HTTP_PROXY}\e[0m"
printf '%*s\n' "${COLUMNS:-$(tput cols)}" '' | tr ' ' =
