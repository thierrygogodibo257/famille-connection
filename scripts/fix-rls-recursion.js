const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://aaxfvyorhasbwlaovrdf.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY manquant dans les variables d\'environnement');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixRLSRecursion() {
  console.log('🔧 Début de la correction de la récursion RLS...');

  try {
    // 1. Supprimer toutes les politiques existantes
    console.log('📋 Suppression des anciennes politiques...');
    const policiesToDrop = [
      'Users can view own profile',
      'Users can update own profile',
      'Users can insert own profile',
      'Admins can view all profiles',
      'Admins can manage all profiles',
      'Users can manage their own profile',
      'Admins have full access to profiles'
    ];

    for (const policy of policiesToDrop) {
      try {
        await supabase.rpc('drop_policy_if_exists', {
          policy_name: policy,
          table_name: 'profiles'
        });
        console.log(`✅ Politique "${policy}" supprimée`);
      } catch (error) {
        console.log(`⚠️  Politique "${policy}" déjà supprimée ou inexistante`);
      }
    }

    // 2. Supprimer la fonction problématique
    console.log('🗑️  Suppression de la fonction is_current_user_admin...');
    try {
      await supabase.rpc('drop_function_if_exists', {
        function_name: 'is_current_user_admin'
      });
      console.log('✅ Fonction is_current_user_admin supprimée');
    } catch (error) {
      console.log('⚠️  Fonction is_current_user_admin déjà supprimée ou inexistante');
    }

    // 3. Désactiver RLS temporairement
    console.log('🔓 Désactivation temporaire de RLS...');
    await supabase.rpc('alter_table_disable_rls', { table_name: 'profiles' });
    console.log('✅ RLS désactivé');

    // 4. Réactiver RLS avec une politique simple
    console.log('🔒 Réactivation de RLS avec politique simple...');
    await supabase.rpc('alter_table_enable_rls', { table_name: 'profiles' });

    // 5. Créer la nouvelle politique simple
    console.log('📝 Création de la nouvelle politique...');
    await supabase.rpc('create_policy', {
      policy_name: 'Allow authenticated users to access profiles',
      table_name: 'profiles',
      operation: 'ALL',
      using_expression: 'auth.role() = \'authenticated\'',
      with_check_expression: 'auth.role() = \'authenticated\''
    });
    console.log('✅ Nouvelle politique créée');

    // 6. Créer les index pour les performances
    console.log('📊 Création des index...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin)',
      'CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at)'
    ];

    for (const index of indexes) {
      await supabase.rpc('exec_sql', { sql: index });
    }
    console.log('✅ Index créés');

    console.log('🎉 Correction de la récursion RLS terminée avec succès !');
    console.log('📝 La nouvelle politique permet l\'accès à tous les utilisateurs authentifiés');
    console.log('🔒 La vérification admin se fait maintenant côté application');

  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
    process.exit(1);
  }
}

// Exécuter la correction
fixRLSRecursion();
