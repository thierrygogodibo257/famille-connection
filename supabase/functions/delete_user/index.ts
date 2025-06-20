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
    const expectedSecret = Deno.env.get('ADMIN_SECRET') || '1432'

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

    // Get user ID from request body
    const { userId } = await req.json()

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log(`Starting deletion of user ${userId} and all related data...`)

    // Delete data in the correct order to respect foreign key constraints

    // 1. Delete family relations where user is involved
    const { error: relationsError } = await supabaseClient
      .from('family_relations')
      .delete()
      .or(`member1_id.eq.${userId},member2_id.eq.${userId}`)

    if (relationsError) {
      console.error('Error deleting family relations:', relationsError)
      return new Response(
        JSON.stringify({ error: `Failed to delete family relations: ${relationsError.message}` }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // 2. Delete relationships where user is involved
    const { error: relationshipsError } = await supabaseClient
      .from('relationships')
      .delete()
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)

    if (relationshipsError) {
      console.error('Error deleting relationships:', relationshipsError)
      return new Response(
        JSON.stringify({ error: `Failed to delete relationships: ${relationshipsError.message}` }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // 3. Delete family members where user is the member
    const { error: membersError } = await supabaseClient
      .from('family_members')
      .delete()
      .eq('user_id', userId)

    if (membersError) {
      console.error('Error deleting family members:', membersError)
      return new Response(
        JSON.stringify({ error: `Failed to delete family members: ${membersError.message}` }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // 4. Delete join requests from this user
    const { error: requestsError } = await supabaseClient
      .from('join_requests')
      .delete()
      .eq('user_id', userId)

    if (requestsError) {
      console.error('Error deleting join requests:', requestsError)
      return new Response(
        JSON.stringify({ error: `Failed to delete join requests: ${requestsError.message}` }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // 5. Delete messages from/to this user
    const { error: messagesError } = await supabaseClient
      .from('messages')
      .delete()
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)

    if (messagesError) {
      console.error('Error deleting messages:', messagesError)
      return new Response(
        JSON.stringify({ error: `Failed to delete messages: ${messagesError.message}` }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // 6. Delete notifications for this user
    const { error: notificationsError } = await supabaseClient
      .from('notifications')
      .delete()
      .eq('user_id', userId)

    if (notificationsError) {
      console.error('Error deleting notifications:', notificationsError)
      return new Response(
        JSON.stringify({ error: `Failed to delete notifications: ${notificationsError.message}` }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // 7. Delete profile
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (profileError) {
      console.error('Error deleting profile:', profileError)
      return new Response(
        JSON.stringify({ error: `Failed to delete profile: ${profileError.message}` }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // 8. Delete auth user
    const { error: deleteUserError } = await supabaseClient.auth.admin.deleteUser(userId)

    if (deleteUserError) {
      console.error('Error deleting auth user:', deleteUserError)
      return new Response(
        JSON.stringify({ error: `Failed to delete auth user: ${deleteUserError.message}` }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log(`User ${userId} and all related data deleted successfully`)

    return new Response(
      JSON.stringify({
        success: true,
        message: `User ${userId} and all related data have been deleted successfully`
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
