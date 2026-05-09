from fastapi import FastAPI

app = FastAPI(title="WARS Model API")


@app.get("/")
def home():
    return {
        "message": "WARS AI backend online"
    }