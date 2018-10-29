#!/usr/bin/env bash

set -e
cd "$(dirname "$(realpath "${BASH_SOURCE[0]}")")"
source build-env/fn.sh
source build-env/common.sh "$@"
cd ..

WANT_RESULT="${RELEASE_ROOT}/${PRODUCT_NAME}"

if [ ! -d "${WANT_RESULT}" ]; then
	die "must build first"
fi

cd "${WANT_RESULT}"


