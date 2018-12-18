[Console]::OutputEncoding = [Text.UTF8Encoding]::UTF8
chcp 65001 | Out-Null
$ErrorActionPreference = "Stop"

cd $PSScriptRoot
. build-env\windows\fn.ps1
cd $PSScriptRoot
. build-env\windows\env.ps1
cd $PSScriptRoot
. build-env\windows\listcommands.ps1

if (!$env:AlreadyInited) {
	cd $PSScriptRoot
	. build-env\windows\init.ps1
	
	setSystemVar 'AlreadyInited' $true
}

cd $VSCODE_ROOT

Set-Item -Path function:global:prompt -Value {
	$host.ui.rawui.WindowTitle = "Kendryte IDE Source Code :: $pwd"
	$Loc = $pwd.Path.Replace($VSCODE_ROOT, '')
	if ($Loc -eq $pwd) {
		return "P.S $pwd> "
	} else {
		return "KendryteIDE$Loc> "
	}
}.GetNewClosure()

#TODO: argument - run command
node "$VSCODE_ROOT\my-scripts\build-env\help.js" --what-is-this
Set-Item -Path function:global:show-help -Value {
	node "$VSCODE_ROOT\my-scripts\build-env\help.js" --what-is-this
}.GetNewClosure()

Write-Host " > The anwser is 42 <" -ForegroundColor Green

[console]::WindowWidth = 100
[console]::WindowHeight = 24
[console]::BufferWidth = [console]::WindowWidth

cd $VSCODE_ROOT # required last item
