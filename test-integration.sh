#!/bin/bash

# Test script for the n8n integration

echo "=== Testing n8n Integration ==="
echo ""

# Store an order
echo "1. Storing test order..."
STORE_RESPONSE=$(curl -s -X POST http://localhost:3000/api/store \
  -H "Content-Type: application/json" \
  -d '{
    "checkout_token": "test-integration-001",
    "orderId": "ORD-INT-12345",
    "customer": {
      "name": "Integration Test User",
      "phone": "+91 98765 43210",
      "address": "789 Integration Lane",
      "city": "Bangalore",
      "pincode": "560001"
    },
    "items": [
      {
        "id": 1,
        "name": "Sample Product",
        "variant": "Large",
        "quantity": 2,
        "price": 750,
        "image": ""
      }
    ],
    "totalAmount": 1500,
    "shippingAmount": 100,
    "codFee": 25,
    "finalAmount": 1625
  }')

echo "$STORE_RESPONSE" | jq '.'
echo ""

# Extract the confirm URL
CONFIRM_URL=$(echo "$STORE_RESPONSE" | jq -r '.confirmUrl')
echo "Confirmation URL: $CONFIRM_URL"
echo ""

# Retrieve the order
echo "2. Retrieving stored order..."
GET_RESPONSE=$(curl -s 'http://localhost:3000/api/get-order?id=test-integration-001')
echo "$GET_RESPONSE" | jq '.'
echo ""

echo "=== Test Complete ===" echo ""
echo "You can now open the confirmation page in your browser:"
echo "http://localhost:3000/confirm?id=test-integration-001"
