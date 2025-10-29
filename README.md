# COD Confirmation Landing Page - u.Roots

Mobile-first Shopify-style COD confirmation page with n8n integration.

## What's Implemented

✅ **In-memory webhook receiver** for n8n integration  
✅ **Order storage** using `checkout_token` as the unique key  
✅ **Prefilled confirmation page** at `/confirm?id=<checkout_token>`  
✅ **Form submission** to external webhook  
✅ **Mobile-first UI** with u.Roots branding  

---

## How It Works

```
n8n Workflow
    ↓
POST /api/store (stores order data)
    ↓
Send customer link: /confirm?id=<checkout_token>
    ↓
Customer opens link → sees prefilled form
    ↓
Customer confirms → POST to your webhook
    ↓
Redirect to /success
```

---

## Quick Start

### 1. Start the dev server
```bash
npm run dev
```

Open [http://localhost:3000/confirm?id=valid-token-123](http://localhost:3000/confirm?id=valid-token-123) to see the demo.

### 2. Store a test order
```bash
curl -X POST http://localhost:3000/api/store \
  -H "Content-Type: application/json" \
  -d '{
    "checkout_token": "my-test-token",
    "orderId": "ORD-001",
    "customer": {
      "name": "Test User",
      "phone": "+91 99999 88888",
      "address": "123 Test Street",
      "city": "Mumbai",
      "pincode": "400001"
    },
    "items": [{"id": 1, "name": "Product", "variant": "M", "quantity": 1, "price": 500, "image": ""}],
    "totalAmount": 500,
    "shippingAmount": 0,
    "codFee": 20,
    "finalAmount": 520
  }'
```

### 3. Open the confirmation page
```
http://localhost:3000/confirm?id=my-test-token
```

---

## n8n Integration

See **[N8N_INTEGRATION.md](./N8N_INTEGRATION.md)** for complete setup instructions.

**Quick setup:**
1. Create HTTP Request node in n8n
2. Method: POST, URL: `https://yourdomain.com/api/store`
3. Send order data with `checkout_token`
4. Use returned `confirmUrl` in SMS/email

---

## API Endpoints

### POST `/api/store`
Stores order data from n8n.

**Required fields:** `checkout_token`, `orderId`, `customer`, `items`, `finalAmount`

### GET `/api/get-order?id=<checkout_token>`
Retrieves order data for the confirmation page.

---

## File Structure

```
src/
├── app/
│   ├── page.tsx                    # Main confirmation page
│   ├── success/page.tsx            # Success page
│   ├── api/
│   │   ├── store/route.ts          # n8n webhook endpoint
│   │   └── get-order/route.ts      # Data retrieval
│   └── globals.css                 # Design tokens
├── lib/
│   └── orderStore.ts               # In-memory storage
public/
└── yrsfxhgcjhv.svg                 # u.Roots logo
```

---

## Important Notes

### In-Memory Storage
- Data is stored in RAM and **lost on server restart**
- Suitable for testing and demos
- For production, upgrade to file or database storage

### Form Fields
All required (*):
- Full name, Phone number, Alternative phone number
- Address, City, PIN code

### URL Structure
- Confirmation: `/confirm?id=<checkout_token>`
- Must match the token POSTed to `/api/store`

---

## Deploy on Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/shopify-cod-landing)

1. Push to GitHub
2. Import to Vercel
3. Update n8n webhook URL to your Vercel domain
4. Done! 🎉

---

## Troubleshooting

**"Invalid or expired link"**
- Token not found in memory (server restarted)
- Check `checkout_token` matches what was stored
- Look for `[OrderStore]` logs in console

**n8n can't reach webhook**
- Use ngrok for local testing: `ngrok http 3000`
- Update webhook URL in n8n to ngrok URL

---

**Built for u.Roots** 🌱
