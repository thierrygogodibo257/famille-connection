import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, range',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Expose-Headers': 'content-length, content-range',
  'Content-Type': 'application/json'
};

// Fonction pour trouver ou créer l'arbre familial
async function getOrCreateFamilyTree(supabase: SupabaseClient) {
  // 1. Essayer de trouver un arbre existant
  let { data: tree, error: treeError } = await supabase
    .from('family_trees')
    .select('id')
    .limit(1)
    .single();

  if (treeError && treeError.code !== 'PGRST116') { // PGRST116 = 0 rows
    throw new Error(`Erreur lors de la recherche de l'arbre: ${treeError.message}`);
  }

  // 2. S'il n'y a pas d'arbre, en créer un
  if (!tree) {
    console.log("Aucun arbre trouvé, création d'un nouvel arbre...");
    const { data: newTree, error: newTreeError } = await supabase
      .from('family_trees')
      .insert({ name: 'Famille Gogos', created_by: null }) // Mettre un `created_by` si possible
      .select('id')
      .single();

    if (newTreeError) {
      throw new Error(`Erreur lors de la création de l'arbre: ${newTreeError.message}`);
    }
    console.log("Nouvel arbre créé avec l'ID:", newTree.id);
    return newTree;
  }

  console.log("Arbre existant trouvé avec l'ID:", tree.id);
  return tree;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log('Données reçues pour création de profil:', body);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Étape 1: Créer le profil dans la table 'profiles'
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: body.user_id,
        email: body.email,
        first_name: body.first_name,
        last_name: body.last_name,
        avatar_url: body.avatar_url,
        phone: body.phone,
        current_location: body.current_location,
        birth_place: body.birth_place,
        relationship_type: body.relationship_type,
        father_id: body.father_id,
        mother_id: body.mother_id,
        is_admin: body.is_admin,
        birth_date: body.birth_date,
        civilite: body.civilite,
        situation: body.situation,
        is_patriarch: body.is_patriarch,
      })
      .select()
      .single();

    if (profileError) {
      console.error('Erreur Supabase (profiles):', profileError);
      throw profileError;
    }
    console.log('Profil créé avec succès:', profile.id);


    // Étape 2: Récupérer ou créer l'arbre familial
    const familyTree = await getOrCreateFamilyTree(supabase);


    // Étape 3: Lier le profil à l'arbre dans 'family_members'
    // Temporairement désactivé en attendant le déploiement
    /*
    const { error: memberError } = await supabase
      .from('family_members')
      .insert({
        tree_id: familyTree.id,
        profile_id: profile.id,
        role: body.relationship_type,
      });

    if (memberError) {
        console.error("Erreur lors de l'ajout à family_members:", memberError);
        // On pourrait ici décider de supprimer le profil créé pour la cohérence
        await supabase.from('profiles').delete().eq('id', profile.id);
        throw memberError;
    }
    console.log('Membre ajouté à l\'arbre avec succès.');
    */
    console.log('Liaison family_members temporairement désactivée.');

    return new Response(JSON.stringify({ success: true, profile }), {
      status: 201,
      headers: corsHeaders
    });

  } catch (error) {
    console.error('Erreur détaillée dans la fonction:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders
    });
  }
});
