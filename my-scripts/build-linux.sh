#!/usr/bin/env bash

############# prepare
set -e
cd "$(dirname "$(realpath "${BASH_SOURCE[0]}")")"
source fn.sh
clear_environment
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

source ./my-scripts/build-env/build-common-source.sh

############# define const to create filenames
BUILD_VERSION=$(node -p "require(\"${VSCODE_ROOT}/package.json\").version")
BUILD_NAME=$(node -p "require(\"${VSCODE_ROOT}/product.json\").applicationName")
BUILD_QUALITY=$(node -p "require(\"${VSCODE_ROOT}/product.json\").quality")
BUILD_COMMIT=$(node -p "require(\"${VSCODE_ROOT}/product.json\").commit")


############# run check
step "Hygiene" \
	npm run gulp -- hygiene

step "Monaco Editor Check" \
	./node_modules/.bin/tsc -p ./src/tsconfig.monaco.json --noEmit

############# download electron executable
step "Get Electron" \
	npm run gulp -- "electron-$ARCH"

############# install production deps
if [ ! -e build/tfs/common/installDistro.js ] || hash_deps_check_changed "build" "build/package.json"; then
	step "Build 'The Build' folder" \
		bash -c "cd build ; yarn"
	hash_deps_save "build" "build/package.json"
fi
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
TARBALL_FILENAME="${BUILD_NAME}-${BUILD_VERSION}.${ARCH}.tar.gz"
TARBALL_PATH="${RELEASE_ROOT}/${TARBALL_FILENAME}"

RESULT="${RELEASE_ROOT}/VSCode-linux-${ARCH}"

step "Compile custom extensions" \
	bash my-scripts/build-env/custom-extensions-build-all.sh "${RESULT}"

mkdir -p "${RESULT}/packages/"
step "Copy Staff (Linux)" \
	bash -c "
	cp -r ./my-scripts/staff/packages_skel/. '${RESULT}/packages/'
	cp -r ./my-scripts/staff/_linux/* '${RESULT}/'
"

step "Create ${RESULT} archive to ${TARBALL_PATH}" \
	tar -czf "${TARBALL_PATH}" "${RESULT}"

echo "Build success, the result file is ${TARBALL_PATH}"
