#!/usr/bin/env bash

cd "${VSCODE_ROOT}"
GIT=$(command -v git || die "Git is not found in path.")
echo "Check git status in ${VSCODE_ROOT} (git: $GIT)"
git add .
if git status | grep -q 'Changes to be committed' ; then
	C_VERSION=$(git stash create)
else
	C_VERSION="HEAD"
fi
echo -e "\e[38;5;14mGit Current Version: ${C_VERSION}\e[0m"

if [ ! -d "${ARCH_RELEASE_ROOT}" ] || hash_files_check_changed ${C_VERSION} ; then
	############# cleanup dist dir (leave node_modules folder)
	step "Cleanup dist folder" \
		find . -maxdepth 1 ! -name node_modules ! -name . -exec rm -rf "{}" \;

	mkdir -p "${ARCH_RELEASE_ROOT}"
	cd "${ARCH_RELEASE_ROOT}"
	echo -e "\e[38;5;14mCWD: ${ARCH_RELEASE_ROOT}\e[0m"

	step "Cleanup gypt folder" \
		rm -rf "${HOME}/.node-gyp"

	############# copy source files to dist dir
	pushd "${VSCODE_ROOT}" &>/dev/null
	step -s "Extract source code" \
		bash -c "git archive --format tar ${C_VERSION} | tar x -C \"${ARCH_RELEASE_ROOT}\""
	popd &>/dev/null

	hash_files_save ${C_VERSION}
fi

if [ ! -e "${RELEASE_ROOT}/.git" ]; then
	git init "${RELEASE_ROOT}"
	echo "*" > "${RELEASE_ROOT}/.gitignore"
fi

############# install or check dependencies
step "Yarn" \
	yarn --prefer-offline --cache-folder "${YARN_CACHE_FOLDER}"
