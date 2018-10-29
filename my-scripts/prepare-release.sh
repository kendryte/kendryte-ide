#!/usr/bin/env bash

set -e

function install_nodejs_on_mac() {
	echo "install nodejs on MacOS to $NODEJS_INSTALL"
	local TARGET="${TEMP}/nodejs.tar.xz"
	ensure_download_file "https://nodejs.org/dist/v8.11.2/node-v8.11.2-darwin-x64.tar.xz" "${TARGET}"
	tar xf "${TARGET}." --strip-components=1 -C "${NODEJS_INSTALL}"
}
function install_nodejs_on_linux() {
	echo "install nodejs on linux to $NODEJS_INSTALL"
	local TARGET="${TEMP}/nodejs.tar.xz"
	ensure_download_file "https://nodejs.org/dist/v8.11.2/node-v8.11.2-linux-x64.tar.xz" "${TARGET}"
	tar xf "${TARGET}" --strip-components=1 -C "${NODEJS_INSTALL}"
}
function install_nodejs_on_windows() {
	echo "install nodejs on windows to $NODEJS_INSTALL"
	local TARGET="${TEMP}/nodejs.zip"
	ensure_download_file "https://nodejs.org/dist/v8.11.2/node-v8.11.2-win-x64.zip" "${TARGET}"

	local UNZIP_TMP="${TEMP}/nodejs.unzip"

	[ -e "${UNZIP_TMP}" ] && rm -rf "${UNZIP_TMP}"
	[ -e "${NODEJS_INSTALL}" ] && rm -rf "${NODEJS_INSTALL}"

	echo "decompress nodejs to ${UNZIP_TMP}... please wait..."
	unzip -q -u "${TARGET}" -d "${UNZIP_TMP}"
	echo "move nodejs to ${NODEJS_INSTALL}..."
	mv "${UNZIP_TMP}"/node-* "${NODEJS_INSTALL}"
}

cd "$(dirname "$(realpath "${BASH_SOURCE[0]}")")"
source build-env/fn.sh
source build-env/common.sh

mkdir -p "${ARCH_RELEASE_ROOT}"
mkdir -p "${HOME}"

### install nodejs
if [ ! -e "${NODEJS}" ]; then
	echo "nodejs is not found at $NODEJS"
	if [ "${SYSTEM}" = "windows" ]; then
		install_nodejs_on_windows
	elif [ "${SYSTEM}" = "linux" ]; then
		install_nodejs_on_linux
	else
		install_nodejs_on_mac
	fi
	chmod a+x "${NODEJS_BIN}"/*
fi

### install yarn (local install)
YARN=$(nodeBinPath yarn)
if ! [ -e "${YARN}" ] &>/dev/null ; then
	echo "install yarn to $YARN..."
	"$(nodeBinPath npm)" -g install yarn
fi
unset YARN

### install deps --
npm-ensure-global-binary node-gyp node-gyp
npm-ensure-global-binary node-pre-gyp node-pre-gyp

if [ "$SYSTEM" = "windows" ]; then
	pushd "${TEMP-${TMP}}" &>/dev/null || die "Cannot get temp folder by env var: TMP, TEMP"
	if ! cat "$(cygpath -u "$(yarn global dir)/package.json")" | grep -q windows-build-tools &&
	   ! cat "$(cygpath -u "$("$(nodeBinPath yarn)" global dir)/package.json")" | grep -q windows-build-tools ; then
		echo -e "===========================\n\n\tPlease Wait for install windows-build-tools\n : You will need \"Press any key to continue\" in That window .\n\n==========================="

		YARN=$(native_path "${RELEASE_ROOT}/wrapping-bins/yarn.bat")
		echo "@echo off
set PATH=$(cygpath -w "$NODEJS");C:/Windows;C:/WINDOWS/system32;C:/WINDOWS/System32/Wbem;C:/WINDOWS/System32/WindowsPowerShell/v1.0
set HTTP_PROXY=$HTTP_PROXY
set HTTPS_PROXY=$HTTPS_PROXY
cd /d \"$(cygpath -w "$(pwd)")\"
\"$YARN\" global add windows-build-tools
pause
" > install-windows-build-tools.cmd

		cygstart --wait --action=runas cmd /C "\"$(native_path "$(pwd)")/install-windows-build-tools.cmd\"" || die "Cannot run install windows-build-tools"
		if ! cat "$(cygpath -u "$(yarn global dir)/package.json")" | grep -q windows-build-tools ; then
			dieFile "Install windows-build-tools Failed" "$(yarn global dir)/yarn-error.log"
		fi
	fi
	popd &>/dev/null
fi
