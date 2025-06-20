#!/usr/bin/env node

/**
 * Script de test CORS pour les Edge Functions Supabase
 * Usage: node scripts/test-cors.js
 */

import fetch from 'node-fetch';

// Configuration
const SUPABASE_URL = 'https://rrlixvlwsaeaugudwbiw.supabase.co';
const ADMIN_SECRET = '1432';

// En-têtes de test
const testHeaders = {
  'Content-Type': 'application/json',
  'x-admin-secret': ADMIN_SECRET,
};

// Tests CORS
const corsTests = [
  {
    name: 'Test OPTIONS preflight - delete_all_users',
    url: `${SUPABASE_URL}/functions/v1/delete_all_users`,
    method: 'OPTIONS',
    headers: {
      'Origin': 'https://localhost:5173',
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'authorization,content-type,x-admin-secret',
    },
  },
  {
    name: 'Test OPTIONS preflight - delete_user',
    url: `${SUPABASE_URL}/functions/v1/delete_user`,
    method: 'OPTIONS',
    headers: {
      'Origin': 'https://localhost:5173',
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'authorization,content-type,x-admin-secret',
    },
  },
  {
    name: 'Test OPTIONS preflight - profiles',
    url: `${SUPABASE_URL}/functions/v1/profiles`,
    method: 'OPTIONS',
    headers: {
      'Origin': 'https://localhost:5173',
      'Access-Control-Request-Method': 'GET',
      'Access-Control-Request-Headers': 'authorization,content-type',
    },
  },
];

// Tests de fonctionnalité (sans exécution réelle)
const functionalTests = [
  {
    name: 'Test GET profiles (sans auth)',
    url: `${SUPABASE_URL}/functions/v1/profiles`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  },
];

async function testCORS() {
  console.log('Testing CORS configuration...');

  try {
    // Test 1: OPTIONS request (preflight)
    console.log('\n1. Testing OPTIONS request...');
    const optionsResponse = await fetch(`${SUPABASE_URL}/functions/v1/delete_all_users`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:8080',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type,x-admin-secret'
      }
    });

    console.log('OPTIONS Status:', optionsResponse.status);
    console.log('OPTIONS Headers:', Object.fromEntries(optionsResponse.headers.entries()));

    // Test 2: POST request
    console.log('\n2. Testing POST request...');
    const postResponse = await fetch(`${SUPABASE_URL}/functions/v1/delete_all_users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-secret': ADMIN_SECRET,
        'Origin': 'http://localhost:8080'
      },
      body: JSON.stringify({ password: ADMIN_SECRET })
    });

    console.log('POST Status:', postResponse.status);
    console.log('POST Headers:', Object.fromEntries(postResponse.headers.entries()));

    if (postResponse.ok) {
      const result = await postResponse.json();
      console.log('POST Response:', result);
    } else {
      const error = await postResponse.text();
      console.log('POST Error:', error);
    }

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Test avec curl (pour référence)
function showCurlExamples() {
  console.log('\n🔧 Exemples curl pour tests manuels:');
  console.log('\n# Test preflight OPTIONS');
  console.log(`curl -X OPTIONS \\`);
  console.log(`  -H "Origin: https://localhost:5173" \\`);
  console.log(`  -H "Access-Control-Request-Method: POST" \\`);
  console.log(`  -H "Access-Control-Request-Headers: authorization,content-type,x-admin-secret" \\`);
  console.log(`  ${SUPABASE_URL}/functions/v1/delete_all_users`);

  console.log('\n# Test fonctionnel (avec secret)');
  console.log(`curl -X POST \\`);
  console.log(`  -H "Content-Type: application/json" \\`);
  console.log(`  -H "x-admin-secret: ${ADMIN_SECRET}" \\`);
  console.log(`  ${SUPABASE_URL}/functions/v1/delete_all_users`);
}

// Exécution
if (require.main === module) {
  testCORS()
    .then(() => {
      showCurlExamples();
      console.log('\n✅ Tests CORS terminés');
    })
    .catch(error => {
      console.error('❌ Erreur lors des tests:', error);
      process.exit(1);
    });
}

export { testCORS, showCurlExamples };
