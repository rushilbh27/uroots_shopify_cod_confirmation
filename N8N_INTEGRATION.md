# n8n Integration Guide

This guide explains how to integrate your n8n workflow with the COD confirmation landing page.

## Overview

The integration uses two API endpoints:

1. **POST `/api/store`** - Receives order data from n8n and stores it in-memory
2. **GET `/api/get-order?id=<token>`** - Fetches order data for the landing page

## Flow

1. Customer completes checkout in your system (Shopify, WooCommerce, etc.)
2. n8n workflow captures the order data and generates/receives a `checkout_token`
3. n8n POSTs order data to `/api/store` with the `checkout_token`
4. n8n sends customer an SMS/email with the confirmation link: `https://yourdomain.com/confirm?id=<checkout_token>`
5. Customer opens the link and sees their prefilled order details
6. Customer confirms, and the form POSTs to your confirmation webhook

---

## n8n Workflow Setup

### Step 1: Trigger Node
Use whatever trigger you have (Webhook, Shopify, HTTP Request, etc.) to capture the order.

### Step 2: HTTP Request Node - Store Order Data

**Configuration:**
- **Method:** POST
- **URL:** `https://yourdomain.com/api/store` (or `http://localhost:3000/api/store` for local dev)
- **Authentication:** None (add API key/auth if needed for production)
- **Body Content Type:** JSON

**Request Body (example):**
```json
{
  "checkout_token": "{{ $json.checkout_id }}",
  "orderId": "{{ $json.order_number }}",
  "customer": {
    "name": "{{ $json.customer.name }}",
    "phone": "{{ $json.customer.phone }}",
    "address": "{{ $json.shipping_address.address1 }}",
    "city": "{{ $json.shipping_address.city }}",
    "pincode": "{{ $json.shipping_address.zip }}"
  },
  "items": {{ $json.line_items }},
  "totalAmount": {{ $json.subtotal_price }},
  "shippingAmount": {{ $json.shipping_lines[0].price }},
  "codFee": 20,
  "finalAmount": {{ $json.total_price }}
}
```

**Hardcoded Example Payload (for testing):**
```json
{
  "checkout_token": "chk_abc123xyz789",
  "orderId": "ORD-2024-12345",
  "customer": {
    "name": "Rushil Bhor",
    "phone": "+91 98765 43210",
    "address": "123 MG Road, Apartment 4B",
    "city": "Mumbai",
    "pincode": "400001"
  },
  "items": [
    {
      "id": 1,
      "name": "Organic Turmeric Powder",
      "variant": "500g",
      "quantity": 2,
      "price": 299,
      "image": "https://example.com/turmeric.jpg"
    },
    {
      "id": 2,
      "name": "Cold-Pressed Coconut Oil",
      "variant": "1L",
      "quantity": 1,
      "price": 450,
      "image": "https://example.com/coconut-oil.jpg"
    }
  ],
  "totalAmount": 1048,
  "shippingAmount": 50,
  "codFee": 20,
  "finalAmount": 1118
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Order stored successfully",
  "checkout_token": "chk_abc123xyz789",
  "confirmUrl": "https://yourdomain.com/confirm?id=chk_abc123xyz789"
}
```

### Step 3: Send Notification (SMS/Email/WhatsApp)

Use the `confirmUrl` from the previous step's response.

**Example SMS:**
```
Hi {{ $json.customer.name }},

Your order #{{ $json.orderId }} is confirmed! 
Total: ₹{{ $json.finalAmount }}

Please confirm your delivery details:
{{ $node["HTTP Request"].json.confirmUrl }}

- u.Roots Team
```

---

## Testing Locally with n8n

### Option 1: Use ngrok (Recommended for testing)

1. Start your Next.js dev server:
   ```bash
   cd /Users/rushilbhor/Desktop/lp\ uroots/shopify-cod-landing
   npm run dev
   ```

2. In a new terminal, expose your local server:
   ```bash
   ngrok http 3000
   ```

3. Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)

4. In n8n HTTP Request node, use:
   ```
   https://abc123.ngrok.io/api/store
   ```

### Option 2: n8n and Next.js on localhost

If n8n is running locally, you can use:
```
http://localhost:3000/api/store
```

---

## Testing the Integration

### Manual Test with cURL

```bash
curl -X POST http://localhost:3000/api/store \
  -H "Content-Type: application/json" \
  -d '{
    "checkout_token": "test-token-456",
    "orderId": "ORD-TEST-001",
    "customer": {
      "name": "Test User",
      "phone": "+91 99999 88888",
      "address": "456 Test Street",
      "city": "Pune",
      "pincode": "411001"
    },
    "items": [
      {
        "id": 1,
        "name": "Test Product",
        "variant": "Medium",
        "quantity": 1,
        "price": 500,
        "image": ""
      }
    ],
    "totalAmount": 500,
    "shippingAmount": 0,
    "codFee": 20,
    "finalAmount": 520
  }'
```

**Then open in browser:**
```
http://localhost:3000/confirm?id=test-token-456
```

You should see the prefilled form with the test data!

---

## Production Deployment

### Important Notes

1. **In-memory storage** means data is lost on server restart
   - For production, consider upgrading to file-based or database storage
   - Current implementation is suitable for demo/testing

2. **Security considerations:**
   - Add authentication to `/api/store` endpoint (API keys, JWT, etc.)
   - Validate and sanitize all incoming data
   - Add rate limiting to prevent abuse
   - Use HTTPS in production

3. **Token generation:**
   - Currently using the checkout_token from your system
   - Ensure tokens are unique and hard to guess (UUIDs recommended)
   - Consider adding expiration timestamps

---

## Troubleshooting

### "Invalid or expired link" error
- Check that the checkout_token in the URL matches what was POSTed to `/api/store`
- Verify the order was stored successfully (check server logs)
- Remember: data is lost if the Next.js dev server restarts

### n8n can't reach the webhook
- If testing locally, use ngrok to expose your local server
- Check firewall settings
- Verify the URL is correct (http vs https, port number)

### Missing or incorrect data
- Verify the payload structure matches the expected format
- Check n8n node mapping for correct field references
- Look at Next.js server logs for validation errors

---

## Example n8n Workflow JSON

Here's a minimal workflow you can import into n8n:

```json
{
  "name": "COD Confirmation Flow",
  "nodes": [
    {
      "parameters": {
        "method": "POST",
        "url": "http://localhost:3000/api/store",
        "jsonParameters": true,
        "options": {},
        "bodyParametersJson": "={\n  \"checkout_token\": \"{{ $json.checkout_id }}\",\n  \"orderId\": \"{{ $json.order_number }}\",\n  \"customer\": {\n    \"name\": \"{{ $json.customer.name }}\",\n    \"phone\": \"{{ $json.customer.phone }}\",\n    \"address\": \"{{ $json.shipping_address.address1 }}\",\n    \"city\": \"{{ $json.shipping_address.city }}\",\n    \"pincode\": \"{{ $json.shipping_address.zip }}\"\n  },\n  \"items\": {{ $json.line_items }},\n  \"totalAmount\": {{ $json.subtotal_price }},\n  \"shippingAmount\": {{ $json.shipping_lines[0].price }},\n  \"codFee\": 20,\n  \"finalAmount\": {{ $json.total_price }}\n}"
      },
      "name": "Store Order Data",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.1,
      "position": [500, 300]
    }
  ],
  "connections": {}
}
```

---

## Next Steps

1. Test the flow end-to-end with a sample order
2. Customize the SMS/email template with your branding
3. Add error handling and notifications for failed orders
4. Consider upgrading to persistent storage for production
5. Add monitoring and analytics

For questions or issues, check the server logs at runtime.
