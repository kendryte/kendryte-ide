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

if [ $# -eq 0 ]; then
	bash --rcfile "$(dirname "$(realpath "${BASH_SOURCE[0]}")")/build-env/bash/rc.sh" || {
		RET=$?
		if [ $RET -eq 0 ]; then
			exit 0
		fi
		
		echo -e "\n  \e[38;5;9mCommand failed with error $RET.\e[0m" >&2
		exit $RET
	}
else
	source "$(dirname "$(realpath "${BASH_SOURCE[0]}")")/build-env/bash/rc.sh"
	"$@" || die "Command failed with error $RET"
fi