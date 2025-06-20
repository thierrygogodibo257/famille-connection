# Fermer Cursor s'il est ouvert
Write-Host "Fermeture de Cursor..."
Get-Process "Cursor" -ErrorAction SilentlyContinue | Stop-Process -Force

# Supprimer les anciens fichiers Cursor
Write-Host "Suppression des fichiers Cursor..."
$paths = @(
    "$env:APPDATA\Cursor",
    "$env:LOCALAPPDATA\Programs\cursor",
    "$env:APPDATA\Cursor_Backup"
)

foreach ($path in $paths) {
    if (Test-Path $path) {
        try {
            Remove-Item -Recurse -Force -Path $path
            Write-Host "Supprime : $path"
        } catch {
            Write-Host "Erreur de suppression : $path"
        }
    }
}

# Telechargement de la version stable
$version = "0.45.10"
$downloadUrl = "https://github.com/getcursor/cursor/releases/download/v$version/Cursor%20Setup%20$v$version.exe"
$installerPath = "$env:TEMP\cursor_installer.exe"

Write-Host "Telechargement de Cursor v$version..."
try {
    Invoke-WebRequest -Uri $downloadUrl -OutFile $installerPath
} catch {
    Write-Host "Erreur de telechargement. Verifiez votre connexion Internet."
    exit
}

# Lancer l'installation
Write-Host "Installation de Cursor..."
try {
    Start-Process -FilePath $installerPath -Wait
} catch {
    Write-Host "Erreur pendant l'installation."
}

Write-Host ""
Write-Host "Cursor stable installe. Relancez le depuis le menu Demarrer."
