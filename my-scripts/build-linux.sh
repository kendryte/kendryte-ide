#!/usr/bin/env bash

############# prepare
set -e
cd "$(dirname "$(realpath "${BASH_SOURCE[0]}")")"
source fn.sh
source common.sh "$@"

echo 8000000 > /proc/sys/fs/file-max
ulimit -n 1000000

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
BUILD_VERSION=$(node -p "require(\"${VSCODE_ROOT}/package.json\").version")
BUILD_NAME=$(node -p "require(\"${VSCODE_ROOT}/product.json\").applicationName")
BUILD_QUALITY=$(node -p "require(\"${VSCODE_ROOT}/product.json\").quality")
BUILD_COMMIT=$(node -p "require(\"${VSCODE_ROOT}/product.json\").commit")

############# install or check dependencies
step "Yarn" \
	yarn

############# run check
step "Hygiene" \
	npm run gulp -- hygiene

step "Monaco Editor Check" \
	./node_modules/.bin/tsc -p ./src/tsconfig.monaco.json --noEmit

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
	npm run gulp -- "vscode-linux-$ARCH-min"

############# run unit test
step "Run unit tests" \
	./scripts/test.sh --build --reporter dot

############# create tar.gz
PLATFORM_LINUX="linux-$ARCH"
BUILDNAME="${BUILD_NAME}-${PLATFORM_LINUX}"

TARBALL_FILENAME="${BUILD_NAME}-${BUILD_VERSION}.${ARCH}.tar.gz"
TARBALL_PATH="${RELEASE_ROOT}/${TARBALL_FILENAME}"

RESULT="${BUILDNAME}"

step "Compile custom extensions" \
	bash my-scripts/build-env/custom-extensions-build-all.sh "${RESULT}"

step "Create ${RESULT} archive to ${TARBALL_PATH}" \
	tar -czf "${TARBALL_PATH}" "${RESULT}"

echo "Build success, the result file is ${TARBALL_PATH}"
