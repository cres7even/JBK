const { supabase, json } = require('./_lib');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return json(res, 405, { error: 'Method not allowed' });

  const { data, error } = await supabase
    .from('settings')
    .select('admin_username, mix_plate_price, mix_plate_poori_price')
    .eq('id', 1)
    .single();

  if (error) return json(res, 500, { error: error.message });
  return json(res, 200, {
    adminUsername: data.admin_username,
    mixPlatePrice: data.mix_plate_price,
    mixPlatePooriPrice: data.mix_plate_poori_price
  });
};