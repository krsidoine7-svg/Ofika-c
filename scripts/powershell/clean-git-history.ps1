# =====================================================
# SCRIPT : Nettoyer .env.example de l'historique Git
# =====================================================
# ⚠️ CE SCRIPT VA RÉÉCRIRE L'HISTORIQUE GIT
# ⚠️ SAUVEGARDEZ D'ABORD !
# =====================================================

Write-Host "========================================" -ForegroundColor Yellow
Write-Host "🚨 NETTOYAGE DE L'HISTORIQUE GIT" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️  ATTENTION : Ce script va :" -ForegroundColor Yellow
Write-Host "1. Supprimer .env.example de TOUT l'historique Git" -ForegroundColor White
Write-Host "2. Forcer le push sur GitHub" -ForegroundColor White
Write-Host "3. Cette action est IRRÉVERSIBLE" -ForegroundColor White
Write-Host ""

# Demander confirmation
$confirmation = Read-Host "Avez-vous RÉGÉNÉRÉ toutes vos clés Supabase ? (oui/non)"
if ($confirmation -ne "oui") {
    Write-Host "❌ ARRÊT : Régénérez d'abord vos clés sur supabase.com" -ForegroundColor Red
    Write-Host "Puis relancez ce script" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
$confirmation2 = Read-Host "Voulez-vous vraiment continuer ? (oui/non)"
if ($confirmation2 -ne "oui") {
    Write-Host "❌ Annulé par l'utilisateur" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔧 Début du nettoyage..." -ForegroundColor Cyan
Write-Host ""

# Créer une sauvegarde
Write-Host "📦 Création d'une branche de sauvegarde..." -ForegroundColor Cyan
git branch backup-avant-nettoyage-$(Get-Date -Format "yyyyMMdd-HHmmss")

# Supprimer .env.example de l'historique
Write-Host "🧹 Suppression de .env.example de l'historique..." -ForegroundColor Cyan
git filter-branch --force --index-filter `
  "git rm --cached --ignore-unmatch .env.example" `
  --prune-empty --tag-name-filter cat -- --all

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors du nettoyage" -ForegroundColor Red
    exit 1
}

# Nettoyer les références
Write-Host "🗑️  Nettoyage des références..." -ForegroundColor Cyan
git for-each-ref --format='delete %(refname)' refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Vérifier le résultat
Write-Host ""
Write-Host "🔍 Vérification..." -ForegroundColor Cyan
$historyCheck = git log --all --full-history -- .env.example

if ([string]::IsNullOrEmpty($historyCheck)) {
    Write-Host "✅ Parfait ! .env.example n'est plus dans l'historique" -ForegroundColor Green
} else {
    Write-Host "⚠️  .env.example est encore dans l'historique" -ForegroundColor Yellow
    Write-Host "Commits trouvés :" -ForegroundColor Yellow
    Write-Host $historyCheck
}

# Demander confirmation pour le push
Write-Host ""
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "🚀 PUSH FORCÉ SUR GITHUB" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""
$pushConfirm = Read-Host "Voulez-vous pousser les modifications ? (oui/non)"

if ($pushConfirm -eq "oui") {
    Write-Host "📤 Push forcé vers GitHub..." -ForegroundColor Cyan
    git push origin --force --all
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "✅ NETTOYAGE TERMINÉ AVEC SUCCÈS !" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "✅ .env.example supprimé de l'historique" -ForegroundColor Green
        Write-Host "✅ Modifications poussées sur GitHub" -ForegroundColor Green
        Write-Host ""
        Write-Host "📝 PROCHAINES ÉTAPES :" -ForegroundColor Cyan
        Write-Host "1. Créez un nouveau .env.example SANS secrets" -ForegroundColor White
        Write-Host "2. Mettez à jour votre .env avec les nouvelles clés" -ForegroundColor White
        Write-Host "3. Testez votre application" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host "❌ Erreur lors du push" -ForegroundColor Red
        Write-Host "Essayez manuellement : git push origin --force --all" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  Push annulé" -ForegroundColor Yellow
    Write-Host "Pour pousser plus tard : git push origin --force --all" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "📋 Une branche de sauvegarde a été créée" -ForegroundColor Cyan
Write-Host "Pour voir toutes vos branches : git branch -a" -ForegroundColor White
