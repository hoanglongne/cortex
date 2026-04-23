#!/bin/bash

USER_ID="ce99b943-f480-439e-a6f1-4adef7d56f57"
API_URL="http://localhost:3001"

echo "--- Giai đoạn 1: Học từ vựng trên Lexica ---"
curl -X POST "$API_URL/actions/log" \
-H "Content-Type: application/json" \
-d "{
  \"userId\": \"$USER_ID\",
  \"appSource\": \"lexica\",
  \"actionType\": \"LEARN_VOCABULARY\",
  \"metadata\": {
    \"words\": [\"artificial\", \"intelligence\", \"machine\", \"learning\", \"neural\", \"network\", \"algorithm\"],
    \"text\": \"I learned about artificial intelligence and neural networks today.\"
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
    \"transcript\": \"Artificial intelligence is a branch of computer science. I love learning about neural networks and machine learning.\",
    \"xpEarned\": 50
  }
}"

echo -e "\n\n--- Giai đoạn 3: Kiểm tra Profile ---"
curl -s "$API_URL/insights/$USER_ID" | json_pp || curl -s "$API_URL/insights/$USER_ID"
