# =====================================================
# SCRIPT D'INSTALLATION AUTOMATIQUE - DRIZZLE ORM
# =====================================================
# Ce script installe et configure Drizzle ORM pour Supabase

Write-Host "🚀 Installation de Drizzle ORM + Supabase" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Étape 1: Vérifier Node.js
Write-Host "📦 Étape 1/5: Vérification de Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js n'est pas installé!" -ForegroundColor Red
    Write-Host "   Téléchargez-le sur https://nodejs.org" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Node.js $nodeVersion détecté" -ForegroundColor Green
Write-Host ""

# Étape 2: Installation des dépendances
Write-Host "📦 Étape 2/5: Installation des dépendances..." -ForegroundColor Yellow
Write-Host "   Installing drizzle-orm and postgres..." -ForegroundColor Gray

npm install drizzle-orm postgres

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors de l'installation des dépendances" -ForegroundColor Red
    exit 1
}

Write-Host "   Installing dev dependencies..." -ForegroundColor Gray
npm install --save-dev drizzle-kit

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors de l'installation des dev dependencies" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Dépendances installées" -ForegroundColor Green
Write-Host ""

# Étape 3: Vérifier .env.local
Write-Host "🔑 Étape 3/5: Vérification de DATABASE_URL..." -ForegroundColor Yellow

if (Test-Path ".env.local") {
    $envContent = Get-Content ".env.local" -Raw
    if ($envContent -match "DATABASE_URL") {
        Write-Host "✅ DATABASE_URL trouvé dans .env.local" -ForegroundColor Green
    } else {
        Write-Host "⚠️  DATABASE_URL non trouvé dans .env.local" -ForegroundColor Yellow
        Write-Host "   Ajoutez cette ligne à .env.local:" -ForegroundColor Gray
        Write-Host "   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres" -ForegroundColor Cyan
        Write-Host ""
    }
} else {
    Write-Host "⚠️  .env.local n'existe pas" -ForegroundColor Yellow
    Write-Host "   Créez un fichier .env.local avec:" -ForegroundColor Gray
    Write-Host "   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres" -ForegroundColor Cyan
}
Write-Host ""

# Étape 4: Créer le fichier de test
Write-Host "🧪 Étape 4/5: Création du fichier de test..." -ForegroundColor Yellow

$testContent = @"
import { testConnection, closeConnection } from './lib/db';

async function main() {
  console.log('🔍 Testing database connection...');
  
  const success = await testConnection();
  
  if (success) {
    console.log('✅ All good! Drizzle is connected to Supabase.');
  } else {
    console.log('❌ Connection failed. Check your DATABASE_URL in .env.local');
  }
  
  await closeConnection();
  process.exit(success ? 0 : 1);
}

main().catch(console.error);
"@

$testContent | Out-File -FilePath "test-db-connection.ts" -Encoding UTF8
Write-Host "✅ Fichier test-db-connection.ts créé" -ForegroundColor Green
Write-Host ""

# Étape 5: Ajouter scripts npm
Write-Host "📝 Étape 5/5: Ajout des scripts npm..." -ForegroundColor Yellow

# Lire package.json
$packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json

# Ajouter les scripts Drizzle
if (-not $packageJson.scripts.PSObject.Properties["db:generate"]) {
    $packageJson.scripts | Add-Member -MemberType NoteProperty -Name "db:generate" -Value "drizzle-kit generate" -Force
}
if (-not $packageJson.scripts.PSObject.Properties["db:push"]) {
    $packageJson.scripts | Add-Member -MemberType NoteProperty -Name "db:push" -Value "drizzle-kit push" -Force
}
if (-not $packageJson.scripts.PSObject.Properties["db:studio"]) {
    $packageJson.scripts | Add-Member -MemberType NoteProperty -Name "db:studio" -Value "drizzle-kit studio" -Force
}
if (-not $packageJson.scripts.PSObject.Properties["db:test"]) {
    $packageJson.scripts | Add-Member -MemberType NoteProperty -Name "db:test" -Value "tsx test-db-connection.ts" -Force
}

# Sauvegarder package.json
$packageJson | ConvertTo-Json -Depth 10 | Set-Content "package.json" -Encoding UTF8

Write-Host "✅ Scripts npm ajoutés à package.json" -ForegroundColor Green
Write-Host ""

# Résumé final
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "✨ Installation terminée avec succès!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📁 Fichiers créés:" -ForegroundColor Yellow
Write-Host "   ✅ drizzle.config.ts" -ForegroundColor Green
Write-Host "   ✅ drizzle/schema.ts" -ForegroundColor Green
Write-Host "   ✅ lib/db.ts" -ForegroundColor Green
Write-Host "   ✅ test-db-connection.ts" -ForegroundColor Green
Write-Host "   ✅ DRIZZLE_SETUP_GUIDE.md" -ForegroundColor Green
Write-Host ""

Write-Host "📦 Dépendances installées:" -ForegroundColor Yellow
Write-Host "   ✅ drizzle-orm" -ForegroundColor Green
Write-Host "   ✅ postgres (postgres-js)" -ForegroundColor Green
Write-Host "   ✅ drizzle-kit (dev)" -ForegroundColor Green
Write-Host ""

Write-Host "🎯 Scripts npm disponibles:" -ForegroundColor Yellow
Write-Host "   npm run db:generate  - Générer les migrations" -ForegroundColor Cyan
Write-Host "   npm run db:push      - Pousser le schéma vers Supabase" -ForegroundColor Cyan
Write-Host "   npm run db:studio    - Ouvrir Drizzle Studio" -ForegroundColor Cyan
Write-Host "   npm run db:test      - Tester la connexion" -ForegroundColor Cyan
Write-Host ""

Write-Host "⚠️  PROCHAINES ÉTAPES IMPORTANTES:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1️⃣  Configurez DATABASE_URL dans .env.local" -ForegroundColor White
Write-Host "   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[ID].supabase.co:5432/postgres" -ForegroundColor Gray
Write-Host ""
Write-Host "2️⃣  Testez la connexion:" -ForegroundColor White
Write-Host "   npm run db:test" -ForegroundColor Cyan
Write-Host ""
Write-Host "3️⃣  (Optionnel) Synchronisez avec Supabase:" -ForegroundColor White
Write-Host "   npm run db:push" -ForegroundColor Cyan
Write-Host ""
Write-Host "4️⃣  Explorez avec Drizzle Studio:" -ForegroundColor White
Write-Host "   npm run db:studio" -ForegroundColor Cyan
Write-Host ""

Write-Host "📚 Documentation complète: DRIZZLE_SETUP_GUIDE.md" -ForegroundColor Yellow
Write-Host ""
Write-Host "🎉 Prêt à utiliser Drizzle ORM!" -ForegroundColor Green
Write-Host ""
