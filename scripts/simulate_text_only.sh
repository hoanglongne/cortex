#!/bin/bash

USER_ID="ce99b943-f480-439e-a6f1-4adef7d56f57"
API_URL="http://localhost:3001"

echo "--- Giai đoạn 1: Học từ vựng trên Lexica (Chỉ dùng text) ---"
curl -X POST "$API_URL/actions/log" \
-H "Content-Type: application/json" \
-d "{
  \"userId\": \"$USER_ID\",
  \"appSource\": \"lexica\",
  \"actionType\": \"LEARN_VOCABULARY\",
  \"metadata\": {
    \"text\": \"I am learning about decentralized finance and blockchain technology today.\"
  }
}"

echo -e "\n\n--- Giai đoạn 2: Sử dụng từ vựng trên Oratio (Speaking) ---"
curl -X POST "$API_URL/actions/log" \
-H "Content-Type: application/json" \
-d "{
  \"userId\": \"$USER_ID\",
  \"appSource\": \"oratio\",
  \"actionType\": \"COMPLETE_SESSION\",
  \"metadata\": {
    \"transcript\": \"Blockchain is the foundation of decentralized finance.\",
    \"xpEarned\": 50
  }
}"

echo -e "\n\n--- Kiểm tra Profile ---"
curl -s "$API_URL/insights/$USER_ID" | json_pp || curl -s "$API_URL/insights/$USER_ID"
