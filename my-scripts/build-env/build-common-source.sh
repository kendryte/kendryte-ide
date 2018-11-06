#!/usr/bin/env bash


############# install or check dependencies
cd "${ARCH_RELEASE_ROOT}"
export PATH="${ARCH_RELEASE_ROOT}/node_modules/.bin:${PATH}"
step "Yarn" \
	yarn install
