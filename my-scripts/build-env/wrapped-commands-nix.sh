#!/usr/bin/env bash

### GIT
CMD_GIT=$(which git) || die "required command git not installed on system."
echo "#!/bin/sh
export HOME='${REAL_HOME}'
exec '$CMD_GIT' \"\$@\"
" > "${RELEASE_ROOT}/wrapping-bins/git"

### PYTHON
if ! [ "$SYSTEM" = "mac" ]; then # linux
	CMD_PY=$(which python2) || die "required command python2 not installed on system"
	echo "#!/bin/sh
exec '$CMD_PY' \"\$@\"
" > "${RELEASE_ROOT}/wrapping-bins/python"
fi

### YARN
echo "#!/bin/sh
if echo \"\$*\" | grep -q global ; then
	NB='--no-bin-links'
fi

exec '${NODE_BIN}/yarn' \
	\"\$@\"
	--prefer-offline \
	\${NB} \
	--cache-folder '${YARN_CACHE_FOLDER}' \
	--global-folder '$(yarnGlobalDir yarn/global)' \
	--link-folder '$(yarnGlobalDir yarn/link)' \
	--temp-folder '$(yarnGlobalDir yarn/tmp)' \
"> "${RELEASE_ROOT}/wrapping-bins/yarn"
echo "#!/bin/sh

## finalize
chmod 0777 "${RELEASE_ROOT}/wrapping-bins"/*
