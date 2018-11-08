Get-ChildItem -Path "$VSCODE_ROOT\my-scripts\commands" -File -Filter '*.ts' -Name | Foreach-Object {
	$command = $_.Replace('.ts', '')
	Set-Item -Path function:global:$command -Value {
		try {
			Push-Location
			Set-Location $VSCODE_ROOT
			node "my-scripts\build-env\load-command.js" "${command}" @args
			if (!$?) {
				throw "Command failed with code ${LastExitCode}"
			}
		} finally {
			Pop-Location
		}
	}.GetNewClosure()
}

function Fork {
	param (
		[parameter(Mandatory = $false)] [String[]] $Action,
		[parameter(Mandatory = $false, ValueFromRemainingArguments = $true)] [String[]] $list
	)
	if ($Action) {
		$argList = @("node", "$VSCODE_ROOT\my-scripts\build-env\load-command.js", $Action )
		if ($list) {
			$argList += $list
		}
		Start-Process -ArgumentList $argList -FilePath powershell.exe
	} else {
		Start-Process powershell.exe "-NoExit -Command . `"$VSCODE_ROOT\my-scripts\start.ps1`""
	}
}
Set-Item -Path function:global:fork -Value ${function:Fork}
