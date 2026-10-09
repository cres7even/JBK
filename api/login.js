const { supabase, json, readBody } = require('./_lib');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });

  const { username, password } = await readBody(req);

  const { data, error } = await supabase
    .from('settings')
    .select('admin_username, admin_password')
    .eq('id', 1)
    .single();

  if (error || !data) return json(res, 500, { success: false, message: 'Settings missing' });

  if (username === data.admin_username && password === data.admin_password) {
    return json(res, 200, { success: true, username });
  }
  return json(res, 401, { success: false, message: 'Invalid credentials' });
};