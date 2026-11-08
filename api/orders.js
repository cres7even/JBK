const { supabase, json, readBody, getISTDateString, getISTTimeString, rowToOrder } = require('./_lib');

module.exports = async (req, res) => {
  // 1. GET ALL ORDERS
  if (req.method === 'GET') {
    const { data, error } = await supabase.from('orders').select('*').order('token', { ascending: true });
    if (error) return json(res, 500, { error: error.message });
    return json(res, 200, data.map(rowToOrder));
  }

  // 2. POST NEW ORDER (Punch)
  if (req.method === 'POST') {
    const { items, payment, customer } = await readBody(req);
    if (!items || items.length === 0) return json(res, 400, { error: 'No items in order' });

    const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const today = getISTDateString();
    const now = getISTTimeString();

    const { data: maxRows } = await supabase.from('orders').select('token').eq('date', today).order('token', { ascending: false }).limit(1);
    const token = maxRows && maxRows[0] ? maxRows[0].token + 1 : 1;

    const order = {
      token, date: today, created_at: now, updated_at: now,
      customer: customer || 'Walk-in', items, payment: payment || 'Cash', total,
      cancelled: false, cancelled_at: null
    };

    const { error } = await supabase.from('orders').insert(order);
    if (error) return json(res, 500, { error: error.message });
    return json(res, 201, rowToOrder(order));
  }

  // 3. PUT (For Edit and Cancel)
  if (req.method === 'PUT') {
    const token = parseInt(req.query.token, 10);
    const date = req.query.date;
    if (!token || !date) return json(res, 400, { error: 'Missing token or date' });

    const now = getISTTimeString();

    // If the request says action=cancel, we do the cancel logic
    if (req.query.action === 'cancel') {
      const { data, error } = await supabase.from('orders')
        .update({ cancelled: true, cancelled_at: now, updated_at: now })
        .eq('token', token).eq('date', date).select().single();
      
      if (error) return json(res, 500, { error: error.message });
      return json(res, 200, { token: data.token, cancelled: data.cancelled, cancelledAt: data.cancelled_at });
    }

    // Otherwise, it's an Edit (update items)
    const { items, payment } = await readBody(req);
    if (!items || items.length === 0) return json(res, 400, { error: 'No items' });

    const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const update = { items, total, updated_at: now };
    if (payment) update.payment = payment;

    const { data, error } = await supabase.from('orders')
      .update(update).eq('token', token).eq('date', date).select().single();
      
    if (error) return json(res, 500, { error: error.message });
    return json(res, 200, rowToOrder(data));
  }

  return json(res, 405, { error: 'Method not allowed' });
};