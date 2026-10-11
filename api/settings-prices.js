const { supabase, json, readBody } = require('./_lib');

module.exports = async (req, res) => {
  if (req.method !== 'PUT') return json(res, 405, { error: 'Method not allowed' });

  const { mixPlatePrice, mixPlatePooriPrice } = await readBody(req);

  const update = {};
  if (mixPlatePrice !== undefined) update.mix_plate_price = mixPlatePrice;
  if (mixPlatePooriPrice !== undefined) update.mix_plate_poori_price = mixPlatePooriPrice;

  if (Object.keys(update).length === 0) {
    return json(res, 400, { error: 'No fields to update' });
  }

  const { error } = await supabase.from('settings').update(update).eq('id', 1);
  if (error) return json(res, 500, { error: error.message });
  return json(res, 200, { success: true });
};