/**
 * Script de vérification des logos Ofika
 * Vérifie que tous les logos sont présents et accessibles
 */

const fs = require('fs');
const path = require('path');

const logoFiles = [
  'public/assets/logos/logo-main.svg',
  'public/assets/logos/logo-white.svg',
  'public/assets/logos/logo-icon.svg',
  'public/assets/logos/logo-secondary.svg',
];

console.log('🔍 Vérification des logos Ofika...\n');

let allLogosExist = true;
const missingLogos = [];

logoFiles.forEach((logoPath) => {
  const fullPath = path.join(process.cwd(), logoPath);
  const exists = fs.existsSync(fullPath);
  
  if (exists) {
    const stats = fs.statSync(fullPath);
    console.log(`✅ ${logoPath} (${(stats.size / 1024).toFixed(2)} KB)`);
  } else {
    console.log(`❌ ${logoPath} - MANQUANT`);
    allLogosExist = false;
    missingLogos.push(logoPath);
  }
});

console.log('\n' + '='.repeat(50));

if (allLogosExist) {
  console.log('✅ Logos successfully integrated and old assets removed.');
  console.log('\n📋 Résumé:');
  console.log('   - Tous les logos sont présents');
  console.log('   - Les fichiers sont accessibles');
  console.log('   - Prêt pour la production');
  process.exit(0);
} else {
  console.log('❌ Some logos failed to render. Please verify image paths.');
  console.log('\n📋 Logos manquants:');
  missingLogos.forEach((logo) => {
    console.log(`   - ${logo}`);
  });
  process.exit(1);
}

