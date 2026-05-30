#!/usr/bin/env node

/**
 * Script de diagnostic des performances
 * Analyse les problèmes de performance et suggère des corrections
 */

const fs = require('fs')
const path = require('path')

console.log('🔍 Diagnostic des performances...\n')

// 1. Vérifier les hooks avec des dépendances problématiques
console.log('📊 Analyse des hooks React...')

const hooksDir = path.join(__dirname, '..', 'lib', 'hooks')
const hookFiles = fs.readdirSync(hooksDir).filter(file => file.endsWith('.ts'))

const problematicHooks = []

hookFiles.forEach(file => {
  const content = fs.readFileSync(path.join(hooksDir, file), 'utf8')
  
  // Détecter les useEffect avec des dépendances manquantes
  const useEffectRegex = /useEffect\(\(\)\s*=>\s*\{[\s\S]*?\},\s*\[\s*\]\)/g
  const matches = content.match(useEffectRegex)
  
  if (matches) {
    problematicHooks.push({
      file,
      issue: 'useEffect avec dépendances vides suspectes',
      count: matches.length
    })
  }
  
  // Détecter les dépendances circulaires
  const dependencyRegex = /useEffect\(\(\)\s*=>\s*\{[\s\S]*?\},\s*\[([^\]]+)\]\)/g
  let match
  while ((match = dependencyRegex.exec(content)) !== null) {
    const deps = match[1].split(',').map(d => d.trim())
    if (deps.some(dep => dep.includes('load') || dep.includes('fetch'))) {
      problematicHooks.push({
        file,
        issue: 'Dépendances potentiellement circulaires',
        deps: deps
      })
    }
  }
})

if (problematicHooks.length > 0) {
  console.log('⚠️  Hooks problématiques détectés:')
  problematicHooks.forEach(hook => {
    console.log(`   - ${hook.file}: ${hook.issue}`)
    if (hook.deps) {
      console.log(`     Dépendances: ${hook.deps.join(', ')}`)
    }
  })
} else {
  console.log('✅ Aucun hook problématique détecté')
}

// 2. Vérifier les imports non utilisés
console.log('\n📦 Analyse des imports...')

const componentsDir = path.join(__dirname, '..', 'components')
const appDir = path.join(__dirname, '..', 'app')

function findUnusedImports(dir) {
  const files = fs.readdirSync(dir, { recursive: true })
    .filter(file => file.endsWith('.tsx') || file.endsWith('.ts'))
  
  const unusedImports = []
  
  files.forEach(file => {
    const fullPath = path.join(dir, file)
    const content = fs.readFileSync(fullPath, 'utf8')
    
    // Détecter les imports React non utilisés
    const reactImports = content.match(/import\s+{([^}]+)}\s+from\s+['"]react['"]/g)
    if (reactImports) {
      reactImports.forEach(importLine => {
        const imports = importLine.match(/{([^}]+)}/)[1]
          .split(',')
          .map(imp => imp.trim())
        
        imports.forEach(imp => {
          if (!content.includes(imp) || content.indexOf(imp) === content.indexOf(importLine)) {
            unusedImports.push({
              file: file,
              import: imp
            })
          }
        })
      })
    }
  })
  
  return unusedImports
}

const unusedImports = [
  ...findUnusedImports(componentsDir),
  ...findUnusedImports(appDir)
]

if (unusedImports.length > 0) {
  console.log('⚠️  Imports non utilisés détectés:')
  unusedImports.slice(0, 10).forEach(imp => {
    console.log(`   - ${imp.file}: ${imp.import}`)
  })
  if (unusedImports.length > 10) {
    console.log(`   ... et ${unusedImports.length - 10} autres`)
  }
} else {
  console.log('✅ Aucun import non utilisé détecté')
}

// 3. Vérifier les console.log en production
console.log('\n🐛 Analyse des logs de debug...')

const debugLogs = []

function findDebugLogs(dir) {
  const files = fs.readdirSync(dir, { recursive: true })
    .filter(file => file.endsWith('.tsx') || file.endsWith('.ts'))
  
  files.forEach(file => {
    const fullPath = path.join(dir, file)
    const content = fs.readFileSync(fullPath, 'utf8')
    
    const consoleRegex = /console\.(log|warn|error|debug)\(/g
    let match
    while ((match = consoleRegex.exec(content)) !== null) {
      debugLogs.push({
        file: file,
        type: match[1],
        line: content.substring(0, match.index).split('\n').length
      })
    }
  })
}

findDebugLogs(componentsDir)
findDebugLogs(appDir)

if (debugLogs.length > 0) {
  console.log('⚠️  Logs de debug détectés:')
  debugLogs.slice(0, 10).forEach(log => {
    console.log(`   - ${log.file}:${log.line} console.${log.type}`)
  })
  if (debugLogs.length > 10) {
    console.log(`   ... et ${debugLogs.length - 10} autres`)
  }
} else {
  console.log('✅ Aucun log de debug détecté')
}

// 4. Vérifier la taille des bundles
console.log('\n📦 Analyse de la taille des fichiers...')

const largeFiles = []

function findLargeFiles(dir, maxSize = 10000) { // 10KB
  const files = fs.readdirSync(dir, { recursive: true })
    .filter(file => file.endsWith('.tsx') || file.endsWith('.ts'))
  
  files.forEach(file => {
    const fullPath = path.join(dir, file)
    const stats = fs.statSync(fullPath)
    
    if (stats.size > maxSize) {
      largeFiles.push({
        file: file,
        size: (stats.size / 1024).toFixed(2) + 'KB'
      })
    }
  })
}

findLargeFiles(componentsDir)
findLargeFiles(appDir)

if (largeFiles.length > 0) {
  console.log('⚠️  Fichiers volumineux détectés:')
  largeFiles.forEach(file => {
    console.log(`   - ${file.file}: ${file.size}`)
  })
} else {
  console.log('✅ Aucun fichier volumineux détecté')
}

// 5. Recommandations
console.log('\n💡 Recommandations:')

if (problematicHooks.length > 0) {
  console.log('   - Corriger les dépendances useEffect dans les hooks')
}

if (unusedImports.length > 0) {
  console.log('   - Supprimer les imports non utilisés')
}

if (debugLogs.length > 0) {
  console.log('   - Remplacer console.log par un système de logging conditionnel')
}

if (largeFiles.length > 0) {
  console.log('   - Diviser les fichiers volumineux en composants plus petits')
}

console.log('\n✅ Diagnostic terminé!')
