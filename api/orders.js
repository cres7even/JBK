const { supabase, json, readBody, getISTTimeString, rowToOrder } = require('./_lib');

module.exports = async (req, res) => {
  if (req.method !== 'PUT') return json(res, 405, { error: 'Method not allowed' });

  const token = parseInt(req.query.token, 10);
  if (!token) return json(res, 400, { error: 'Missing token' });

  const isCancel = req.url.includes('/cancel');

  if (isCancel) {
    const now = getISTTimeString();
    const { data, error } = await supabase
      .from('orders')
      .update({ cancelled: true, cancelled_at: now, updated_at: now })
      .eq('token', token).select().single();
    if (error) return json(res, 500, { error: error.message });
    return json(res, 200, { token: data.token, cancelled: data.cancelled, cancelledAt: data.cancelled_at });
  }

  const { items, payment } = await readBody(req);
  if (!items || items.length === 0) return json(res, 400, { error: 'No items' });

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const update = { items, total, updated_at: getISTTimeString() };
  if (payment) update.payment = payment;

  const { data, error } = await supabase
    .from('orders').update(update).eq('token', token).select().single();
  if (error) return json(res, 500, { error: error.message });
  return json(res, 200, rowToOrder(data));
};