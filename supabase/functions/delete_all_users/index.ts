
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-secret',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Check admin secret
    const adminSecret = req.headers.get('x-admin-secret')
    const expectedSecret = Deno.env.get('ADMIN_SECRET') || '1432' // Default secret

    if (adminSecret !== expectedSecret) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid admin secret' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Create a Supabase client with service role key for admin operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Only allow POST method
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Starting deletion of all data...')

    // Delete all data in the correct order to respect foreign key constraints

    // 1. Delete family relations
    const { error: relationsError } = await supabaseClient
      .from('family_relations')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all except dummy record

    if (relationsError) {
      console.error('Error deleting family relations:', relationsError)
    }

    // 2. Delete relationships
    const { error: relationshipsError } = await supabaseClient
      .from('relationships')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')

    if (relationshipsError) {
      console.error('Error deleting relationships:', relationshipsError)
    }

    // 3. Delete family members
    const { error: membersError } = await supabaseClient
      .from('family_members')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')

    if (membersError) {
      console.error('Error deleting family members:', membersError)
    }

    // 4. Delete join requests
    const { error: requestsError } = await supabaseClient
      .from('join_requests')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')

    if (requestsError) {
      console.error('Error deleting join requests:', requestsError)
    }

    // 5. Delete family trees
    const { error: treesError } = await supabaseClient
      .from('family_trees')
      .delete()
      .neq('id', 0)

    if (treesError) {
      console.error('Error deleting family trees:', treesError)
    }

    // 6. Delete messages
    const { error: messagesError } = await supabaseClient
      .from('messages')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')

    if (messagesError) {
      console.error('Error deleting messages:', messagesError)
    }

    // 7. Delete notifications
    const { error: notificationsError } = await supabaseClient
      .from('notifications')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')

    if (notificationsError) {
      console.error('Error deleting notifications:', notificationsError)
    }

    // 8. Delete profiles
    const { error: profilesError } = await supabaseClient
      .from('profiles')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')

    if (profilesError) {
      console.error('Error deleting profiles:', profilesError)
    }

    // 9. Get all auth users and delete them
    const { data: { users }, error: authUsersError } = await supabaseClient.auth.admin.listUsers()

    if (authUsersError) {
      console.error('Error listing auth users:', authUsersError)
    }

    let deletedCount = 0;
    // Delete each auth user
    if (users) {
      for (const user of users) {
        const { error: deleteUserError } = await supabaseClient.auth.admin.deleteUser(user.id)
        if (deleteUserError) {
          console.error(`Error deleting auth user ${user.id}:`, deleteUserError)
        } else {
          deletedCount++;
        }
      }
    }

    console.log('All data deletion completed successfully')

    return new Response(
      JSON.stringify({
        success: true,
        message: 'All users, profiles, and related data have been deleted successfully',
        deletedUsers: deletedCount
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
