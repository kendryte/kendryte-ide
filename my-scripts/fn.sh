#!/usr/bin/env bash

export LANG="C"
export LC_ALL="C"

function die() {
	echo -en "\n\e[38;5;9m" >&2
	echo -n  "$@" >&2
	echo -e "\e[0m\n" >&2
	exit 1
}
function dieFile() {
	echo -en "\n\e[38;5;9m" >&2
	echo -n  "$1" >&2
	echo -e "\e[0m\n" >&2
	if [ -e "$2" ]; then
		echo "$(< "$2")" >&2
	else
		die "FATAL ERROR: No error log file: $2."
	fi
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
STAT_PID=
function step(){
	if [ "$1" == "-s" ]; then
		cd "${VSCODE_ROOT}"
		shift
	elif [ "$1" == "-r" ]; then
		cd "${RELEASE_ROOT}"
		shift
	else
		cd "${ARCH_RELEASE_ROOT}"
	fi
	local oldEset=${-//[^e]/}
	set +e

	SN=$((SN + 1))
	local title="$1"
	shift

	echo -e "\e[38;5;14mStep ${SN}: $title:\e[0m"
	echo " -- $*"

	"$@" &
	STAT_PID=$!

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

	kill "${STAT_SHOW}" "${STAT_PID}" &>/dev/null || true

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
	echo "Stopping Running task: ${STAT_SHOW} ${STAT_PID} ..."
	kill "${STAT_SHOW}" "${STAT_PID}" &>/dev/null || true
	sleep 1
	echo "=========================="
	for I in "${SN_LIST[@]}" ; do
		echo -e "  $I"
	done
	echo "=========================="
}

function hash_files_check_changed() { # change return 0 ( test success )
	local VERSION="$1"
	local HASH="${RELEASE_ROOT}/current_hash.md5"
	if [ -e "${HASH}" ]; then
		pushd "${VSCODE_ROOT}" &>/dev/null
		if git archive "${VERSION}" | md5sum --status -c "${HASH}" ; then
			RET=1
			echo "source code not changed: $(< "${HASH}")"
		else
			RET=0
			echo "source code has changed: $(< "${HASH}")"
		fi
		popd &>/dev/null
	else
		echo "source code not hashed ever."
		RET=0
	fi
	return ${RET}
}

function hash_files_save() {
	local VERSION="$1"
	local HASH="${RELEASE_ROOT}/current_hash.md5"
	pushd "${VSCODE_ROOT}" &>/dev/null
	git archive "${VERSION}" | md5sum > "${HASH}"
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

function clear_environment(){
	if [ -n "$REAL_HOME" ]; then
		export HOME="$REAL_HOME"
	fi
	unset VSCODE_ROOT
	unset RELEASE_ROOT
	unset REAL_HOME
	unset TOOLCHAIN_BIN
	unset FOUND_CYGWIN
	unset NODEJS
}

function set_path_when_developing() {
	local SCRIPTS_PATH="$(dirname "$(realpath "${BASH_SOURCE[0]}")")"
	if [ -n "${REAL_HOME}" ] && [ -z "${TMUX}" ] && [ -z "${BUILDING}" ] ; then
		echo "Error: REAL_HOME is set by something."
		echo "${BASH_SOURCE[*]}"
		exit 1
	fi
	clear_environment
	export REAL_HOME="${HOME}"
	export HOME=$(realpath "${SCRIPTS_PATH}/../../FAKE_HOME")
	export RELATIVE_HOME_TO_SOURCE="../FAKE_HOME"
}

function native_path() {
	if [ "${SYSTEM}" = "windows" ]; then
		cygpath -m "$@"
	else
		echo "$@"
	fi
}

function reset_asar() {
	if [ -e "node_modules" ] ; then
		if [ -L "node_modules" ] ; then
			echo "unlink node_modules"
			unlink "node_modules"
		fi
	fi

	if [ -e "node_modules.asar.unpacked" ]; then
		echo "remove node_modules.asar.unpacked"
		rm -rf node_modules.asar.unpacked
	fi
	if [ -e "node_modules.asar" ]; then
		echo "remove node_modules.asar"
		rm -f node_modules.asar
	fi
}

function detect_install_nodejs() {
	pushd "${VSCODE_ROOT}"

	if [ -e "${NODEJS}" ]; then
		bash "./my-scripts/prepare-release.sh" || die "不能安装node和其他依赖，查看上方日志"
	else
		bash "./my-scripts/prepare-release.sh" || die "不能安装node和其他依赖，查看上方日志"
		cd my-scripts
		source common.sh
	fi

	echo -n "detect nodejs: ${NODEJS} -> "
	node -v || die -e "node安装完成，但似乎无法运行\nPATH=\n$(echo $PATH | sed 's/:/\n/g')"

	popd &>/dev/null
}

function ensure_node_modules_in_current_dir() {
	if ! [ -e node_modules ]; then
		if [ "$SYSTEM" = "windows" ]; then
			die "Emmmm, run 'my-scripts/pack-windows.sh' first?"
		else
			die "Emmmm, run yarn install first?"
		fi
	fi
}
function path_foreach() {
	local IFS=":"
	local P="$1"
	shift

	for i in ${P} ; do
		"$@" "$i"
	done
}

function detect_system() {
	unameOut="$(uname -s)"
	case "${unameOut}" in
	    Linux*)     export SYSTEM='linux';;
	    Darwin*)    export SYSTEM='mac';;
	    CYGWIN*)    export SYSTEM='windows';;
	    *)
	        die "not supported platform: ${unameOut}"
	esac
	if [ "${SYSTEM}" = "windows" ]; then
		export FOUND_CYGWIN=$(find /bin -name 'cygpath.exe')
	fi
}