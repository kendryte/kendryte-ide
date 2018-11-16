#!/usr/bin/env bash

set -e

cd "$(dirname "$(realpath "${BASH_SOURCE[0]}")")"
source build-env/fn.sh
source build-env/common.sh
cd ..

function echoStat() {
	echo -e "\e[38;5;10m" "$@" "\e[0m"
}

echoStat "checking exists upstream working tree..."
git worktree prune

git worktree remove .release/follow-upstream &>".release/fu-temp-out.txt" || {
	echo "worktree removal failed with $?"
	OUT=$(< ".release/fu-temp-out.txt")
	if echo "$OUT" | grep -q "is not a working tree" ; then
		rm -rf .release/follow-upstream
	elif echo "$OUT" | grep -q "is dirty" ; then
		rm -rf .release/follow-upstream
	elif echo "$OUT" | grep -q "No such file or directory" ; then
		echo -n ""
	else
		echo "$OUT" >&2
		exit 1
	fi
}

if ! git branch -r | grep -q microsoft ; then
	echoStat "fetching origin upstream branch..."
	git fetch origin microsoft:refs/remotes/origin/microsoft
fi

echoStat "checking out upstream working tree..."
git worktree add -f .release/follow-upstream microsoft

cd .release/follow-upstream
git checkout microsoft
git reset --hard
git clean -q -f -d -x
git pull
LAST_COMMIT=$(git log -1 --format='%s' | sed -E 's/.+#\s*//g')
echoStat "last upstream commit id is: ${LAST_COMMIT}."

echoStat "cleaning up working tree..."
find . -maxdepth 1 ! -name .git ! -name . -exec rm -rf "{}" \;

if [ -z "${MICROSOFT_VSCODE_ROOT}" ]; then
	MICROSOFT_VSCODE_ROOT="$(cd "${VSCODE_ROOT}" && cd .. && pwd)/MicrosoftVSCode"
fi

if ! [ -d "${MICROSOFT_VSCODE_ROOT}" ]; then
	echoStat "cloning Microsoft/vscode to ${MICROSOFT_VSCODE_ROOT}"
	git clone -b master --single-branch https://github.com/Microsoft/vscode.git "${MICROSOFT_VSCODE_ROOT}"
	cd "${MICROSOFT_VSCODE_ROOT}"

	echoStat "resetting everything at Microsoft/vscode..."
	git checkout master
	git reset --hard
	git clean -q -f -d -x
else
	cd "${MICROSOFT_VSCODE_ROOT}"

	echoStat "resetting everything at ${MICROSOFT_VSCODE_ROOT}..."
	git checkout master
	git reset --hard
	git clean -q -f -d -x

	echoStat "detect any changes..."
	git pull
fi

echoStat "overriding content into upstream working tree..."
git archive --format tar HEAD | tar x -C "${RELEASE_ROOT}/follow-upstream"

COMMIT="$(git rev-parse HEAD)"
LOGS="$(git log --format='%h %s' "${LAST_COMMIT}...HEAD")"
CNT="$(echo -n "$LOGS" | wc -l)"
echoStat "current commit id is: ${COMMIT} ($CNT new commits)"

if [ ${CNT} -eq 0 ]; then
	echo "No new update at Microsoft/vscode." >&2
	exit 1
fi

cd "${RELEASE_ROOT}/follow-upstream"

COMMIT_LOG="sync with upstream # ${COMMIT}

${LOGS}"

echoStat "committing working tree: sync with upstream # ${COMMIT}"

git add .
git commit . -m "${COMMIT_LOG}" --no-verify

echoStat "pushing working tree..."
git push
