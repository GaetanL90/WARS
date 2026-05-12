import json
import requests
from kafka import KafkaConsumer
from streaming.topics import ENRICHED_TOPIC

consumer = KafkaConsumer(
    ENRICHED_TOPIC,
    bootstrap_servers="localhost:9092",
    value_deserializer=lambda m: json.loads(m.decode("utf-8")),
    auto_offset_reset="latest",
    group_id="wars-db-writer",
)

print("✅ Sensor Consumer started...")

for msg in consumer:
    payload = msg.value

    try:
        response = requests.post(
            "http://127.0.0.1:8000/sensors/sensor",
            json=payload,
            timeout=10
        )

        print(f"📥 Sent to API | Status: {response.status_code}")

    except Exception as e:
        print(f"❌ Failed to send to API: {e}")