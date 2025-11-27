#!/bin/bash

# Check if RESEND_API_KEY is set in .env.local
if ! grep -q "RESEND_API_KEY" .env.local; then
  echo "Error: RESEND_API_KEY not found in .env.local"
  exit 1
fi

echo "Sending test email..."
curl -X POST http://localhost:4000/api/send-email \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

echo -e "\n\nCheck your Resend dashboard or logs."
