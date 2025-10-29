// FILE: src/app/api/get-order/route.ts
// Loads order with EXPIRY + 1-time lock (status check)

import { NextRequest, NextResponse } from 'next/server';
import { getOrderByToken, isExpired } from '@/lib/orderStore';

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('id');
    if (!token) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const order = await getOrderByToken(token);
    if (!order) {
      return NextResponse.json({ error: 'Invalid or expired order token' }, { status: 404 });
    }

    if (order.status === 'confirmed' || isExpired(order.created_at)) {
      return NextResponse.json({ error: 'Invalid or expired order token' }, { status: 410 });
    }

    return NextResponse.json({ success: true, data: order });
  } catch (err) {
    console.error('[API /get-order] error:', err);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}
