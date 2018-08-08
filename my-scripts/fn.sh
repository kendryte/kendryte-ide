#!/usr/bin/env bash

function die() {
	echo -en "\n\e[38;5;9m" >&2
	echo -n  "$1" >&2
	echo -e "\e[0m\n" >&2
	exit 1
}

function nodeBinPath() {
	echo "${NODEJS_BIN}/$1"
}

function nodeBinPathForRequire() {
	if [ -n "${FOUND_CYGWIN}" ]; then
		cygpath -m "${NODEJS_BIN}/$1"
	else
		echo "${NODEJS_BIN}/$1"
	fi
}

trap step_end EXIT INT TERM

SN=0
SN_LIST=()
STAT_SHOW=
function step(){
	local oldEset=${-//[^e]/}
	set +e

	SN=$((SN + 1))
	local title="$1"
	shift

	echo -e "\e[38;5;14mStep ${SN}: $title:\e[0m"
	echo " -- $*"

	"$@" &
	local STAT_PID=$!

	bash -c "dd=''
while true; do
	sleep 1
	[ -d /proc/$STAT_PID ] || exit
	[ \"\${#dd}\" -gt 10 ] && { dd=''; echo -ne '\r\e[K'; }
	dd+='.'
	echo -ne \"\rRunning: $title\${dd}\r\"
done" &
	STAT_SHOW=$!

	wait ${STAT_PID}
	local RET=$?

	kill -2 "${STAT_SHOW}" &>/dev/null

	if [ ${RET} -eq 0 ] ; then
		echo -e "\e[38;5;10mStep ${SN}: $title Susccess.\e[0m"
		SN_LIST+=("$title: \e[38;5;10mSusccess\e[0m")
	else
		echo -e "\e[38;5;9mStep ${SN}: $title Failed.\e[0m"
		SN_LIST+=("$title: \e[38;5;9mFailed\e[0m")
	fi

	if [[ -n "$oldEset" ]]; then set -e; else set +e; fi

	return ${RET}
}
function step_end() {
	if [ ${SN} -eq 0 ]; then
		return
	fi
	echo "Stopping Running task..."
	kill -2 "${STAT_SHOW}" &>/dev/null
	sleep 1
	echo "=========================="
	for I in "${SN_LIST[@]}" ; do
		echo -e "  $I"
	done
	echo "=========================="
}

function hash_files_check_changed() { # change return 0 ( test success )
	local HASH="${RELEASE_ROOT}/head_hash.md5"
	if [ -e "${HASH}" ]; then
		pushd "${VSCODE_ROOT}" &>/dev/null
		if git archive HEAD | md5sum --status -c "${HASH}" ; then
			RET=1
			echo "source code not changed: $(< "${HASH}")"
		else
			RET=0
			echo "source code has changed: $(< "${HASH}")"
		fi
		popd &>/dev/null
	else
		echo "source code not exists."
		RET=0
	fi
	RET=$?
	return ${RET}
}

function hash_files_save() {
	local HASH="${RELEASE_ROOT}/head_hash.md5"
	pushd "${VSCODE_ROOT}" &>/dev/null
	git archive head | md5sum > "${HASH}"
	popd &>/dev/null
}


function hash_deps_check_changed() { # change return 0 ( test success )
	local DEP_NAME="$1"
	local DEP_FILE="$2"
	local HASH="${RELEASE_ROOT}/dep_${DEP_NAME}_hash.md5"
	if [ -e "${HASH}" ] && ( cat "$DEP_FILE" | md5sum --status -c "${HASH}" ) ; then
		echo "dependency ${DEP_NAME} not changed"
		return 1
	else
		echo "dependency ${DEP_NAME} has changed"
		return 0
	fi
}

function hash_deps_save() {
	local DEP_NAME="$1"
	local DEP_FILE="$2"
	local HASH="${RELEASE_ROOT}/dep_${DEP_NAME}_hash.md5"
	cat "$DEP_FILE" | md5sum > "${HASH}"
}
