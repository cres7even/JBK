const { supabase, json, readBody } = require('./_lib');

module.exports = async (req, res) => {
  if (req.method !== 'PUT') return json(res, 405, { error: 'Method not allowed' });

  const id = req.query.id || (req.url.split('/').pop() || '').split('?')[0];
  if (!id) return json(res, 400, { error: 'Missing item id' });

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
};