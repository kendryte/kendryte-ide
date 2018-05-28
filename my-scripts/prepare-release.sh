#!/usr/bin/env bash

set -e
cd "$(dirname "$(realpath "${BASH_SOURCE[0]}")")"

if [ "$(id -u)" = "0" ]; then
	die "Do not use root."
fi

function prepare_arch() {
	export ARCH="$1"
	export npm_config_arch="$ARCH"
	source common.sh "${ARCH}"
	
	mkdir -p "${ARCH_RELEASE_ROOT}"
	mkdir -p "${HOME}"
	
	### install nodejs
	if [ ! -e "${NODEJS}" ]; then
		install_node "${ARCH}" "${RELEASE_ROOT}/nodejs/${ARCH}"
	fi
	echo "Node.js version: $("${NODEJS}" -v)"
	
	### install yarn (local install)
	local YARN=$(nodeBinPath yarn)
	if ! command -v "${YARN}" &>/dev/null ; then
		echo "install yarn..."
		${NODEJS} "$(nodeBinPath npm)" -g install yarn
	fi
}

function install_node() {
	echo "install nodejs $1 to $2"
	local ARCH="$1"
	local INSTALL_NODE="$2"
	mkdir -p "${INSTALL_NODE}"
	if [ ! -e "${INSTALL_NODE}.tar.gz" ]; then
		wget -c -O "${INSTALL_NODE}.tar.gz.downloading" "https://nodejs.org/dist/v8.11.2/node-v8.11.2-linux-${ARCH}.tar.xz"
		mv "${INSTALL_NODE}.tar.gz.downloading" "${INSTALL_NODE}.tar.gz"
	fi
	
	tar xf "${INSTALL_NODE}.tar.gz" --strip-components=1 -C "${INSTALL_NODE}"
}

prepare_arch x64
prepare_arch ia32
