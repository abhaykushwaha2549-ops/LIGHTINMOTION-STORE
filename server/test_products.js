import db from './db/database.js';

function formatProduct(productRow) {
  if (!productRow) return null;
  const media = db.prepare('SELECT * FROM product_media WHERE product_id = ? ORDER BY sort_order ASC').all(productRow.id);
  let options = {};
  try {
    options = productRow.options_json ? JSON.parse(productRow.options_json) : {};
  } catch {}

  return {
    ...productRow,
    options,
    media: media || []
  };
}

try {
  let query = 'SELECT * FROM products WHERE status = ?';
  const products = db.prepare(query).all('Active');
  console.log('Query success! Count:', products.length);
  const formatted = products.map(formatProduct);
  console.log('Formatted success! First item:', formatted[0].title);
} catch(e) {
  console.error('Error in product query:', e);
}
