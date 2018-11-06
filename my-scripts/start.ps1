[Console]::OutputEncoding = [Text.UTF8Encoding]::UTF8

cd $PSScriptRoot
$ErrorActionPreference = "Stop"

. build-env\windows\fn.ps1
. build-env\windows\env.ps1

if (!$env:AlreadyInited) {
	. build-env\windows\init.ps1
	
	setSystemVar 'AlreadyInited' $true
}

function help($command, $desc) {
	Write-Host " * " -NoNewline -BackgroundColor Black
	Write-Host $command -NoNewline -ForegroundColor DarkCyan -BackgroundColor Black
	Write-Host " - " -NoNewline -BackgroundColor Black
	Write-Host $desc -BackgroundColor Black
}

cd $VSCODE_ROOT
echo ""
Get-ChildItem -Path my-scripts\commands -File -Filter '*.js' -Name | Foreach-Object {
	$command = $_.Replace('.js', '')
	help $command ""
	Set-Item -Path function:global:$command -Value {
		try {
			Push-Location
			Set-Location $VSCODE_ROOT
			node "my-scripts\commands\${command}.js" @args
			if (!$?) {
				throw "Command failed with code ${LastExitCode}"
			}
		} finally {
			Pop-Location
		}
		
	}.GetNewClosure()
}

$current = $MyInvocation.MyCommand.Source
Set-Item -Path function:global:fork -Value {
	Start-Process powershell.exe "-NoExit -Command . $current"
}.GetNewClosure()
help "fork" "Open new window like this."

echo ""

function prompt() {
	$host.ui.rawui.WindowTitle = "Kendryte IDE Source Code :: $pwd"
	$Loc = $pwd.Path.Replace($VSCODE_ROOT, '')
	if ($Loc -eq $pwd) {
		return "PS $pwd> "
	} else {
		return "KendryteIDE$Loc> "
	}
}

cd $VSCODE_ROOT # required last item
Write-Host " > The anwser is 42 <" -ForegroundColor Green
