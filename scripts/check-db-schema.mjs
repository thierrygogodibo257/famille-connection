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

async function checkDatabaseSchema() {
  try {
    console.log('🔍 Vérification du schéma de la base de données...');

    // 1. Vérifier la structure de la table profiles
    console.log('\n1. Structure de la table profiles:');
    const { data: tableInfo, error: tableError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length
        FROM information_schema.columns
        WHERE table_name = 'profiles'
        AND table_schema = 'public'
        ORDER BY ordinal_position;
      `
    });

    if (tableError) {
      console.error('❌ Erreur lors de la vérification de la table:', tableError);
    } else {
      console.table(tableInfo);
    }

    // 2. Vérifier les contraintes
    console.log('\n2. Contraintes de la table profiles:');
    const { data: constraints, error: constraintsError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT
          constraint_name,
          constraint_type,
          table_name
        FROM information_schema.table_constraints
        WHERE table_name = 'profiles'
        AND table_schema = 'public';
      `
    });

    if (constraintsError) {
      console.error('❌ Erreur lors de la vérification des contraintes:', constraintsError);
    } else {
      console.table(constraints);
    }

    // 3. Vérifier les politiques RLS
    console.log('\n3. Politiques RLS sur profiles:');
    const { data: policies, error: policiesError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT
          policyname,
          permissive,
          roles,
          cmd,
          qual,
          with_check
        FROM pg_policies
        WHERE tablename = 'profiles'
        AND schemaname = 'public';
      `
    });

    if (policiesError) {
      console.error('❌ Erreur lors de la vérification des politiques:', policiesError);
    } else {
      console.table(policies);
    }

    // 4. Tester une insertion simple
    console.log('\n4. Test d\'insertion simple:');
    try {
      const testData = {
        user_id: '00000000-0000-0000-0000-000000000000', // UUID de test
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User'
      };

      const { data: insertResult, error: insertError } = await supabase
        .from('profiles')
        .insert(testData)
        .select()
        .single();

      if (insertError) {
        console.error('❌ Erreur lors du test d\'insertion:', insertError);
      } else {
        console.log('✅ Test d\'insertion réussi:', insertResult);

        // Nettoyer le test
        await supabase
          .from('profiles')
          .delete()
          .eq('email', 'test@example.com');
        console.log('🧹 Données de test nettoyées');
      }
    } catch (error) {
      console.error('❌ Erreur lors du test d\'insertion:', error);
    }

  } catch (error) {
    console.error('❌ Erreur lors de la vérification du schéma:', error);
  }
}

checkDatabaseSchema();
