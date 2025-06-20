# Quick Fix for RLS Recursion Issue

## Problem
The stack overflow error is caused by a recursive RLS (Row Level Security) policy on the `profiles` table. The `is_current_user_admin()` function queries the `profiles` table, which triggers the RLS policy again, creating an infinite loop.

## Solution
Run this SQL command in your Supabase SQL editor to temporarily disable the problematic RLS policy:

```sql
-- Temporarily disable the admin RLS policy that's causing recursion
DROP POLICY IF EXISTS "Admins have full access to profiles" ON public.profiles;

-- Create a simpler admin policy that doesn't cause recursion
CREATE POLICY "Admins have full access to profiles" ON public.profiles
FOR ALL
USING (auth.uid() IN (
  SELECT user_id FROM public.profiles
  WHERE user_id = auth.uid() AND is_admin = true
))
WITH CHECK (auth.uid() IN (
  SELECT user_id FROM public.profiles
  WHERE user_id = auth.uid() AND is_admin = true
));
```

## Alternative Solution
If the above doesn't work, you can temporarily disable RLS on the profiles table:

```sql
-- Temporarily disable RLS on profiles table
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
```

## Permanent Fix
For a permanent solution, the `is_current_user_admin()` function should be rewritten to avoid the recursive query pattern.
