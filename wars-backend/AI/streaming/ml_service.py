"""
WARS Kafka ML Consumer
----------------------
Consumes raw sensor payloads from SENSOR_TOPIC,
runs ML inference, publishes enriched result to PREDICTION_TOPIC.
"""

import json
from kafka import KafkaConsumer

from streaming.kafka_producer import WARSKafkaProducer
from streaming.topics import SENSOR_TOPIC, ENRICHED_TOPIC, ALERT_TOPIC
from services.feature_builder import build_features   # single source of truth
from ml.predict_stream import predict            # single source of truth


# ── Setup ─────────────────────────────────────────────────────────────
consumer = KafkaConsumer(
    SENSOR_TOPIC,
    bootstrap_servers="localhost:9092",
    value_deserializer=lambda m: json.loads(m.decode("utf-8")),
    auto_offset_reset="earliest",
    enable_auto_commit=True,
    group_id="wars-ml-group",
)

producer = WARSKafkaProducer()

print("✅ WARS ML Consumer started — listening on:", SENSOR_TOPIC)

# ── Consume loop ──────────────────────────────────────────────────────
for msg in consumer:
    payload = msg.value
    hardware_id = payload.get("metadata", {}).get("hardware_id", "unknown")

    try:
        feature_df    = build_features(payload)
        ml_output     = predict(feature_df)

        payload["ml_output"] = ml_output

        producer.send(
            ENRICHED_TOPIC,
            payload,
            key=hardware_id,
        )

        risk = ml_output.get("failure_risk_score", 0)

        if risk > 0.7 or ml_output["risk_level"] == "HIGH":
            producer.send(
                ALERT_TOPIC,
                {
                    "hardware_id": hardware_id,
                    "risk": risk,
                    "ml_output": ml_output,
                },
                key=hardware_id,
            )
    
        print(
            f"✅ [{hardware_id}] "
            f"Potable={ml_output['potability']} "
            f"({ml_output['potability_confidence']*100:.1f}%) | "
            f"Risk={ml_output['failure_risk_score']:.3f} "
            f"[{ml_output['risk_level']}]"
        )

    except Exception as e:
        print(f"❌ [{hardware_id}] Inference failed: {e}")
        # Don't crash the consumer — log and continue to next message
        continue