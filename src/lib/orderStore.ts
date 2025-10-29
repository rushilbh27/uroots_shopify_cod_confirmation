// FILE: src/lib/orderStore.ts
// Supabase-only order store (flat schema, expiry + confirm lock)

import { supabaseAdmin } from './supabase';

export type OrderItem = {
  id?: number;
  name: string;
  quantity: number;
  price?: number;
  variant?: string;
  image?: string;
};

export type StoredOrder = {
  // identifiers
  checkout_token: string;           // unique token used in /confirm?id=...
  order_id?: string | null;         // small visible number like 3416 (string for safety)
  shopify_id?: string | null;       // BIG numeric internal Shopify ID as string

  // customer (flat)
  customer_name?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  pincode?: string | null;

  // cart + money
  items?: OrderItem[] | null;       // stored as JSONB
  final_amount?: number | null;
  shipping_amount?: number | null;
  cod_fee?: number | null;

  // lifecycle
  status?: 'pending' | 'confirmed' | 'cancelled' | string | null;

  // metadata
  created_at?: string | null;       // from Supabase default now()
};

// ---- helpers ----
const TWO_DAYS_MS = 48 * 60 * 60 * 1000;

export function isExpired(createdAtISO?: string | null): boolean {
  if (!createdAtISO) return true;
  const created = new Date(createdAtISO).getTime();
  if (Number.isNaN(created)) return true;
  return Date.now() - created > TWO_DAYS_MS;
}

// ---- writes ----
/**
 * Upserts by checkout_token (last write wins).
 * Accepts flat schema only. If caller sends `id`, you should map it to `shopify_id` before calling this.
 */
export async function storeOrder(order: StoredOrder) {
  if (!order?.checkout_token) {
    throw new Error('storeOrder: checkout_token is required');
  }

  const payload = {
    checkout_token: order.checkout_token,
    order_id: order.order_id ?? null,
    shopify_id: order.shopify_id ?? null,
    customer_name: order.customer_name ?? null,
    phone: order.phone ?? null,
    address: order.address ?? null,
    city: order.city ?? null,
    pincode: order.pincode ?? null,
    items: order.items ?? [],
    final_amount: order.final_amount ?? 0,
    shipping_amount: order.shipping_amount ?? 0,
    cod_fee: order.cod_fee ?? 0,
    status: order.status ?? 'pending',
  };

  const { data, error } = await supabaseAdmin
    .from('orders')
    .upsert(payload, { onConflict: 'checkout_token' })
    .select()
    .maybeSingle();

  if (error) {
    console.error('[orderStore] upsert error', error);
    throw error;
  }

  return data as StoredOrder;
}

// ---- reads ----
export async function getOrderByToken(token: string) {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('checkout_token', token)
    .maybeSingle();

  if (error) {
    console.error('[orderStore] getOrderByToken error', error);
    throw error;
  }

  return (data as StoredOrder | null) ?? null;
}

// ---- status updates ----
export async function markOrderConfirmed(token: string) {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .update({ status: 'confirmed' })
    .eq('checkout_token', token)
    .select()
    .maybeSingle();

  if (error) {
    console.error('[orderStore] markOrderConfirmed error', error);
    throw error;
  }
  return data as StoredOrder | null;
}
