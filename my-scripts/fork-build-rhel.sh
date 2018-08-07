#!/usr/bin/env bash

set -e
cd "$(dirname "$(realpath "${BASH_SOURCE[0]}")")"
source fn.sh
source common.sh

cd ..
mkdir -p ${RELEASE_ROOT}

if [ -z "${LIB_MACHINE}" ]; then
	export LIB_MACHINE=/var/lib/machines
fi
MACHINE="${LIB_MACHINE}/vscode-building-environment"

function mdnf() {
	if [ ! -d "${MACHINE}" ]; then
		echo "No such machine: $MACHINE" >&2
		exit 1
	fi
	shift
	
	/usr/bin/dnf -y \
--setopt=cachedir=../../../../../../../../../../../../../../../var/cache/dnf \
--setopt=config_file_path=/etc/dnf/dnf.conf \
--setopt=reposdir=/etc/yum.repos.d \
--releasever=/ --installroot="${MACHINE}" "$@"
}

echo "[Exec]
WorkingDirectory=/build
Boot=yes

[Files]
BindReadOnly=$(pwd)/:/build
Bind=$(pwd)/.release:/build

" > "${MACHINE}.nspawn"

mdnf install -y bash wget curl tar xz libstdc++ python2 \
	make gcc-c++ libsecret-devel libX11-devel libxkbfile-devel \
	libgtk-x11 gtk2 libXtst libXScrnSaver GConf2 alsa-lib \
	wqy-zenhei-fonts wqy-unibit-fonts wqy-bitmap-fonts
