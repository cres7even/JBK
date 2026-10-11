const { supabase, json } = require('./_lib');

module.exports = async (req, res) => {
  if (req.method !== 'PUT') return json(res, 405, { error: 'Method not allowed' });

  const id = req.query.id || (req.url.split('/').pop() || '').split('?')[0];
  if (!id) return json(res, 400, { error: 'Missing item id' });

  const { error } = await supabase
    .from('menu_items')
    .update({ active: false, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) return json(res, 500, { error: error.message });
  return json(res, 200, { success: true });
};