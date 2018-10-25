#!/usr/bin/env bash

export NATIVE_TEMP=$(native_path "$TEMP")

WinPath=''
function pushP(){
	if echo "$1" | grep -qE '^/cygdrive/' ; then
		WinPath+="$1:"
	fi
}
path_foreach "${ORIGINAL_PATH}" pushP
unset pushP

CMD_GIT=$(PATH="${WinPath}" which git.exe) || die "required command git.exe not installed on windows."
function git() {
	HOME="$USERPROFILE" TEMP="${NATIVE_TEMP}" TMP="${NATIVE_TEMP}" "${CMD_GIT}" "$@"
}

CMD_PY=$(PATH="${WinPath}" which python.exe) || die "required command python.exe not installed on windows, run my-scripts/prepare-release.sh."
function python() {
	TEMP="${NATIVE_TEMP}" TMP="${NATIVE_TEMP}" "${CMD_PY}" "$@"
}

