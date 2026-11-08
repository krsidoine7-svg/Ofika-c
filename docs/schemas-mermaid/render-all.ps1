# Régénère tous les SVG à partir des fichiers .mmd
# Usage : .\schemas-mermaid\render-all.ps1

$SkillRoot = Join-Path $PSScriptRoot "..\.skills\skills Agents\skill-mermaidH"
$SchemaRoot = $PSScriptRoot
$RenderScript = Join-Path $SkillRoot "scripts\render.mjs"

Write-Host "Export SVG Mermaid -> $SchemaRoot" -ForegroundColor Cyan

Get-ChildItem -Path $SchemaRoot -Recurse -Filter "*.mmd" | ForEach-Object {
    # userJourney : source Markdown uniquement, SVG via -flowchart.mmd
    if ($_.BaseName -eq "parcours-visiteur") {
        Write-Host "  $($_.Name) -> (skip, utiliser parcours-visiteur-flowchart.mmd)" -ForegroundColor DarkGray
        return
    }

    $input = $_.FullName
    $baseName = $_.BaseName -replace "-flowchart$", ""
    $output = Join-Path $_.DirectoryName "$baseName.svg"

    Write-Host "  $($_.Name) -> $([System.IO.Path]::GetFileName($output))"
    node $RenderScript --input $input --output $output --theme tokyo-night
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "  Echec pour $($_.Name)"
    }
}

Write-Host "Termine." -ForegroundColor Green
