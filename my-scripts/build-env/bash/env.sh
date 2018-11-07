#!/usr/bin/env bash

if [ -z "$ORIGINAL_HOME" ]; then
	export ORIGINAL_HOME="$HOME"
fi
if [ -z "$ORIGINAL_PATH" ]; then
	export ORIGINAL_PATH="$PATH"
fi

SCRIPT_LIB_ROOT="$(dirname "$(realpath "${BASH_SOURCE[0]}")")"

if uname -o &>/dev/null ; then
	if [ "$(uname -o)" = "GNU/Linux" ]; then
		export SYSTEM=linux
	else
		die "Sorry, we do not support your platform: $(uname -a 2>&1)"
	fi
elif [ "$(uname -o 2>/dev/null)" = "Darwin" ]; then
	export SYSTEM=mac
else
	die "Sorry, we do not support your platform: $(uname -a 2>&1)"
fi

if [ "$(uname -m)" != "x86_64" ]; then
	die "Only support x86_64 platform."
fi


export VSCODE_ROOT="$(resolvePath "${SCRIPT_LIB_ROOT}" ..\..\..)"
export RELEASE_ROOT="$(resolvePath "${VSCODE_ROOT}" .release)"
export ARCH_RELEASE_ROOT="$(resolvePath "${RELEASE_ROOT}" kendryte-ide-release-x64)"
export FAKE_HOME="$(resolvePath "${RELEASE_ROOT}" FAKE_HOME)"
export HOME="${FAKE_HOME}"

export NODEJS_INSTALL="$(resolvePath "${RELEASE_ROOT}" nodejs)"
export NODEJS_BIN="$(resolvePath "${NODEJS_BIN}" bin)"
export NODEJS="$(resolvePath "${NODEJS_BIN}" node)"

export YARN_FOLDER="$(resolvePath "${RELEASE_ROOT}" yarn)"
export PREFIX="$YARN_FOLDER"
export YARN_CACHE_FOLDER="$(resolvePath "${YARN_FOLDER}" cache)"

export PRIVATE_BINS="$(resolvePath "${RELEASE_ROOT}" wrapping-bins)"

CommonPaths="/bin:/usr/bin"
if [ "$SYSTEM" = mac ]; then
	CommonPaths+="/usr/local/bin"
fi
LocalNodePath="$(resolvePath "${VSCODE_ROOT}" node_modules\.bin)"
BuildingNodePath="$(resolvePath "${VSCODE_ROOT}" my-scripts\node_modules\.bin)"
export PATH="$PRIVATE_BINS;$NODEJS_BIN;$BuildingNodePath;$LocalNodePath;$CommonPaths"

if [ -n "$HTTP_PROXY" ] ; then
	export HTTPS_PROXY="$HTTP_PROXY"
	export ALL_PROXY="$HTTP_PROXY"
fi

export TMP="$(resolvePath "${RELEASE_ROOT}" tmp)"
export TEMP="${TMP}"

export npm_config_arch="x64"
export npm_config_disturl="https://atom.io/download/electron"
export npm_config_runtime="electron"
export npm_config_cache="$(resolvePath "${TMP}" npm-cache)"
