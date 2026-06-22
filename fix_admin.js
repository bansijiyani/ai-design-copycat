import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function fix() {
  const { data: { users } } = await supabase.auth.admin.listUsers();
  
  // Upgrade bansrijiyani07@gmail.com to admin
  const user = users.find(u => u.email === 'bansrijiyani07@gmail.com');
  if (!user) return console.log('User not found');

  // First delete any existing customer role to avoid conflict
  await supabase.from('user_roles').delete().eq('user_id', user.id);
  
  // Insert admin role
  const { error } = await supabase.from('user_roles').insert({ user_id: user.id, role: 'admin' });
  if (error) console.error(error);
  else console.log('✅ Successfully upgraded bansrijiyani07@gmail.com to Admin!');
}
fix();
