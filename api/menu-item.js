const { supabase, json, readBody } = require('./_lib');

module.exports = async (req, res) => {
  const id = req.query.id || (req.url.split('/').filter(Boolean).pop() || '').split('?')[0];
  const action = req.query.action; // 'create' | 'delete' | undefined

  // ---------- POST = create new item ----------
  if (req.method === 'POST') {
    const body = await readBody(req);
    if (!body.id || !body.name || !body.category) {
      return json(res, 400, { error: 'Missing id, name, or category' });
    }

    const { data: existing } = await supabase
      .from('menu_items').select('id, active').eq('id', body.id).maybeSingle();

    if (existing && existing.active) {
      return json(res, 409, { error: 'Item id already exists' });
    }

    if (existing && !existing.active) {
      const update = {
        name: body.name,
        price: body.price || 0,
        emoji: body.emoji || '',
        half_plate: !!body.halfPlate,
        half_price: body.halfPrice || 0,
        half_pieces: body.halfPieces || '',
        full_pieces: body.fullPieces || '',
        mix_eligible: !!body.mixEligible,
        alt_eligible: !!body.altEligible,
        piece_price: body.piecePrice || 0,
        category: body.category,
        active: true,
        updated_at: new Date().toISOString()
      };
      const { error } = await supabase.from('menu_items').update(update).eq('id', body.id);
      if (error) return json(res, 500, { error: error.message });
      return json(res, 200, { success: true, reactivated: true });
    }

    const { data: maxRows } = await supabase
      .from('menu_items').select('sort_order')
      .order('sort_order', { ascending: false }).limit(1);
    const sortOrder = maxRows && maxRows[0] ? (maxRows[0].sort_order || 0) + 1 : 0;

    const newItem = {
      id: body.id,
      name: body.name,
      price: body.price || 0,
      emoji: body.emoji || '',
      half_plate: !!body.halfPlate,
      half_price: body.halfPrice || 0,
      half_pieces: body.halfPieces || '',
      full_pieces: body.fullPieces || '',
      mix_eligible: !!body.mixEligible,
      alt_eligible: !!body.altEligible,
      piece_price: body.piecePrice || 0,
      category: body.category,
      sort_order: sortOrder,
      active: true
    };

    const { error } = await supabase.from('menu_items').insert(newItem);
    if (error) return json(res, 500, { error: error.message });
    return json(res, 201, { success: true, item: newItem });
  }

  // ---------- PUT = update or soft-delete ----------
  if (req.method === 'PUT') {
    if (!id) return json(res, 400, { error: 'Missing item id' });

    // Soft delete path: PUT /api/menu/item/:id?action=delete
    if (action === 'delete' || req.url.includes('/delete')) {
      const { error } = await supabase
        .from('menu_items')
        .update({ active: false, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) return json(res, 500, { error: error.message });
      return json(res, 200, { success: true });
    }

    // Normal update path
    const body = await readBody(req);
    const update = {};
    if (body.name !== undefined) update.name = body.name;
    if (body.emoji !== undefined) update.emoji = body.emoji;
    if (body.price !== undefined) update.price = body.price;
    if (body.halfPrice !== undefined) update.half_price = body.halfPrice;
    if (body.halfPieces !== undefined) update.half_pieces = body.halfPieces;
    if (body.fullPieces !== undefined) update.full_pieces = body.fullPieces;
    if (body.halfPlate !== undefined) update.half_plate = body.halfPlate;
    if (body.mixEligible !== undefined) update.mix_eligible = body.mixEligible;
    if (body.altEligible !== undefined) update.alt_eligible = body.altEligible;
    if (body.piecePrice !== undefined) update.piece_price = body.piecePrice;
    if (body.category !== undefined) update.category = body.category;
    update.updated_at = new Date().toISOString();

    const { error } = await supabase.from('menu_items').update(update).eq('id', id);
    if (error) return json(res, 500, { error: error.message });
    return json(res, 200, { success: true });
  }

  return json(res, 405, { error: 'Method not allowed' });
};