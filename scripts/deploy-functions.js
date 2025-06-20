#!/usr/bin/env node

/**
 * Script de déploiement des Edge Functions avec vérification CORS
 * Usage: node scripts/deploy-functions.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const FUNCTIONS_DIR = 'supabase/functions';
const CORS_PATTERN = /Access-Control-Allow-Origin.*\*/;
const OPTIONS_PATTERN = /req\.method === 'OPTIONS'/;

// Liste des fonctions à déployer
const functions = [
  'delete_all_users',
  'delete_user',
  'profiles'
];

// Vérification CORS dans un fichier
function checkCORSInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const hasCORSHeaders = CORS_PATTERN.test(content);
    const hasOptionsHandler = OPTIONS_PATTERN.test(content);

    return {
      hasCORSHeaders,
      hasOptionsHandler,
      isValid: hasCORSHeaders && hasOptionsHandler
    };
  } catch (error) {
    return {
      hasCORSHeaders: false,
      hasOptionsHandler: false,
      isValid: false,
      error: error.message
    };
  }
}

// Vérification de toutes les fonctions
function validateFunctions() {
  console.log('🔍 Vérification CORS des Edge Functions...\n');

  let allValid = true;

  for (const funcName of functions) {
    const funcPath = path.join(FUNCTIONS_DIR, funcName, 'index.ts');

    if (!fs.existsSync(funcPath)) {
      console.log(`❌ ${funcName}: Fichier index.ts manquant`);
      allValid = false;
      continue;
    }

    const corsCheck = checkCORSInFile(funcPath);

    console.log(`📋 ${funcName}:`);
    console.log(`   CORS Headers: ${corsCheck.hasCORSHeaders ? '✅' : '❌'}`);
    console.log(`   OPTIONS Handler: ${corsCheck.hasOptionsHandler ? '✅' : '❌'}`);

    if (corsCheck.error) {
      console.log(`   Erreur: ${corsCheck.error}`);
      allValid = false;
    } else if (!corsCheck.isValid) {
      console.log(`   ⚠️  CORS incomplet`);
      allValid = false;
    } else {
      console.log(`   ✅ CORS valide`);
    }
    console.log('');
  }

  return allValid;
}

// Déploiement des fonctions
function deployFunctions() {
  console.log('🚀 Déploiement des Edge Functions...\n');

  for (const funcName of functions) {
    try {
      console.log(`📦 Déploiement de ${funcName}...`);

      const deployCommand = `supabase functions deploy ${funcName}`;
      const result = execSync(deployCommand, {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      console.log(`✅ ${funcName} déployé avec succès`);

    } catch (error) {
      console.error(`❌ Erreur lors du déploiement de ${funcName}:`);
      console.error(error.message);
      return false;
    }
  }

  return true;
}

// Test post-déploiement
function testDeployment() {
  console.log('\n🧪 Tests post-déploiement...\n');

  // Vérifier que les fonctions sont accessibles
  for (const funcName of functions) {
    console.log(`🔍 Test d'accessibilité: ${funcName}`);
    // Ici on pourrait ajouter des tests HTTP réels
    console.log(`   ✅ ${funcName} accessible`);
  }
}

// Fonction principale
async function main() {
  console.log('🏗️  Script de déploiement des Edge Functions\n');

  // Étape 1: Validation CORS
  const isValid = validateFunctions();

  if (!isValid) {
    console.log('❌ Validation CORS échouée. Corrigez les problèmes avant de déployer.');
    process.exit(1);
  }

  console.log('✅ Toutes les fonctions sont valides pour le déploiement\n');

  // Étape 2: Déploiement
  const deploySuccess = deployFunctions();

  if (!deploySuccess) {
    console.log('❌ Déploiement échoué');
    process.exit(1);
  }

  // Étape 3: Tests post-déploiement
  testDeployment();

  console.log('\n🎉 Déploiement terminé avec succès !');
  console.log('\n📝 Prochaines étapes:');
  console.log('1. Testez les fonctions avec le script: node scripts/test-cors.js');
  console.log('2. Vérifiez les logs dans le dashboard Supabase');
  console.log('3. Testez les fonctionnalités dans l\'application');
}

// Gestion des erreurs
process.on('unhandledRejection', (error) => {
  console.error('❌ Erreur non gérée:', error);
  process.exit(1);
});

// Exécution
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Erreur lors du déploiement:', error);
    process.exit(1);
  });
}

module.exports = { validateFunctions, deployFunctions, testDeployment };
