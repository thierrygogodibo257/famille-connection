$source = "C:\modern-family-tree"
$destination = "C:\famille-connection"

Get-ChildItem -Path $source -Recurse -Force |
  Where-Object {
    $_.FullName -notmatch '\\\.git($|\\)' -and $_.Name -ne '.gitignore'
  } | ForEach-Object {
    $destPath = $_.FullName.Replace($source, $destination)
    if ($_.PSIsContainer) {
      if (-not (Test-Path $destPath)) {
        New-Item -Path $destPath -ItemType Directory -Force | Out-Null
      }
    } else {
      Copy-Item -Path $_.FullName -Destination $destPath -Force
    }
  }

Write-Host "`n✅ Copie terminée sans inclure .git et .gitignore.`n"
