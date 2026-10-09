const { supabase, json, getISTDateString, rowToOrder } = require('./_lib');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return json(res, 405, { error: 'Method not allowed' });

  const today = getISTDateString();
  const { data, error } = await supabase
    .from('orders').select('*').eq('date', today).order('token', { ascending: true });

  if (error) return json(res, 500, { error: error.message });
  return json(res, 200, data.map(rowToOrder));
};