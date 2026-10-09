const { supabase, json, getISTTimeString } = require('./_lib');

module.exports = async (req, res) => {
  if (req.method !== 'PUT') return json(res, 405, { error: 'Method not allowed' });

  const token = parseInt(req.query.token, 10);
  if (!token) return json(res, 400, { error: 'Missing token' });

  const now = getISTTimeString();
  const { data, error } = await supabase
    .from('orders')
    .update({ cancelled: true, cancelled_at: now, updated_at: now })
    .eq('token', token).select().single();

  if (error) return json(res, 500, { error: error.message });
  return json(res, 200, { token: data.token, cancelled: data.cancelled, cancelledAt: data.cancelled_at });
};