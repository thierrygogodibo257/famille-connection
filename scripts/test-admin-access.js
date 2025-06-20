#!/usr/bin/env node

/**
 * Script de test pour l'accès admin
 * Usage: node scripts/test-admin-access.js
 */

import fetch from 'node-fetch';

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://rrlixvlwsaeaugudwbiw.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybGl4dmx3c2FlYXVndWR3Yml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MjE2NjksImV4cCI6MjA2NTI5NzY2OX0.UgOxyIqwLWH5RGMiUW7ZB7AnvblVzi2uwUbNjV44_Vk';

async function testAdminAccess() {
  console.log('🧪 Test d\'accès admin\n');
  console.log(`URL de base: ${SUPABASE_URL}\n`);

  // Test 1: Vérifier l'accès aux profils (sans auth)
  console.log('🔍 Test 1: Accès aux profils (sans authentification)...');
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=*&limit=1`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });

    console.log(`   Status: ${response.status}`);

    if (response.status === 200) {
      const data = await response.json();
      console.log(`   ✅ Accès aux profils réussi (${data.length} profils)`);
    } else if (response.status === 401) {
      console.log('   ❌ Accès refusé (401) - Authentification requise');
    } else {
      console.log(`   ⚠️  Statut inattendu: ${response.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Erreur: ${error.message}`);
  }

  console.log('');

  // Test 2: Vérifier les politiques RLS
  console.log('🔍 Test 2: Vérification des politiques RLS...');
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=id,first_name,last_name,is_admin&limit=5`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
      },
    });

    console.log(`   Status: ${response.status}`);

    if (response.status === 200) {
      const data = await response.json();
      console.log(`   ✅ Données récupérées: ${data.length} profils`);

      // Afficher les premiers profils
      data.forEach((profile, index) => {
        console.log(`     ${index + 1}. ${profile.first_name} ${profile.last_name} (Admin: ${profile.is_admin})`);
      });
    } else {
      const errorText = await response.text();
      console.log(`   ❌ Erreur: ${errorText.substring(0, 200)}`);
    }
  } catch (error) {
    console.log(`   ❌ Erreur: ${error.message}`);
  }

  console.log('');

  // Test 3: Vérifier l'API Edge Functions
  console.log('🔍 Test 3: Test des Edge Functions...');
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/delete_all_users`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:8080',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'authorization,content-type,x-admin-secret',
      },
    });

    console.log(`   Status: ${response.status}`);
    console.log(`   CORS: ${response.headers.get('Access-Control-Allow-Origin')}`);

    if (response.status === 200) {
      console.log('   ✅ Edge Functions accessibles');
    } else {
      console.log('   ❌ Edge Functions inaccessibles');
    }
  } catch (error) {
    console.log(`   ❌ Erreur: ${error.message}`);
  }

  console.log('\n📝 Recommandations:');
  console.log('1. Vérifiez que vous êtes connecté dans l\'application');
  console.log('2. Vérifiez que votre profil a is_admin = true');
  console.log('3. Testez la page Administration après connexion');
  console.log('4. Vérifiez les logs dans la console du navigateur');
}

// Exécution
testAdminAccess()
  .then(() => {
    console.log('\n✅ Tests d\'accès admin terminés');
  })
  .catch(error => {
    console.error('❌ Erreur lors des tests:', error);
    process.exit(1);
  });
