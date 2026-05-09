from kafka import KafkaConsumer
import json

from database.db import SessionLocal
from crud import create_sensor_reading
from streaming.topics import SENSOR_TOPIC, PREDICTION_TOPIC

consumer = KafkaConsumer(
    SENSOR_TOPIC,
    bootstrap_servers="kafka:9092",
    value_deserializer=lambda m: json.loads(m.decode("utf-8"))
)

db = SessionLocal()

for message in consumer:
    event = message.value

    payload = {
        "hardware_id": event["metadata"]["hardware_id"],

        "turbidity": event["sensors"]["Turbidity"],
        "ph": event["sensors"]["pH"],
        "conductivity": event["sensors"]["Conductivity"],
        "organic_carbon": event["sensors"]["Organic_Carbon"],
        "orp": event["sensors"]["ORP"],
        "dissolved_oxygen": event["sensors"]["Dissolved_Oxygen"],
        "temperature": event["sensors"]["Temperature"],
        "flow_rate": event["sensors"]["Flow_Rate"],
        "pressure": event["sensors"]["Pressure"],

        "potable": event["local_assessment"]["local_potable"],
        "risk_score": event["local_assessment"]["risk_score"],

        "latitude": event["infrastructure"]["lat"],
        "longitude": event["infrastructure"]["lon"],

        "scenario": event["metadata"]["scenario"],
        "timestamp": event["metadata"]["timestamp"]
    }

    create_sensor_reading(db, payload)

    print("Saved sensor event")