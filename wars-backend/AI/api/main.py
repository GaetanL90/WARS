from fastapi import FastAPI
from api.database.db import engine
from api.database.db import Base
from api.routes.sensors import router as sensor_router

Base.metadata.create_all(bind=engine)


app = FastAPI(title="WARS", version="0.1.0")
@app.on_event("startup")
def load_models():
    import api.ml_loader

app.include_router(sensor_router)