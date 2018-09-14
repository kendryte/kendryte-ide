#!/usr/bin/env bash

############# prepare
set -e
cd "$(dirname "$(realpath "${BASH_SOURCE[0]}")")"
source fn.sh
clear_environment
source common.sh "$@"

export BUILDING=TRUE

if [ ! -e "${NODEJS}" ]; then
	bash ./prepare-release.sh

	source common.sh "$@"
	if [ ! -e "${NODEJS}" ]; then
		die "没有运行prepare-release.sh，请按照文档执行。
		https://doc.b-bug.org/pages/viewpage.action?pageId=4228204"
	fi
else
	bash ./prepare-release.sh
fi

cd ..
source ./scripts/env.sh

source ./my-scripts/build-env/build-common-source.sh

export HOME="$(cygpath -m "$HOME")"

############# define const to create filenames
pushd "${VSCODE_ROOT}" &>/dev/null
BUILD_VERSION=$(node -p "require(\"./package.json\").version")
BUILD_NAME=$(node -p "require(\"./product.json\").applicationName")
BUILD_QUALITY=$(node -p "require(\"./product.json\").quality")
BUILD_COMMIT=$(node -p "require(\"./product.json\").commit")
popd &>/dev/null

############# download electron executable
step "Get Electron" \
	npm run gulp -- "electron-$ARCH"

############# install production deps
if [ ! -e build/tfs/common/installDistro.js ] || hash_deps_check_changed "build" "build/package.json"; then
	step "Build 'The Build' folder" \
		bash -c "cd build ; yarn --cache-folder '${YARN_CACHE_FOLDER}'"
	hash_deps_save "build" "build/package.json"
fi
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

step "Create archive folder" \
	npm run gulp -- "vscode-win32-${ARCH}-archive"

RESULT="${RELEASE_ROOT}/VSCode-win32-${ARCH}"
WANT_RESULT="${RELEASE_ROOT}/KendryteIDE"

mkdir -p "${RESULT}/packages/"
step "Copy Staff (Windows)" \
	bash -c "
	cp -r ./my-scripts/staff/packages_skel/. '${RESULT}/packages/'
"

step "Move ${RESULT} to ${WANT_RESULT}" \
	bash -c "rm -rf ${WANT_RESULT} ; mv ${RESULT} ${WANT_RESULT}"


# TARBALL_FILENAME="${BUILD_NAME}-${BUILD_VERSION}.${ARCH}.7z"
# TARBALL_PATH="${RELEASE_ROOT}/${TARBALL_FILENAME}"
# echo "Build success, the result file is ${TARBALL_PATH}"
