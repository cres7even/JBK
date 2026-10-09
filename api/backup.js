const { supabase, json } = require('./_lib');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return json(res, 405, { error: 'Method not allowed' });

  const date = req.query.date;
  if (!date) return json(res, 400, { error: 'Missing date' });

  const { data, error } = await supabase
    .from('orders').select('*').eq('date', date);

  if (error) return json(res, 500, { error: error.message });

  const active = data.filter(o => !o.cancelled);
  const totalSales = active.reduce((s, o) => s + o.total, 0);
  const cashSales = active.filter(o => o.payment === 'Cash').reduce((s, o) => s + o.total, 0);
  const upiSales = active.filter(o => o.payment === 'UPI').reduce((s, o) => s + o.total, 0);

  const itemAgg = {};
  active.forEach(order => {
    (order.items || []).forEach(item => {
      if (!itemAgg[item.name]) itemAgg[item.name] = { name: item.name, quantity: 0, revenue: 0 };
      itemAgg[item.name].quantity += item.quantity;
      itemAgg[item.name].revenue += item.price * item.quantity;
    });
  });

  return json(res, 200, {
    date, totalOrders: active.length, totalSales, cashSales, upiSales,
    items: Object.values(itemAgg), orders: active
  });
};