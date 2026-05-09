from sqlalchemy.orm import declarative_base
from sqlalchemy import Column, Integer, Float, String, Boolean


Base = declarative_base()


class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id = Column(Integer, primary_key=True)
    hardware_id = Column(String)
    turbidity = Column(Float)
    ph = Column(Float)
    conductivity = Column(Float)
    potable = Column(Boolean)


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True)
    hardware_id = Column(String)
    risk_score = Column(Float)
    potability = Column(Integer)