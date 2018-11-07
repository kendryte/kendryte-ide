#!/usr/bin/env bash

echo '#!/bin/bash' > "$RELEASE_ROOT/commands.sh"

cd "$VSCODE_ROOT/my-scripts/commands"
LSDIR=$(ls | grep -vE "\.ts$")
for i in "${LSDIR[@]}" ; do
	Command=${i%.ts}.js

	echo "#!/bin/bash
cd \"\$VSCODE_ROOT\"
node 'my-scripts/commands/${Command}.js' \"\$@\" || die \"Command failed with code \$?\"

" > "${PRIVATE_BINS}/${Command}"
done

function fork() {
	echo "Only windows can open new window."
}

export -f fork