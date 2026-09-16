# package-for-share.ps1
# Creates a clean, lightweight zip archive ready to send to your friends (excludes node_modules and builds)

$destinationZip = Join-Path (Split-Path $PSScriptRoot -Parent) "raahi-cafe-shareable.zip"
if (Test-Path $destinationZip) {
    Remove-Item $destinationZip -Force
}

Write-Host "Packaging Raahi Cafe project (clean source code without node_modules)..." -ForegroundColor Cyan

git archive --format=zip --output="$destinationZip" HEAD

if (Test-Path $destinationZip) {
    $item = Get-Item $destinationZip
    $sizeKb = [math]::Round($item.Length / 1KB, 1)
    Write-Host "Successfully created shareable ZIP: raahi-cafe-shareable.zip ($sizeKb KB)" -ForegroundColor Green
    Write-Host "File saved to: $destinationZip" -ForegroundColor Yellow
} else {
    Write-Host "Failed to create zip file." -ForegroundColor Red
}
