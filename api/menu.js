const { supabase, json } = require('./_lib');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return json(res, 405, { error: 'Method not allowed' });

  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) return json(res, 500, { error: error.message });

  const menu = { general: [], dosa: [], beverages: [] };
  for (const row of data) {
    const item = {
      id: row.id,
      name: row.name,
      price: row.price,
      emoji: row.emoji || '',
      halfPlate: row.half_plate,
      halfPrice: row.half_price,
      halfPieces: row.half_pieces || '',
      fullPieces: row.full_pieces || '',
      mixEligible: row.mix_eligible
    };
    if (!item.halfPlate) { delete item.halfPieces; delete item.fullPieces; }
    if (!menu[row.category]) menu[row.category] = [];
    menu[row.category].push(item);
  }
  return json(res, 200, menu);
};
