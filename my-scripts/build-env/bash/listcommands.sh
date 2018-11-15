#!/usr/bin/env bash

cd "$VSCODE_ROOT/my-scripts/commands"
LSDIR=($(ls | grep -E "\.ts$"))
for i in "${LSDIR[@]}" ; do
	Command="${i%.ts}"

	writeShFile "$Command" "
		function die() {
			echo -en \"\e[38;5;9m\" >&2
			echo -en \"\$*\" >&2
			echo -e \"\e[0m\" >&2
			exit 1
		}
		cd '$VSCODE_ROOT'
		node 'my-scripts/build-env/load-command.js' '${Command}' \"\$@\" || die \"Command failed with code \$?\"
	"
done

writeShFile show-help "
	cd '$VSCODE_ROOT'
	exec node 'my-scripts/build-env/help.js'
"

function fork() {
	echo "Only windows can open new window."
}

export -f fork