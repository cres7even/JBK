const { supabase, json, readBody, getISTDateString, getISTTimeString, rowToOrder } = require('./_lib');

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('orders').select('*').order('token', { ascending: true });
    if (error) return json(res, 500, { error: error.message });
    return json(res, 200, data.map(rowToOrder));
  }

  if (req.method === 'POST') {
    const { items, payment, customer } = await readBody(req);
    if (!items || items.length === 0) return json(res, 400, { error: 'No items in order' });

    const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

    const { data: maxRows } = await supabase
      .from('orders').select('token').order('token', { ascending: false }).limit(1);
    const token = maxRows && maxRows[0] ? maxRows[0].token + 1 : 1;

    const now = getISTTimeString();
    const order = {
      token,
      date: getISTDateString(),
      created_at: now,
      updated_at: now,
      customer: customer || 'Walk-in',
      items,
      payment: payment || 'Cash',
      total,
      cancelled: false,
      cancelled_at: null
    };

    const { error } = await supabase.from('orders').insert(order);
    if (error) return json(res, 500, { error: error.message });
    return json(res, 201, rowToOrder(order));
  }

  return json(res, 405, { error: 'Method not allowed' });
};