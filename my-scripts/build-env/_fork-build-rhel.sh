#!/usr/bin/env bash

set -e

export HTTPS_PROXY=http://127.0.0.1:8080
export HTTP_PROXY="${HTTPS_PROXY}"


cd "$(dirname "$(realpath "${BASH_SOURCE[0]}")")"
source ../fn.sh
source ../common.sh

cd ..
mkdir -p ${RELEASE_ROOT}

if [ -z "${LIB_MACHINE}" ]; then
	export LIB_MACHINE=/var/lib/machines
fi
MACHINE_NAME="vscode-building-environment"
MACHINE="${LIB_MACHINE}/${MACHINE_NAME}"
mkdir -p "${MACHINE}"


function mdnf() {
	if [ ! -d "${MACHINE}" ]; then
		echo "No such machine: $MACHINE" >&2
		exit 1
	fi
	
	/usr/bin/dnf -y \
--setopt=cachedir=../../../../../../../../../../../../../../../var/cache/dnf \
--setopt=config_file_path=/etc/dnf/dnf.conf \
--setopt=reposdir=/etc/yum.repos.d \
--releasever=/ --installroot="${MACHINE}" "$@"
}

if [ ! -e "${MACHINE}/bin/git" ]; then
	mdnf install -y bash wget curl tar xz python2 findutils git \
		make libstdc++ gcc-c++ libsecret-devel libX11-devel libxkbfile-devel \
		gtk2 libXtst libXScrnSaver GConf2 alsa-lib \
		wqy-zenhei-fonts wqy-unibit-fonts wqy-bitmap-fonts
fi

systemd-nspawn \
	--bind-ro="$(pwd)/:/build" \
	--bind="$(pwd)/.release:/build/.release" \
	--setenv="HTTP_PROXY=${HTTP_PROXY}" \
	--setenv="HTTPS_PROXY=${HTTP_PROXY}" \
	--machine ${MACHINE_NAME} \
	/bin/bash -c 'git config --system http.proxy "$HTTP_PROXY" && git config --system https.proxy "$HTTPS_PROXY"'

systemd-nspawn \
	--bind-ro="$(pwd)/:/build" \
	--bind="$(pwd)/.release:/build/.release" \
	--setenv="HTTP_PROXY=${HTTP_PROXY}" \
	--setenv="HTTPS_PROXY=${HTTP_PROXY}" \
	--machine ${MACHINE_NAME} \
	bash /build/my-scripts/build-linux.sh
