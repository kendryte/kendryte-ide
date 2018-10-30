#!/usr/bin/env bash

export ARCH="x64"

export PRODUCT_NAME="KendryteIDE"

ANY_CHANGE=
MYSELF_DIR=$(dirname "$(realpath "${BASH_SOURCE[0]}")")

if [ -z "${VSCODE_ROOT}" ]; then
	ANY_CHANGE=yes
	#  echo "changed VSCODE_ROOT"
	export VSCODE_ROOT="$(dirname "$(dirname "$MYSELF_DIR")")"
fi

if [ -z "${RELEASE_ROOT}" ]; then
	ANY_CHANGE=yes
	#  echo "changed RELEASE_ROOT"
	export RELEASE_ROOT="${VSCODE_ROOT}/.release"
	export ARCH_RELEASE_ROOT="${VSCODE_ROOT}/.release/kendryte-ide-release-${ARCH}"
fi

if [ -z "${REAL_HOME}" ]; then
	ANY_CHANGE=yes
	#  echo "changed REAL_HOME"
	export REAL_HOME="${HOME}"
	export HOME="${RELEASE_ROOT}/FAKE_HOME"
fi

if [ -n "${HTTP_PROXY}${http_proxy}" ]; then
	export HTTP_PROXY="${HTTP_PROXY-"${http_proxy}"}"
	export HTTPS_PROXY="${HTTP_PROXY}" http_proxy="${HTTP_PROXY}" https_proxy="${HTTP_PROXY}"
fi

if [ -z "${SYSTEM}" ]; then
	ANY_CHANGE=yes
	#  echo "changed SYSTEM"
	export SYSTEM=
	export FOUND_CYGWIN=
	detect_system
fi

if [ -z "${NODEJS}" ] ; then
	ANY_CHANGE=yes
	#  echo "changed NODEJS"
	export NODEJS_INSTALL="${HOME}/nodejs"
	if [ "${SYSTEM}" = "windows" ]; then
		export NODEJS="${NODEJS_INSTALL}/node.exe"
		export NODEJS_BIN="${NODEJS_INSTALL}"
	else
		export NODEJS="${NODEJS_INSTALL}/bin/node"
		export NODEJS_BIN="${NODEJS_INSTALL}/bin"
	fi
fi

export YARN_CACHE_FOLDER="$(yarnGlobalDir yarn/cache)"

if [ -z "${SYSTEM_ORIGINAL_PATH}" ]; then
	ANY_CHANGE=yes
	#  echo "changed SYSTEM_ORIGINAL_PATH"
	export SYSTEM_ORIGINAL_PATH="$PATH"

	mkdir -p "${RELEASE_ROOT}/wrapping-bins"

	PLATFORM_PREPEND_PATH=
	PLATFORM_APPEND_PATH=
	if [ "${SYSTEM}" = "windows" ]; then
		PLATFORM_APPEND_PATH="$(cygpath -W):$(cygpath -S):$(cygpath -S)/Wbem:$(cygpath -S)/WindowsPowerShell/v1.0"
		source "${MYSELF_DIR}/wrapped-commands-win.sh"
	elif [ "$SYSTEM" = "mac" ]; then
		PLATFORM_PREPEND_PATH="/usr/local/bin" # brew default
	else
		source "${MYSELF_DIR}/wrapped-commands-nix.sh"
	fi

	export PATH=""

	# prependPath "${RELEASE_ROOT}/wrapping-bins"
	if [ -n "${PLATFORM_PREPEND_PATH}" ] ; then
		appendPath "${PLATFORM_PREPEND_PATH}"
	fi
	appendPath "/bin:/usr/bin:${NODEJS_BIN}"
	if [ -n "${PLATFORM_APPEND_PATH}" ] ; then
		appendPath "${PLATFORM_APPEND_PATH}"
	fi

	unset PLATFORM_PREPEND_PATH
	unset PLATFORM_APPEND_PATH
fi

export TMP="${RELEASE_ROOT}/tmp"
export TEMP="${TMP}"
[ -e "$TMP" ] || mkdir -p "$TMP"

if [ "${npm_config_runtime}" != electron ]; then
	pushd "${VSCODE_ROOT}" &>/dev/null
	export npm_config_arch="$ARCH"
	export npm_config_disturl=https://atom.io/download/electron
	export npm_config_target=$(node -p "require('./build/lib/electron').getElectronVersion();")
	export npm_config_runtime=electron
	export npm_config_cache="$TMP/npm-cache"
	popd &>/dev/null
fi

if [ -n "${ANY_CHANGE}" ]; then
	printf '%*s\n' "${COLUMNS:-$(tput cols)}" '' | tr ' ' =
	echo -e "\e[1;38;5;9m:\$BASH_SOURCE\e[0m = \e[2m${BASH_SOURCE[@]}\e[0m"
	echo -e "\e[1;38;5;9m: SYSTEM\e[0m = \e[2m${SYSTEM}\e[0m"
	echo -e "\e[1;38;5;9m: ARCH\e[0m = \e[2m${ARCH}\e[0m"
	echo -e "\e[1;38;5;9m: VSCODE_ROOT\e[0m = \e[2m${VSCODE_ROOT}\e[0m"
	echo -e "\e[1;38;5;9m: YARN_CACHE_FOLDER\e[0m = \e[2m${YARN_CACHE_FOLDER}\e[0m"
	echo -e "\e[1;38;5;9m: RELEASE_ROOT\e[0m = \e[2m${RELEASE_ROOT}\e[0m"
	echo -e "\e[1;38;5;9m: ARCH_RELEASE_ROOT\e[0m = \e[2m${ARCH_RELEASE_ROOT}\e[0m"
	echo -e "\e[1;38;5;9m: PATH\e[0m = \e[2m${PATH}\e[0m"
	echo -e "\e[1;38;5;9m: TEMP\e[0m = \e[2m${TEMP}\e[0m"
	echo -e "\e[1;38;5;9m: REAL_HOME\e[0m = \e[2m${REAL_HOME}\e[0m"
	echo -e "\e[1;38;5;9m: HOME\e[0m = \e[2m${HOME}\e[0m"
	echo -e "\e[1;38;5;9m: FOUND_CYGWIN\e[0m = \e[2m${FOUND_CYGWIN}\e[0m"
	echo -e "\e[1;38;5;9m: NODEJS\e[0m = \e[2m${NODEJS}\e[0m"
	echo -e "\e[1;38;5;9m: NODEJS_BIN\e[0m = \e[2m${NODEJS_BIN}\e[0m"
	echo -e "\e[1;38;5;9m: HTTP_PROXY\e[0m = \e[2m${HTTP_PROXY}\e[0m"
	printf '%*s\n' "${COLUMNS:-$(tput cols)}" '' | tr ' ' =
fi
unset ANY_CHANGE
