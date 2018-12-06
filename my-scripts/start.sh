#!/usr/bin/env bash
set -e

function die() {
	echo -en "\e[38;5;9m" >&2
	echo -en "$*" >&2
	echo -e "\e[0m" >&2
	exit 1
}

if [ -z "${BASH_SOURCE[0]}" ]; then
	die "Your bash is too old to run this. consider system upgrade."
fi
if [ "$(id -u)" -eq 0 ]; then
	die "Do not use root."
fi

/bin/sh --version &>/dev/null || die "Your /bin/sh is missing, please create link (eg: ln -s bash /bin/sh)."
/bin/sh --version 2>&1 | grep -q "bash" || die "Your /bin/sh is not a standard BASH, that is not supported."

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