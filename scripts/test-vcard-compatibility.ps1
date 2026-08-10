param (
    [string]$ProfileId = "test-vcard-user",
    [int]$Iterations = 30
)

$UserAgents = @(
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1", # iOS Safari
    "Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36 OPR/76.2.4027.73374", # Samsung
    "Mozilla/5.0 (Linux; Android 12; VOG-L29) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36", # Huawei
    "Mozilla/5.0 (Linux; Android 13; Pixel 7 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36" # Android Google
)

$Url = "http://localhost:5000/api/contacts/$ProfileId"

Write-Host "🚀 Démarrage des tests vCard pour le profil: $ProfileId"
Write-Host "Nombre d'itérations: $Iterations"
Write-Host "--------------------------------------------------------"

$successCount = 0
$failCount = 0

for ($i = 1; $i -le $Iterations; $i++) {
    $agent = $UserAgents[$i % $UserAgents.Length]
    $delay = Get-Random -Minimum 3 -Maximum 5 # Entre 3 et 4 secondes

    $agentParts = $agent.Split('(')
    $agentName = "Unknown"
    if ($agentParts.Length -gt 1) {
        $agentName = $agentParts[1].Split(';')[0]
    }
    Write-Host "[Test $i/$Iterations] User-Agent: $agentName" -NoNewline
    
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    
    try {
        $response = Invoke-WebRequest -Uri $Url -Headers @{"User-Agent"=$agent} -UseBasicParsing -ErrorAction Stop
        $stopwatch.Stop()
        $latency = $stopwatch.ElapsedMilliseconds
        
        $content = $response.Content
        $isValid = $content -match "BEGIN:VCARD" -and $content -match "FN:" -and $content -match "END:VCARD"
        
        if ($response.StatusCode -eq 200 -and $isValid) {
            Write-Host " -> OK ($latency ms)" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host " -> ÉCHEC: vCard malformée ($latency ms)" -ForegroundColor Red
            $failCount++
        }
    } catch {
        $stopwatch.Stop()
        Write-Host " -> ERREUR HTTP: $($_.Exception.Message)" -ForegroundColor Red
        $failCount++
    }

    if ($i -lt $Iterations) {
        Start-Sleep -Seconds $delay
    }
}

Write-Host "--------------------------------------------------------"
Write-Host "📊 Bilan des tests :"
Write-Host "✅ Succès : $successCount" -ForegroundColor Green
Write-Host "❌ Échecs : $failCount" -ForegroundColor Red

if ($failCount -eq 0) {
    Write-Host "🎉 Tous les tests ont réussi !" -ForegroundColor Green
} else {
    Write-Host "⚠️ Des erreurs ont été détectées. Veuillez vérifier les logs serveur." -ForegroundColor Yellow
}
