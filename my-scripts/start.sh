#!/usr/bin/env bash
set -e

if [ -z "${BASH_SOURCE[0]}" ]; then
	echo "Your bash is too old to run this. consider system upgrade."
	exit 1
fi
if [ "$(id -u)" -eq 0 ]; then
	echo "Do not use root."
	exit 1
fi

export MY_SCRIPT_ROOT="$(dirname "$(realpath "${BASH_SOURCE[0]}")")"

cd "$MY_SCRIPT_ROOT"
. build-env/bash/fn.sh
cd "$MY_SCRIPT_ROOT"
. build-env/bash/env.sh
cd "$MY_SCRIPT_ROOT"
. build-env/bash/listcommands.sh

if [ -z "${AlreadyInited}" ]; then
	cd "$MY_SCRIPT_ROOT"
	. build-env/bash/init.sh

	export AlreadyInited=yes
fi

exec bash --noprofile --rcfile "${SCRIPT_LIB_ROOT}/rc.sh"
