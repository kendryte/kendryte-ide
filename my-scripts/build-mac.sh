#!/usr/bin/env bash

############# prepare
set -e
cd "$(dirname "$(realpath "${BASH_SOURCE[0]}")")"
source build-env/fn.sh
clear_environment
source build-env/common.sh "$@"

export BUILDING=TRUE

detect_install_nodejs

source ../scripts/env.sh

source build-env/build-common-source.sh

############# define const to create filenames
BUILD_VERSION=$(node -p "require(\"${VSCODE_ROOT}/package.json\").version")
BUILD_NAME=$(node -p "require(\"${VSCODE_ROOT}/product.json\").applicationName")
BUILD_NAME_LONG=$(node -p "require(\"${VSCODE_ROOT}/product.json\").nameLong")
BUILD_QUALITY=$(node -p "require(\"${VSCODE_ROOT}/product.json\").quality")
BUILD_COMMIT=$(node -p "require(\"${VSCODE_ROOT}/product.json\").commit")

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
	npm run gulp -- "vscode-darwin-min"

############# create tar.gz
TARBALL_FILENAME="darwin-${BUILD_NAME}-${BUILD_VERSION}.tar.xz"
TARBALL_PATH="${RELEASE_ROOT}/${TARBALL_FILENAME}"

RESULT="${RELEASE_ROOT}/VSCode-darwin/${BUILD_NAME_LONG}.app"
WANT_RESULT="${RELEASE_ROOT}/${PRODUCT_NAME}.app"

step "Copy Staff (Darwin)" \
	bash -c "
	cp -r ./my-scripts/staff/skel/. '${RESULT}/'
"

step "Move ${RESULT} to ${WANT_RESULT}" \
	bash -c "rm -rf '${WANT_RESULT}' && mv '${RESULT}' '${WANT_RESULT}'"

step -r "Create ${PRODUCT_NAME}.app archive to ${TARBALL_FILENAME}" \
	tar -cJf "${TARBALL_PATH}" "${PRODUCT_NAME}.app"

echo "Build success, the result file is ${TARBALL_PATH}"
