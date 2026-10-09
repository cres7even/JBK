// ============================================================
// SHARED LIBRARY FOR ALL API FUNCTIONS
// Combines: Supabase client + IST time helpers + response helpers
// ============================================================

const { createClient } = require('@supabase/supabase-js');

// ----- Supabase client -----
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_KEY;

if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY env vars');
}

const supabase = createClient(url || 'http://localhost', key || 'anon', {
  auth: { persistSession: false }
});

// ----- IST time helpers -----
function getISTTime() {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  return new Date(now.getTime() + istOffset);
}

function getISTDateString() {
  return getISTTime().toISOString().split('T')[0];
}

function getISTTimeString() {
  const ist = getISTTime();
  const h = String(ist.getUTCHours()).padStart(2, '0');
  const m = String(ist.getUTCMinutes()).padStart(2, '0');
  const s = String(ist.getUTCSeconds()).padStart(2, '0');
  return `${h}:${m}:${s} IST`;
}

// ----- HTTP helpers -----
function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (c) => (data += c));
    req.on('end', () => {
      try { resolve(data ? JSON.parse(data) : {}); }
      catch { resolve({}); }
    });
  });
}

// ----- Shared row -> API shape mapper -----
function rowToOrder(r) {
  return {
    token: r.token,
    date: r.date,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    customer: r.customer,
    items: r.items,
    payment: r.payment,
    total: r.total,
    cancelled: r.cancelled,
    cancelledAt: r.cancelled_at
  };
}

module.exports = {
  supabase,
  getISTTime,
  getISTDateString,
  getISTTimeString,
  json,
  readBody,
  rowToOrder
};