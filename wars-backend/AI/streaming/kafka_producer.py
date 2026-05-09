from kafka import KafkaProducer
import json


class WARSKafkaProducer:
    def __init__(self, bootstrap_servers="localhost:9092"):
        self.producer = KafkaProducer(
            bootstrap_servers=bootstrap_servers,
            value_serializer=lambda v: json.dumps(v).encode("utf-8"),
            key_serializer=lambda k: k.encode("utf-8") if k else None,
            acks="all",
            linger_ms=10,
        )

    def send(self, topic: str, payload: dict, key: str = None):
        return self.producer.send(
            topic,
            key=key,
            value=payload,
        )
        
    def flush(self):
        self.producer.flush()

    def close(self):
        self.producer.close()