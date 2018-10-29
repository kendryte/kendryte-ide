#!/usr/bin/env bash

export NATIVE_TEMP=$(native_path "$TEMP")
export NATIVE_ROOT=$(native_path "$RELEASE_ROOT")
export USERPROFILE=${USERPROFILE-${HOME}}

WinPath=''
function pushP(){
	if echo "$1" | grep -qE '^/cygdrive/' ; then
		WinPath+="$1:"
	fi
}
path_foreach "${SYSTEM_ORIGINAL_PATH}" pushP

### GIT
CMD_GIT=$(PATH="${WinPath}" /usr/bin/which git.exe) || die "required command git.exe not installed on windows."
echo "@echo off
chcp 65001 > nul
set HOME=${USERPROFILE}
set TEMP=${NATIVE_TEMP}
set TMP=${NATIVE_TEMP}
call \"$(native_path "${CMD_GIT}")\" %*
"> "${RELEASE_ROOT}/wrapping-bins/git.bat"
echo "exec cmd /c \"${NATIVE_ROOT}/wrapping-bins/git.bat\" \"\$@\"" > "${RELEASE_ROOT}/wrapping-bins/git"

### PYTHON
CMD_PY=$(PATH="${WinPath}" /usr/bin/which python.exe) || die "required command python.exe not installed on windows, run my-scripts/prepare-release.sh."
echo "@echo off
chcp 65001
set TEMP=${NATIVE_TEMP}
set TMP=${NATIVE_TEMP}
call \"${CMD_GIT}\" %*
"> "${RELEASE_ROOT}/wrapping-bins/python.bat"


### NODEJS
NODE_NATIVE=$(native_path "${NODEJS_BIN}")

### YARN
YARN_ARGS="--prefer-offline "
YARN_ARGS+="--cache-folder \"${YARN_CACHE_FOLDER}\" "
YARN_ARGS+="--global-folder \"$(yarnGlobalDir yarn/global)\" "
YARN_ARGS+="--link-folder \"$(yarnGlobalDir yarn/link)\" "
YARN_ARGS+="--temp-folder \"$(yarnGlobalDir yarn/tmp)\" "

echo "@echo off
chcp 65001 > nul
set HOME=$(native_path "${HOME}")
set TEMP=${NATIVE_TEMP}
set TMP=${NATIVE_TEMP}
FOR %%a IN (%*) DO (
  IF \"%%a\"==\"global\" (
    set NB=--no-bin-links
  )
)
echo Call \"${NODE_NATIVE}/yarn.cmd\" %* %NB% ${YARN_ARGS} 1>&2
call \"${NODE_NATIVE}/yarn.cmd\" %* %NB% ${YARN_ARGS}
"> "${RELEASE_ROOT}/wrapping-bins/yarn.bat"
echo "exec cmd /c \"yarn.bat\" \"\$@\""> "${RELEASE_ROOT}/wrapping-bins/yarn"
unset YARN_ARGS

### NPM
echo "exec cmd /c \"${NODE_NATIVE}/npm.cmd\" \"\$@\""> "${RELEASE_ROOT}/wrapping-bins/npm"

## finalize
chmod a+x "${RELEASE_ROOT}/wrapping-bins"/*
