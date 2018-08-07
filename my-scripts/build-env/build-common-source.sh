#!/usr/bin/env bash

mkdir -p "${ARCH_RELEASE_ROOT}"
cd "${ARCH_RELEASE_ROOT}"
echo -e "\e[38;5;14mCWD: ${ARCH_RELEASE_ROOT}\e[0m"

if hash_files_check_changed ; then
	############# cleanup dist dir (leave node_modules folder)
	step "Cleanup dist folder" \
		find . -maxdepth 1 ! -name node_modules ! -name . -exec rm -rf "{}" \;
	
	step "Cleanup gypt folder" \
		rm -rf "${HOME}/.node-gyp"

	############# copy source files to dist dir
	pushd "${VSCODE_ROOT}" &>/dev/null
	step "Extract source code" \
		bash -c "git archive --format tar HEAD | tar x -C \"${ARCH_RELEASE_ROOT}\""
	popd &>/dev/null
	
	hash_files_save
fi

LOCK="${VSCODE_ROOT}/yarn.lock"
if hash_deps_check_changed yarn "${LOCK}" ; then
	############# install or check dependencies
	step "Yarn" \
		yarn
	
	hash_deps_save yarn "${LOCK}"
fi
