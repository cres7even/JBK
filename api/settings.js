const { supabase, json, readBody } = require('./_lib');

module.exports = async (req, res) => {
  // ---------- GET = read settings ----------
  if (req.method === 'GET') {
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
  }

  // ---------- PUT = update admin or prices ----------
  if (req.method === 'PUT') {
    const body = await readBody(req);

    // Prices path (has mixPlatePrice or mixPlatePooriPrice field)
    if (body.mixPlatePrice !== undefined || body.mixPlatePooriPrice !== undefined) {
      const update = {};
      if (body.mixPlatePrice !== undefined) update.mix_plate_price = body.mixPlatePrice;
      if (body.mixPlatePooriPrice !== undefined) update.mix_plate_poori_price = body.mixPlatePooriPrice;

      const { error } = await supabase.from('settings').update(update).eq('id', 1);
      if (error) return json(res, 500, { error: error.message });
      return json(res, 200, { success: true });
    }

    // Admin path (has oldPassword)
    const { oldPassword, username, newPassword } = body;

    const { data, error } = await supabase
      .from('settings').select('admin_password').eq('id', 1).single();
    if (error || !data) return json(res, 500, { success: false, message: 'Settings missing' });
    if (!oldPassword || oldPassword !== data.admin_password) {
      return json(res, 401, { success: false, message: 'Current password is incorrect' });
    }

    const update = {};
    if (username) update.admin_username = username;
    if (newPassword) {
      if (newPassword.length < 4) {
        return json(res, 400, { success: false, message: 'Password must be at least 4 characters' });
      }
      update.admin_password = newPassword;
    }
    const { error: upErr } = await supabase.from('settings').update(update).eq('id', 1);
    if (upErr) return json(res, 500, { success: false, message: upErr.message });
    return json(res, 200, { success: true, message: 'Credentials updated successfully' });
  }

  return json(res, 405, { error: 'Method not allowed' });
};