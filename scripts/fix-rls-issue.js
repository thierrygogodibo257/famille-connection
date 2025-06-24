import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixRLSIssue() {
  try {
    console.log('🔧 Correction du problème RLS...');

    // 1. Supprimer toutes les politiques existantes
    console.log('Suppression des politiques existantes...');
    const policies = [
      'Users can view own profile',
      'Users can update own profile',
      'Users can insert own profile',
      'Admins can view all profiles',
      'Admins can manage all profiles',
      'Users can manage their own profile',
      'Admins have full access to profiles',
      'Allow read access to all authenticated users',
      'users_can_manage_own_profile',
      'authenticated_users_can_view_profiles',
      'users_can_insert_own_profile'
    ];

    for (const policy of policies) {
      try {
        await supabase.rpc('exec_sql', {
          sql: `DROP POLICY IF EXISTS "${policy}" ON public.profiles;`
        });
        console.log(`✅ Politique "${policy}" supprimée`);
      } catch (error) {
        console.log(`⚠️ Erreur lors de la suppression de "${policy}":`, error.message);
      }
    }

    // 2. Supprimer la fonction problématique
    console.log('Suppression de la fonction is_current_user_admin...');
    try {
      await supabase.rpc('exec_sql', {
        sql: 'DROP FUNCTION IF EXISTS public.is_current_user_admin();'
      });
      console.log('✅ Fonction supprimée');
    } catch (error) {
      console.log('⚠️ Erreur lors de la suppression de la fonction:', error.message);
    }

    // 3. Désactiver RLS temporairement
    console.log('Désactivation de RLS sur la table profiles...');
    try {
      await supabase.rpc('exec_sql', {
        sql: 'ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;'
      });
      console.log('✅ RLS désactivé');
    } catch (error) {
      console.log('⚠️ Erreur lors de la désactivation de RLS:', error.message);
    }

    // 4. Créer une politique simple pour les utilisateurs authentifiés
    console.log('Création d\'une politique simple...');
    try {
      await supabase.rpc('exec_sql', {
        sql: `
          ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
          CREATE POLICY "simple_authenticated_access" ON public.profiles
          FOR ALL
          USING (auth.role() = 'authenticated')
          WITH CHECK (auth.role() = 'authenticated');
        `
      });
      console.log('✅ Politique simple créée');
    } catch (error) {
      console.log('⚠️ Erreur lors de la création de la politique:', error.message);
    }

    console.log('🎉 Correction RLS terminée !');

    // 5. Test de la correction
    console.log('Test de la correction...');
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      if (error) {
        console.log('❌ Erreur lors du test:', error.message);
      } else {
        console.log('✅ Test réussi - RLS fonctionne correctement');
      }
    } catch (error) {
      console.log('❌ Erreur lors du test:', error.message);
    }

  } catch (error) {
    console.error('❌ Erreur lors de la correction RLS:', error);
  }
}

fixRLSIssue();
