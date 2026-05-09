from kafka import KafkaConsumer
import json

from streaming.kafka_producer import WARSKafkaProducer
from streaming.topics import SENSOR_TOPIC, PREDICTION_TOPIC
from services.predictor import WARSPredictor
from services.feature_builder import build_features


consumer = KafkaConsumer(
    SENSOR_TOPIC,
    bootstrap_servers="localhost:9092",
    value_deserializer=lambda m: json.loads(m.decode("utf-8")),
    auto_offset_reset="earliest",
    enable_auto_commit=True,
    group_id="wars-ml-group",
)

producer = WARSKafkaProducer()
predictor = WARSPredictor()


print("WARS ML Consumer started...")

for msg in consumer:
    payload = msg.value

    predictions = predictor.predict(payload)

    payload["ml_output"] = predictions

    producer.send(
        PREDICTION_TOPIC,
        payload,
        key=payload["metadata"]["hardware_id"],
    )

    print("ML processed:", predictions)