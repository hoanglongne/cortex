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
    \"text\": \"I learned about artificial intelligence.\"
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
    \"transcript\": \"Artificial intelligence is cool.\",
    \"xpEarned\": 50
  }
}"

echo -e "\n\n--- Kiểm tra sau Oratio (Sẽ có bridge data) ---"
curl -s "$API_URL/insights/$USER_ID" | grep -E "active_vocab_count|vocabulary_size"

echo -e "\n\n--- Giai đoạn 3: Gửi thêm Lexica log (Cái này sẽ làm mất bridge data) ---"
curl -X POST "$API_URL/actions/log" \
-H "Content-Type: application/json" \
-d "{
  \"userId\": \"$USER_ID\",
  \"appSource\": \"lexica\",
  \"actionType\": \"LEARN_VOCABULARY\",
  \"metadata\": {
    \"words\": [\"quantum\", \"computing\"],
    \"text\": \"Learning quantum computing.\"
  }
}"

echo -e "\n\n--- Kiểm tra sau Lexica lần 2 (Bridge data có thể bị mất) ---"
curl -s "$API_URL/insights/$USER_ID" | grep -E "active_vocab_count|vocabulary_size"
