
CMD_GIT=$(which git) || die "required command git not installed on system."
function git() {
	HOME="$REAL_HOME" "${CMD_GIT}" "$@"
}

if [ "$SYSTEM" = "mac" ]; then
	PY="python"
else
	PY="python2"
fi
CMD_PY=$(which "$PY") || die "required command $PY not installed on system"
unset PY
function python() {
	"${CMD_PY}" "$@"
}

