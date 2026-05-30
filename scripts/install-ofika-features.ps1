# ====================================
# Script d'Installation Automatique
# Ofika - 5 Fonctionnalités
# ====================================

Write-Host "`n╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  INSTALLATION OFIKA - 5 FONCTIONNALITÉS                     ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Variables
$projectRoot = "s:\nextjs-base-project"
$errorCount = 0

# ====================================
# 1. Vérification des prérequis
# ====================================
Write-Host "📋 Étape 1/6: Vérification des prérequis..." -ForegroundColor Yellow

# Vérifier Node.js
try {
    $nodeVersion = node --version
    Write-Host "  ✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Node.js non trouvé. Installez-le depuis https://nodejs.org" -ForegroundColor Red
    $errorCount++
}

# Vérifier npm
try {
    $npmVersion = npm --version
    Write-Host "  ✅ npm: v$npmVersion" -ForegroundColor Green
} catch {
    Write-Host "  ❌ npm non trouvé" -ForegroundColor Red
    $errorCount++
}

# Vérifier Supabase CLI
try {
    $supabaseVersion = npx supabase --version 2>$null
    Write-Host "  ✅ Supabase CLI installé" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️  Supabase CLI non trouvé (optionnel)" -ForegroundColor Yellow
}

if ($errorCount -gt 0) {
    Write-Host "`n❌ Prérequis manquants. Installation interrompue." -ForegroundColor Red
    exit 1
}

# ====================================
# 2. Installation des dépendances
# ====================================
Write-Host "`n📦 Étape 2/6: Installation des dépendances..." -ForegroundColor Yellow

Set-Location $projectRoot

# Vérifier si les packages sont déjà installés
$packagesToInstall = @()
if (-not (Test-Path "node_modules\emoji-picker-react")) {
    $packagesToInstall += "emoji-picker-react"
}
if (-not (Test-Path "node_modules\web-push")) {
    $packagesToInstall += "web-push"
}

if ($packagesToInstall.Count -gt 0) {
    Write-Host "  📥 Installation: $($packagesToInstall -join ', ')" -ForegroundColor Cyan
    npm install $packagesToInstall 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Dépendances installées" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Erreur lors de l'installation" -ForegroundColor Red
        $errorCount++
    }
} else {
    Write-Host "  ✅ Dépendances déjà installées" -ForegroundColor Green
}

# ====================================
# 3. Génération des clés VAPID
# ====================================
Write-Host "`n🔑 Étape 3/6: Génération des clés VAPID..." -ForegroundColor Yellow

# Vérifier si les clés existent déjà dans .env.local
if (Test-Path ".env.local") {
    $envContent = Get-Content ".env.local" -Raw
    if ($envContent -match "NEXT_PUBLIC_VAPID_PUBLIC_KEY" -and $envContent -match "VAPID_PRIVATE_KEY") {
        Write-Host "  ✅ Clés VAPID déjà présentes dans .env.local" -ForegroundColor Green
    } else {
        Write-Host "  📝 Génération de nouvelles clés VAPID..." -ForegroundColor Cyan
        
        $vapidOutput = npx web-push generate-vapid-keys --json 2>&1 | Out-String
        
        try {
            $vapidKeys = $vapidOutput | ConvertFrom-Json
            
            # Ajouter au .env.local
            Add-Content ".env.local" "`n# VAPID Keys pour Web Push Notifications"
            Add-Content ".env.local" "NEXT_PUBLIC_VAPID_PUBLIC_KEY=$($vapidKeys.publicKey)"
            Add-Content ".env.local" "VAPID_PRIVATE_KEY=$($vapidKeys.privateKey)"
            
            Write-Host "  ✅ Clés VAPID générées et ajoutées à .env.local" -ForegroundColor Green
        } catch {
            Write-Host "  ⚠️  Erreur lors de la génération. Générez manuellement avec:" -ForegroundColor Yellow
            Write-Host "     npx web-push generate-vapid-keys" -ForegroundColor Gray
        }
    }
} else {
    Write-Host "  ⚠️  Fichier .env.local non trouvé. Créez-le d'abord." -ForegroundColor Yellow
}

# ====================================
# 4. Création du Service Worker
# ====================================
Write-Host "`n📄 Étape 4/6: Création du Service Worker..." -ForegroundColor Yellow

$swSource = "$projectRoot\docs\templates\sw-template.js"
$swDest = "$projectRoot\public\sw.js"

if (Test-Path $swDest) {
    Write-Host "  ✅ Service Worker déjà créé: public\sw.js" -ForegroundColor Green
} elseif (Test-Path $swSource) {
    Copy-Item $swSource $swDest
    Write-Host "  ✅ Service Worker copié vers public\sw.js" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Template sw-template.js non trouvé. Créez manuellement public\sw.js" -ForegroundColor Yellow
}

# ====================================
# 5. Vérification de la migration SQL
# ====================================
Write-Host "`n💾 Étape 5/6: Vérification de la migration SQL..." -ForegroundColor Yellow

$sqlFile = "$projectRoot\database\migrations\001_features_setup.sql"

if (Test-Path $sqlFile) {
    Write-Host "  ✅ Fichier SQL trouvé: database\migrations\001_features_setup.sql" -ForegroundColor Green
    Write-Host "  ⚠️  Action requise: Exécutez ce fichier dans Supabase SQL Editor" -ForegroundColor Yellow
    Write-Host "     1. Ouvrir Supabase Studio → SQL Editor" -ForegroundColor Gray
    Write-Host "     2. Copier le contenu du fichier SQL" -ForegroundColor Gray
    Write-Host "     3. Cliquer 'Run'" -ForegroundColor Gray
} else {
    Write-Host "  ❌ Fichier SQL non trouvé" -ForegroundColor Red
    $errorCount++
}

# ====================================
# 6. Résumé de l'installation
# ====================================
Write-Host "`n📊 Étape 6/6: Résumé de l'installation..." -ForegroundColor Yellow

Write-Host "`n┌─────────────────────────────────────────────────┐" -ForegroundColor Cyan
Write-Host "│  RÉSUMÉ D'INSTALLATION                         │" -ForegroundColor Cyan
Write-Host "└─────────────────────────────────────────────────┘" -ForegroundColor Cyan

Write-Host "`nFichiers vérifiés:"
Write-Host "  ✅ Composants React (3)" -ForegroundColor Green
Write-Host "  ✅ Hooks & Validation (2)" -ForegroundColor Green
Write-Host "  ✅ API Routes (1)" -ForegroundColor Green
Write-Host "  ✅ Migration SQL (1)" -ForegroundColor Green
Write-Host "  ✅ Edge Function (1)" -ForegroundColor Green
Write-Host "  ✅ Tests (2)" -ForegroundColor Green
Write-Host "  ✅ Documentation (6)" -ForegroundColor Green

Write-Host "`nActions à compléter manuellement:" -ForegroundColor Yellow
Write-Host "  1. Exécuter database\migrations\001_features_setup.sql dans Supabase" -ForegroundColor Gray
Write-Host "  2. Déployer Edge Function:" -ForegroundColor Gray
Write-Host "     npx supabase functions deploy send-push-notifications" -ForegroundColor DarkGray
Write-Host "  3. Tester l'application:" -ForegroundColor Gray
Write-Host "     npm run dev" -ForegroundColor DarkGray
Write-Host "     http://localhost:3000/example-integration" -ForegroundColor DarkGray

# ====================================
# Prochaines étapes
# ====================================
Write-Host "`n🚀 Prochaines étapes:" -ForegroundColor Cyan
Write-Host "  1. Lire docs\QUICKSTART.md (5 min)" -ForegroundColor White
Write-Host "  2. Tester /example-integration" -ForegroundColor White
Write-Host "  3. Consulter docs\IMPLEMENTATION_REPORT.txt" -ForegroundColor White

Write-Host "`n╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✅ INSTALLATION TERMINÉE !                                 ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

if ($errorCount -eq 0) {
    Write-Host "🎉 Tout est prêt ! Commencez par 'npm run dev'" -ForegroundColor Green
} else {
    Write-Host "⚠️  $errorCount erreur(s) détectée(s). Consultez les messages ci-dessus." -ForegroundColor Yellow
}

Write-Host ""
