// FILE: src/app/api/store/route.ts
// Receives POST from Shopify / your upstream, stores flat order in Supabase

import { NextRequest, NextResponse } from 'next/server';
import { storeOrder, type StoredOrder } from '@/lib/orderStore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    const checkout_token = body.checkout_token;
    if (!checkout_token) {
      return NextResponse.json({ error: 'Missing checkout_token' }, { status: 400 });
    }

    // Using your requested ID logic:
    // id (big shopify ID),
    // order_id (small number, example: 3416),
    // both flattened and preserved
    const shopify_id = body.id ? String(body.id) : null;
    const order_id = body.orderId ? String(body.orderId) : null;

    const order: StoredOrder = {
      checkout_token,
      order_id,
      shopify_id,
      customer_name: body.customer_name ?? body.customer?.name ?? null,
      phone: body.phone ?? body.customer?.phone ?? null,
      address: body.address ?? body.customer?.address ?? null,
      city: body.city ?? body.customer?.city ?? null,
      pincode: body.pincode ?? body.customer?.pincode ?? null,
      items: body.items ?? [],
      final_amount: body.final_amount ?? body.finalAmount ?? null,
      shipping_amount: body.shipping_amount ?? body.shippingAmount ?? null,
      cod_fee: body.cod_fee ?? body.codFee ?? null,
      status: 'pending',
    };

    await storeOrder(order);

    return NextResponse.json({
      success: true,
      message: 'Order stored successfully',
      checkout_token,
      confirmUrl: `${request.nextUrl.origin}/confirm?id=${encodeURIComponent(checkout_token)}`
    });
  } catch (err) {
    console.error('[API /store] error:', err);
    return NextResponse.json({ error: 'Failed to store order' }, { status: 500 });
  }
}
