cd $PSScriptRoot

. build-env\windows\fn.ps1

if (!$AlreadyInited) {
	. build-env\windows\env.ps1
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
				throw "Command failed with code ${$LastExitCode}"
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

cd $VSCODE_ROOT # required last item
Write-Host " > The anwser is 42 <" -ForegroundColor Green
