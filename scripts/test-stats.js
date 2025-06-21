import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://aaxfvyorhasbwlaovrdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFheGZ2eW9yaGFzYndsYW92cmRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE5NzE5NzQsImV4cCI6MjA0NzU0Nzk3NH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testStats() {
  console.log('🧪 Test des statistiques de la famille...');

  try {
    // 1. Récupérer tous les profils
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*');

    if (error) {
      console.error('❌ Erreur lors de la récupération des profils:', error);
      return;
    }

    console.log(`📊 Nombre total de profils: ${profiles.length}`);
    console.log('📋 Profils:', profiles.map(p => ({
      id: p.id,
      name: `${p.first_name} ${p.last_name}`,
      title: p.title,
      is_admin: p.is_admin,
      is_patriarch: p.is_patriarch
    })));

    // 2. Calculer les statistiques manuellement
    const totalMembers = profiles.length;
    const patriarchs = profiles.filter(p => p.is_patriarch || p.title?.toLowerCase().includes('patriarche')).length;
    const matriarchs = profiles.filter(p => p.title?.toLowerCase().includes('matriarche')).length;
    const admins = profiles.filter(p => p.is_admin).length;

    console.log('\n📈 Statistiques calculées:');
    console.log(`- Membres totaux: ${totalMembers}`);
    console.log(`- Patriarches: ${patriarchs}`);
    console.log(`- Matriarches: ${matriarchs}`);
    console.log(`- Administrateurs: ${admins}`);

    // 3. Vérifier les relations
    const withFather = profiles.filter(p => p.father_name).length;
    const withMother = profiles.filter(p => p.mother_name).length;
    const connected = profiles.filter(p => p.father_name || p.mother_name).length;
    const isolated = profiles.filter(p => !p.father_name && !p.mother_name).length;

    console.log('\n🔗 Relations:');
    console.log(`- Avec père: ${withFather}`);
    console.log(`- Avec mère: ${withMother}`);
    console.log(`- Connectés: ${connected}`);
    console.log(`- Isolés: ${isolated}`);

    // 4. Vérifier les localisations
    const locations = {};
    profiles.forEach(p => {
      if (p.current_location) {
        const location = p.current_location.trim();
        if (location) {
          locations[location] = (locations[location] || 0) + 1;
        }
      }
    });

    console.log('\n📍 Localisations:', locations);

    // 5. Vérifier les types de relations
    const relationships = {};
    profiles.forEach(p => {
      const relationship = p.relationship_type || 'Non spécifié';
      relationships[relationship] = (relationships[relationship] || 0) + 1;
    });

    console.log('\n👥 Types de relations:', relationships);

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le test
testStats();
