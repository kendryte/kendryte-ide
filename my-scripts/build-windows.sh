#!/usr/bin/env bash

############# prepare
set -e
cd "$(dirname "$(realpath "${BASH_SOURCE[0]}")")"
source build-env/fn.sh
clear_environment
source build-env/common.sh "$@"

export BUILDING=TRUE

detect_install_nodejs

source build-env/build-common-source.sh

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

RESULT="${RELEASE_ROOT}/VSCode-win32-${ARCH}"
WANT_RESULT="${RELEASE_ROOT}/${PRODUCT_NAME}"

############# copy skel
step "Copy Staff (Windows)" \
	bash -c "
	cp -r ./my-scripts/staff/skel/. '${RESULT}/'
"

step -r "Move ${RESULT} to ${WANT_RESULT}" \
	bash -c "rm -rf '${WANT_RESULT}' && mv '${RESULT}' '${WANT_RESULT}'"

TARBALL_FILENAME="windows-${BUILD_NAME}-${BUILD_VERSION}.zip"
step "Create ${PRODUCT_NAME} archive to ${TARBALL_FILENAME}" \
	yarn run 7z a -tzip -y -r "../${TARBALL_FILENAME}" "../${PRODUCT_NAME}" 2>&1 | iconv -t utf8

echo "Build success, the result file is ${RELEASE_ROOT}/${TARBALL_FILENAME}"
