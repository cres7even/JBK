const { supabase, json } = require('./_lib');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return json(res, 405, { error: 'Method not allowed' });

  const { data, error } = await supabase
    .from('settings').select('admin_username').eq('id', 1).single();

  if (error) return json(res, 500, { error: error.message });
  return json(res, 200, { adminUsername: data.admin_username });
};