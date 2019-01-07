$ErrorActionPreference = "Stop"
$env:CHILD_CONCURRENCY="1"

function Exec
{
  [CmdletBinding()]
  param(
    [Parameter(Position=0,Mandatory=1)][scriptblock]$cmd,
    [Parameter(Position=1,Mandatory=0)][string]$errorMessage = ($msgs.error_bad_command -f $cmd)
  )
  & $cmd
  if ($lastexitcode -ne 0) {
    throw ("Exec: " + $errorMessage)
  }
}

function downloadFile() {
  param (
    [parameter(Mandatory = $true)] [String] $Uri,
    [parameter(Mandatory = $true)] [String] $resultDownload
  )

  if (!(Test-Path -Path $resultDownload)) {
    Write-Host "Downloading file From: $Uri, To: $resultDownload"
    $tempDownload = "${resultDownload}.partial"
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    if ($proxy) {
      Invoke-WebRequest -Uri $Uri -OutFile $tempDownload -Proxy $proxy
    } else {
      Invoke-WebRequest -Uri $Uri -OutFile $tempDownload
    }
    Rename-Item -Path $tempDownload -NewName $resultDownload -Force
  } else {
    Write-Host "Downloaded file: $resultDownload"
  }
}

if ($env:AGENT_OS -eq "Linux") {
  echo "LinuxPath is $env:PATH"
  sudo apt-get install p7zip-full
} ElseIf ($env:AGENT_OS -eq "Darwin") {
  echo "MacPath is $env:PATH"
  exec { downloadFile 'https://registry.npmjs.org/7zip-bin/-/7zip-bin-4.1.0.tgz' '/tmp/7zb.tar.gz' } "Cannot download 7zip-bin from npm"
  exec { tar xf '/tmp/7zb.tar.gz' -C /tmp } "Cannot extract 7zip-bin tar.gz"
  exec { sudo mkdir -p "$HOME/bin" } "Cannot create HOME/bin folder"
  exec { sudo cp '/tmp/package/mac/7za' "$HOME/bin/7za" } "Cannot copy 7za to HOME/bin"
  exec { sudo chmod a+x "$HOME/bin/7za" } "Cannot chmod (a+x) HOME/bin/7za"
  exec { 7za -h | Out-Null } "7za not executable, HOME/bin not in Path?"
} Else { # windows
  echo "WindowsPath is $env:PATH"
  exec { downloadFile 'https://registry.npmjs.org/7zip/-/7zip-0.0.6.tgz' "$env:TMP\7z.tar.gz" } "Cannot download 7zip from npm"
  exec {
    echo "import tarfile
tar = tarfile.open(`"$env:TMP/7z.tar.gz`", `"r:gz`")
tar.extractall(`"$env:TMP`")
tar.close()
" | python
  } "Cannot extract 7z.tar.gz with python"
  exec {
    Copy-item -Recurse -Verbose "$env:TMP\package\7zip-lite\*" -Destination "C:\Windows\system32"
  } "Cannot copy 7z to C:/Windows/System32"
}
