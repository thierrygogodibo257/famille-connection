#!/usr/bin/env node

/**
 * Script de test CORS pour Supabase Auth
 * Usage: node scripts/test-auth-cors.js
 */

import fetch from 'node-fetch';

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://rrlixvlwsaeaugudwbiw.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybGl4dmx3c2FlYXVndWR3Yml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MjE2NjksImV4cCI6MjA2NTI5NzY2OX0.UgOxyIqwLWH5RGMiUW7ZB7AnvblVzi2uwUbNjV44_Vk';

// Tests Auth CORS
const authTests = [
  {
    name: 'Test OPTIONS preflight - Auth User',
    url: `${SUPABASE_URL}/auth/v1/user`,
    method: 'OPTIONS',
    headers: {
      'Origin': 'http://localhost:8080',
      'Access-Control-Request-Method': 'GET',
      'Access-Control-Request-Headers': 'authorization,apikey,content-type',
    },
  },
  {
    name: 'Test GET Auth User (sans token)',
    url: `${SUPABASE_URL}/auth/v1/user`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Origin': 'http://localhost:8080',
    },
  },
  {
    name: 'Test GET Auth User (avec Authorization)',
    url: `${SUPABASE_URL}/auth/v1/user`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Origin': 'http://localhost:8080',
    },
  },
  {
    name: 'Test POST Auth Sign In',
    url: `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Origin': 'http://localhost:8080',
    },
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'testpassword'
    }),
  },
];

async function testAuthCORS() {
  console.log('🧪 Tests CORS pour Supabase Auth\n');
  console.log(`URL de base: ${SUPABASE_URL}\n`);
  console.log(`Origine testée: http://localhost:8080\n`);

  for (const test of authTests) {
    try {
      console.log(`🔍 ${test.name}...`);

      const response = await fetch(test.url, {
        method: test.method,
        headers: test.headers,
        body: test.body,
      });

      console.log(`   Status: ${response.status}`);
      console.log(`   CORS Headers:`);

      const corsHeaders = [
        'Access-Control-Allow-Origin',
        'Access-Control-Allow-Methods',
        'Access-Control-Allow-Headers',
        'Access-Control-Allow-Credentials',
      ];

      corsHeaders.forEach(header => {
        const value = response.headers.get(header);
        console.log(`     ${header}: ${value || '❌ Manquant'}`);
      });

      // Analyse du statut
      if (test.method === 'OPTIONS') {
        if (response.status === 200) {
          console.log('   ✅ Test OPTIONS réussi');
        } else {
          console.log('   ❌ Test OPTIONS échoué');
        }
      } else {
        if (response.status === 401) {
          console.log('   ✅ Test réussi (401 attendu pour non-authentifié)');
        } else if (response.status === 200) {
          console.log('   ⚠️  Test réussi (200 inattendu)');
        } else {
          console.log(`   ❌ Test échoué (${response.status})`);
        }
      }

      // Afficher le body pour les erreurs
      if (response.status >= 400) {
        try {
          const errorBody = await response.text();
          console.log(`   Error Body: ${errorBody.substring(0, 200)}...`);
        } catch (e) {
          console.log('   Error Body: Non lisible');
        }
      }

    } catch (error) {
      console.log(`   ❌ Erreur: ${error.message}`);
    }
    console.log('');
  }

  console.log('📝 Recommandations:');
  console.log('1. Vérifiez la configuration dans Supabase Dashboard');
  console.log('2. Ajoutez http://localhost:8080 aux origines autorisées');
  console.log('3. Vérifiez les redirects dans Auth Settings');
  console.log('4. Testez avec un autre port (5173, 3000)');
}

// Test avec curl (pour référence)
function showCurlExamples() {
  console.log('\n🔧 Exemples curl pour tests manuels:');

  console.log('\n# Test preflight OPTIONS');
  console.log(`curl -X OPTIONS \\`);
  console.log(`  -H "Origin: http://localhost:8080" \\`);
  console.log(`  -H "Access-Control-Request-Method: GET" \\`);
  console.log(`  -H "Access-Control-Request-Headers: authorization,apikey,content-type" \\`);
  console.log(`  ${SUPABASE_URL}/auth/v1/user`);

  console.log('\n# Test GET user (sans auth)');
  console.log(`curl -X GET \\`);
  console.log(`  -H "Content-Type: application/json" \\`);
  console.log(`  -H "apikey: ${SUPABASE_ANON_KEY}" \\`);
  console.log(`  -H "Origin: http://localhost:8080" \\`);
  console.log(`  ${SUPABASE_URL}/auth/v1/user`);

  console.log('\n# Test GET user (avec auth)');
  console.log(`curl -X GET \\`);
  console.log(`  -H "Content-Type: application/json" \\`);
  console.log(`  -H "apikey: ${SUPABASE_ANON_KEY}" \\`);
  console.log(`  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \\`);
  console.log(`  -H "Origin: http://localhost:8080" \\`);
  console.log(`  ${SUPABASE_URL}/auth/v1/user`);
}

// Exécution
testAuthCORS()
  .then(() => {
    showCurlExamples();
    console.log('\n✅ Tests Auth CORS terminés');
  })
  .catch(error => {
    console.error('❌ Erreur lors des tests:', error);
    process.exit(1);
  });
