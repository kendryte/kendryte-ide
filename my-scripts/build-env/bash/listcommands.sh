#!/usr/bin/env bash

cd "$VSCODE_ROOT/my-scripts/commands"
LSDIR=($(ls | grep -E "\.ts$"))
for i in "${LSDIR[@]}" ; do
	Command="${i%.ts}"

	writeShFile "$Command" "
		$(declare -pf die)
		cd \"\$VSCODE_ROOT\"
		node 'my-scripts/build-env/load-command.js' '${Command}' \"\$@\" || die \"Command failed with code \$?\"
	"
done

writeShFile show-help "
	exec node 'my-scripts/build-env/help.js'
"

function fork() {
	echo "Only windows can open new window."
}

export -f fork