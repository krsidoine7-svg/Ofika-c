#!/usr/bin/env node

/**
 * Script pour configurer ngrok et tester Lygos en développement local
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Configuration ngrok pour tests Lygos...\n');

// Fonction pour attendre
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function setupNgrok() {
  console.log('1. 🔗 Démarrage de ngrok...');
  
  // Démarrer ngrok
  const ngrok = spawn('ngrok', ['http', '3000', '--log=stdout'], {
    stdio: 'pipe'
  });

  let ngrokUrl = '';
  
  // Écouter la sortie de ngrok
  ngrok.stdout.on('data', (data) => {
    const output = data.toString();
    console.log('ngrok:', output);
    
    // Chercher l'URL publique
    const urlMatch = output.match(/https:\/\/[a-z0-9-]+\.ngrok\.io/);
    if (urlMatch && !ngrokUrl) {
      ngrokUrl = urlMatch[0];
      console.log(`\n✅ URL publique: ${ngrokUrl}\n`);
      
      // Instructions
      console.log('📋 INSTRUCTIONS:');
      console.log('1. Copie cette URL dans ton .env.local:');
      console.log(`   NEXT_PUBLIC_APP_URL=${ngrokUrl}`);
      console.log('');
      console.log('2. Redémarre ton serveur Next.js');
      console.log('');
      console.log('3. Teste sur: ' + ngrokUrl + '/test-lygos');
      console.log('');
      console.log('⚠️  Garde cette fenêtre ouverte pour maintenir le tunnel');
    }
  });

  ngrok.stderr.on('data', (data) => {
    console.error('ngrok erreur:', data.toString());
  });

  ngrok.on('close', (code) => {
    console.log(`ngrok fermé avec le code ${code}`);
  });

  // Gérer Ctrl+C
  process.on('SIGINT', () => {
    console.log('\n🛑 Arrêt de ngrok...');
    ngrok.kill();
    process.exit();
  });
}

// Vérifier si ngrok est installé
try {
  spawn('ngrok', ['--version'], { stdio: 'ignore' });
  setupNgrok();
} catch (error) {
  console.error('❌ ngrok n\'est pas installé. Installe-le avec:');
  console.error('npm install -g ngrok');
  process.exit(1);
}
