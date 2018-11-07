#!/usr/bin/env bash

function die() {
	echo -en "\e[38;5;9m"
	echo -en "$*"
	echo -e "\e[0m"
	exit 1
}
function die_return() {
	echo -en "\e[38;5;9m"
	echo -en "$*"
	echo -e "\e[0m"
	return 1
}

export -f die
export -f die_return

function resolvePath() {
	realpath -m "$1" "$2"
}
function MakeNewDir() {
	local d="$1"
	if [ -e "$d" ]; then
		echo "Create Missing Directory: $d"
		mkdir -p "$d"
	fi
}
function RimDir() {
	local d="$1"
	if [ -e "$d" ]; then
		echo "Remove Unexpect Directory: $d"
		rm -rf "$d"
	fi
}

function downloadFile() {
	local Uri="$1"
	local resultDownload="$2"

	if [ ! -e "$resultDownload" ]; then
		echo "Downloading file From: $Uri, To: $resultDownload"
		local tempDownload="${resultDownload}.partial"
		wget -c -O "$tempDownload" "$Uri"
		mv -f "$tempDownload" "$resultDownload"
	else
		echo "Downloaded file: $resultDownload"
	fi
}

function writeShFile() {
	local Name="$1"
	local Script="$2"

	echo "$Script" > "$PRIVATE_BINS/$Name"
}
