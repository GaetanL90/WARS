import os


KAFKA_BOOTSTRAP_SERVERS = os.getenv(
    "KAFKA_BOOTSTRAP_SERVERS",
    "localhost:9092"
)

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://wars:wars@localhost:5432/wars"
)