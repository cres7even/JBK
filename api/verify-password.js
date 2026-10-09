const { supabase, json, readBody } = require('./_lib');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });

  const { password } = await readBody(req);

  const { data, error } = await supabase
    .from('settings')
    .select('admin_password')
    .eq('id', 1)
    .single();

  if (error || !data) return json(res, 500, { success: false });

  if (password === data.admin_password) return json(res, 200, { success: true });
  return json(res, 401, { success: false, message: 'Invalid password' });
};