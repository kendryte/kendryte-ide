#!/usr/bin/env bash

echo '#!/bin/bash' > "$RELEASE_ROOT/commands.sh"

cd "$VSCODE_ROOT/my-scripts/commands"
LSDIR=($(ls | grep -vE "\.ts$"))
for i in "${LSDIR[@]}" ; do
	Command="${i%.ts}"

	writeShFile "$Command" "#!/bin/bash
		$(declare -pf die)
		cd \"\$VSCODE_ROOT\"
		node 'my-scripts/commands/${Command}.js' \"\$@\" || die \"Command failed with code \$?\"
	"
done

writeShFile show-help "#!/bin/bash
	exec node 'my-scripts/build-env/help.js'
"

function fork() {
	echo "Only windows can open new window."
}

export -f fork