// Test script to POST an order and GET it back from your local Next.js API endpoints
// Usage: npx tsx test-order-flow.ts

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3000/api'; // Change if running on Vercel

const testOrder = {
  checkout_token: 'test-token-123',
  orderId: 'ORD-2025-001',
  id: 'shopify-987654',
  customer: {
    name: 'Test User',
    phone: '+91 99999 88888',
    address: '42 Test Lane',
    city: 'Testville',
    pincode: '123456'
  },
  items: [
    { id: 1, name: 'Widget', quantity: 2, price: 100 },
    { id: 2, name: 'Gadget', quantity: 1, price: 200 }
  ],
  finalAmount: 400,
  shippingAmount: 50,
  codFee: 30,
  status: 'pending'
};

async function main() {
  // 1. Store order
  const storeRes = await fetch(`${API_BASE}/store`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testOrder)
  });
  const storeJson = await storeRes.json();
  console.log('POST /api/store response:', storeJson);

  // 2. Fetch order
  const getRes = await fetch(`${API_BASE}/get-order?id=${encodeURIComponent(testOrder.checkout_token)}`);
  const getJson = await getRes.json();
  console.log('GET /api/get-order response:', getJson);
}

main().catch(console.error);
