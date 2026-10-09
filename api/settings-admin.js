const { supabase, json, readBody } = require('./_lib');

module.exports = async (req, res) => {
  if (req.method !== 'PUT') return json(res, 405, { error: 'Method not allowed' });

  const { oldPassword, username, newPassword } = await readBody(req);

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
};