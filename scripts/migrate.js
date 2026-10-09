const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_KEY;
if (!url || !key) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_KEY env vars first.');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });
const dbPath = path.join(__dirname, '..', 'db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

(async () => {
  console.log('Migrating menu_items...');
  const menuRows = [];
  let order = 0;
  for (const cat of ['general', 'dosa', 'beverages']) {
    for (const item of (db.menu[cat] || [])) {
      menuRows.push({
        id: item.id, name: item.name, price: item.price || 0,
        emoji: item.emoji || '', half_plate: !!item.halfPlate,
        half_price: item.halfPrice || 0, half_pieces: item.halfPieces || '',
        full_pieces: item.fullPieces || '', mix_eligible: !!item.mixEligible,
        category: cat, sort_order: order++
      });
    }
  }
  const { error: menuErr } = await supabase.from('menu_items').upsert(menuRows);
  if (menuErr) { console.error('Menu error:', menuErr); process.exit(1); }
  console.log(`  OK - ${menuRows.length} menu items`);

  console.log('Migrating orders...');
  if (db.orders && db.orders.length) {
    const orderRows = db.orders.map(o => ({
      token: o.token, date: o.date, created_at: o.createdAt,
      updated_at: o.updatedAt, customer: o.customer || 'Walk-in',
      items: o.items, payment: o.payment || 'Cash', total: o.total,
      cancelled: !!o.cancelled, cancelled_at: o.cancelledAt || null
    }));
    const { error: ordErr } = await supabase.from('orders').upsert(orderRows);
    if (ordErr) { console.error('Order error:', ordErr); process.exit(1); }
    console.log(`  OK - ${orderRows.length} orders`);
  } else {
    console.log('  (no orders)');
  }

  console.log('Migrating settings...');
  const { error: setErr } = await supabase.from('settings').update({
    admin_username: db.settings.adminUsername,
    admin_password: db.settings.adminPassword
  }).eq('id', 1);
  if (setErr) { console.error('Settings error:', setErr); process.exit(1); }
  console.log('  OK - settings');

  console.log('');
  console.log('Migration complete.');
})();