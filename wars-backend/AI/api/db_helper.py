import time
from sqlalchemy.exc import OperationalError

def wait_for_db(engine, retries=10):
    for i in range(retries):
        try:
            conn = engine.connect()
            conn.close()
            print("✅ DB connected")
            return
        except OperationalError:
            print(f"⏳ DB not ready ({i+1}/{retries})")
            time.sleep(3)
    raise Exception("❌ DB connection failed")