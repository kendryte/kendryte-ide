#!/usr/bin/env bash

############# prepare
set -e
cd "$(dirname "$(realpath "${BASH_SOURCE[0]}")")"
source fn.sh
source common.sh "$@"

if [ ! -e "${NODEJS}" ]; then
	bash ./prepare-release.sh

	source common.sh "$@"
	if [ ! -e "${NODEJS}" ]; then
		die "没有运行prepare-release.sh，请按照文档执行。
		https://doc.b-bug.org/pages/viewpage.action?pageId=4228204"
	fi
fi

cd ..
source ./scripts/env.sh

mkdir -p "${ARCH_RELEASE_ROOT}"
cd "${ARCH_RELEASE_ROOT}"
echo -e "\e[38;5;14mCWD: ${ARCH_RELEASE_ROOT}\e[0m"

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

############# define const to create filenames
pushd "${VSCODE_ROOT}" &>/dev/null
BUILD_VERSION=$(node -p "require(\"./package.json\").version")
BUILD_NAME=$(node -p "require(\"./product.json\").applicationName")
BUILD_QUALITY=$(node -p "require(\"./product.json\").quality")
BUILD_COMMIT=$(node -p "require(\"./product.json\").commit")
popd &>/dev/null

############# install or check dependencies
step "Yarn" \
	yarn

############# download electron executable
step "Get Electron" \
	npm run gulp -- "electron-$ARCH"

############# install production deps
step "Install distro dependencies" \
	node build/tfs/common/installDistro.js

############# build internal extensions
step "Build extensions" \
	node build/lib/builtInExtensions.js

############# minify source code
step "Build minified" \
	npm run gulp -- "vscode-win32-$ARCH-min"

############# copy updater
step "copy inno updater" \
	npm run gulp -- "vscode-win32-$ARCH-copy-inno-updater"

############# create zip
PLATFORM_WIN32="win32-$ARCH"
BUILDNAME="${BUILD_NAME}-${PLATFORM_WIN32}"

TARBALL_FILENAME="${BUILD_NAME}-${BUILD_VERSION}.${ARCH}.tar.gz"
TARBALL_PATH="${RELEASE_ROOT}/${TARBALL_FILENAME}"

Zip="${Repo}\.release\win32-${ARCH}\archive\VSCode-win32-${ARCH}.zip"

step "Create archive" \
	npm run gulp -- "vscode-win32-${ARCH}-archive"

