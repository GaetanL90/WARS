from fastapi import FastAPI
from api.database.db import engine
from api.database.db import Base
from api.routes.sensors import router as sensor_router
import api.ml_loader
from api.db_helper import wait_for_db

app = FastAPI(title="WARS", version="0.1.0")

@app.on_event("startup")
def startup():
    wait_for_db(engine)
    Base.metadata.create_all(bind=engine)


@app.on_event("startup")
def load_models():
    try:
        import api.ml_loader
        print("ML models loaded successfully")
    except Exception as e:
        print(f"ML loading failed: {e}")

app.include_router(sensor_router)