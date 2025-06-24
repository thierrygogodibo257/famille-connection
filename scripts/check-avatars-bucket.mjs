import { createClient } from '@supabase/supabase-js';

// Lire les variables d'environnement depuis le fichier .env
const envContent = await import('fs').then(fs => fs.readFileSync('.env', 'utf8'));
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseServiceKey = envVars.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Variables d\'environnement manquantes');
  console.log('VITE_SUPABASE_URL:', supabaseUrl);
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseServiceKey ? 'présent' : 'manquant');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAndCreateAvatarsBucket() {
  try {
    console.log('Vérification du bucket avatars...');

    // Lister tous les buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.error('Erreur lors de la liste des buckets:', listError);
      return;
    }

    console.log('Buckets existants:', buckets.map(b => b.name));

    // Vérifier si le bucket avatars existe
    const avatarsBucket = buckets.find(b => b.name === 'avatars');

    if (!avatarsBucket) {
      console.log('Bucket avatars non trouvé, création...');

      const { data: newBucket, error: createError } = await supabase.storage.createBucket('avatars', {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB
      });

      if (createError) {
        console.error('Erreur lors de la création du bucket:', createError);
        return;
      }

      console.log('Bucket avatars créé avec succès:', newBucket);
    } else {
      console.log('Bucket avatars existe déjà');
    }

    // Vérifier les politiques RLS du bucket
    console.log('Vérification des politiques RLS...');

    // Politique pour permettre l'upload d'avatars
    const { error: uploadPolicyError } = await supabase.storage.from('avatars').createSignedUploadUrl('test.txt');
    if (uploadPolicyError) {
      console.log('Politique d\'upload manquante, création...');
      // Note: Les politiques RLS doivent être créées via SQL
      console.log('Veuillez exécuter les commandes SQL suivantes dans votre dashboard Supabase:');
      console.log(`
        -- Politique pour permettre l'upload d'avatars
        CREATE POLICY "Users can upload avatars" ON storage.objects
        FOR INSERT WITH CHECK (
          bucket_id = 'avatars' AND
          auth.uid()::text = (storage.foldername(name))[1]
        );

        -- Politique pour permettre la lecture d'avatars
        CREATE POLICY "Anyone can view avatars" ON storage.objects
        FOR SELECT USING (bucket_id = 'avatars');

        -- Politique pour permettre la mise à jour d'avatars
        CREATE POLICY "Users can update their avatars" ON storage.objects
        FOR UPDATE USING (
          bucket_id = 'avatars' AND
          auth.uid()::text = (storage.foldername(name))[1]
        );

        -- Politique pour permettre la suppression d'avatars
        CREATE POLICY "Users can delete their avatars" ON storage.objects
        FOR DELETE USING (
          bucket_id = 'avatars' AND
          auth.uid()::text = (storage.foldername(name))[1]
        );
      `);
    }

  } catch (error) {
    console.error('Erreur:', error);
  }
}

checkAndCreateAvatarsBucket();
