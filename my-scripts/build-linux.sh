#!/usr/bin/env bash

############# prepare
set -e
cd "$(dirname "$(realpath "${BASH_SOURCE[0]}")")"
source common.sh

if [ "$(id -u)" = "0" ]; then
	die "Do not use root."
fi

if [ ! -e "${NODEJS}" ]; then
	die "没有运行prepare-release.sh，请按照文档执行。
	https://doc.b-bug.org/pages/viewpage.action?pageId=4228204"
fi

mkdir -p "${ARCH_RELEASE_ROOT}"
cd "${ARCH_RELEASE_ROOT}"

############# cleanup dist dir (leave node_modules folder)
find . -maxdepth 1 ! -name node_modules ! -name . -exec rm -rf "{}" \;

############# copy source files to dist dir
pushd "${VSCODE_ROOT}" &>/dev/null
git archive --format tar HEAD | tar x -C "${ARCH_RELEASE_ROOT}"
popd &>/dev/null

############# define const to create filenames
BUILD_VERSION=$(node -p "require(\"${VSCODE_ROOT}/package.json\").version")
BUILD_NAME=$(node -p "require(\"${VSCODE_ROOT}/product.json\").applicationName")
BUILD_QUALITY=$(node -p "require(\"${VSCODE_ROOT}/product.json\").quality")
BUILD_COMMIT=$(node -p "require(\"${VSCODE_ROOT}/product.json\").commit")

############# ./build/tfs/linux/build.sh
# !!! NO node.sh HERE !!!
source ./scripts/env.sh
source ./build/tfs/common/common.sh

step "Yarn" \
	yarn

step "Hygiene" \
	npm run gulp -- hygiene

step "Monaco Editor Check" \
	./node_modules/.bin/tsc -p ./src/tsconfig.monaco.json --noEmit

step "Mix in repository from vscode-distro" \
	npm run gulp -- mixin

step "Get Electron" \
	npm run gulp -- "electron-$ARCH"

step "Install distro dependencies" \
	node build/tfs/common/installDistro.js

step "Build minified" \
	npm run gulp -- "vscode-linux-$ARCH-min"

step "Run unit tests" \
	./scripts/test.sh --build --reporter dot

############# create tar.gz
PLATFORM_LINUX="linux-$ARCH"
BUILDNAME="${BUILD_NAME}-${PLATFORM_LINUX}"

TARBALL_FILENAME="${BUILD_NAME}-${BUILD_VERSION}.${ARCH}.tar.gz"
TARBALL_PATH="${RELEASE_ROOT}/${TARBALL_FILENAME}"

step "Create tar.gz archive" \
	tar -czf "${TARBALL_PATH}" "${BUILDNAME}"
