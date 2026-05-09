from kafka import KafkaConsumer
import json

from streaming.topics import PREDICTION_TOPIC


consumer = KafkaConsumer(
    PREDICTION_TOPIC,
    bootstrap_servers="localhost:9092",
    value_deserializer=lambda m: json.loads(m.decode("utf-8")),
    auto_offset_reset="earliest",
    enable_auto_commit=True,
    group_id="wars-alert-group",
)


print("Alert consumer running...")

for msg in consumer:
    payload = msg.value

    ml = payload.get("ml_output", {})

    risk_score = ml.get("ml_risk_score", 0)
    potable = ml.get("ml_potability", 1)

    if risk_score > 0.7 or potable == 0:
        print("ALERT TRIGGERED")
        print({
            "hardware_id": payload["metadata"]["hardware_id"],
            "risk_score": risk_score,
            "timestamp": payload["metadata"]["timestamp"]
        })