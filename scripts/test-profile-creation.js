import { createClient } from '@supabase/supabase-js';

// Configuration Supabase - Utilisez votre vraie clé API
const supabaseUrl = 'https://aaxfvyorhasbwlaovrdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFheGZ2eW9yaGFzYndsYW92cmRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE5NzE5NzQsImV4cCI6MjA0NzU0Nzk3NH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCreateProfile() {
  console.log('🧪 Test de création de profil...');

  try {
    // Données de test
    const testProfile = {
      id: 'test-user-' + Date.now(),
      user_id: 'test-user-' + Date.now(),
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User',
      phone: '+22512345678',
      profession: 'Testeur',
      current_location: 'Test City',
      birth_place: 'Test Birth',
      avatar_url: '',
      photo_url: '',
      relationship_type: 'fils',
      father_name: 'Test Father',
      mother_name: 'Test Mother',
      is_admin: false,
      birth_date: null,
      title: 'Fils',
      situation: '',
      is_patriarch: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log('📝 Données de test:', testProfile);

    // Test d'insertion directe
    const { data, error } = await supabase
      .from('profiles')
      .insert([testProfile])
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur lors de la création:', error);
      return;
    }

    console.log('✅ Profil créé avec succès:', data);

    // Nettoyage - supprimer le profil de test
    const { error: deleteError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', testProfile.id);

    if (deleteError) {
      console.error('⚠️ Erreur lors du nettoyage:', deleteError);
    } else {
      console.log('🧹 Profil de test supprimé');
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le test
testCreateProfile();
