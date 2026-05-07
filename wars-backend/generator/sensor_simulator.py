import random
import time

def generate_mock_iot_data():
    """Generates the 9 required IoT sensor metrics."""
    return {
        "Turbidity": round(random.uniform(0.5, 5.0), 2),
        "pH": round(random.uniform(6.0, 9.0), 2),
        "Conductivity": round(random.uniform(200, 800), 1),
        "Solids": round(random.uniform(5000, 30000), 0),
        "Chloramines": round(random.uniform(1.0, 10.0), 2),
        "Sulfate": round(random.uniform(100, 400), 2),
        "Organic_carbon": round(random.uniform(5, 25), 2),
        "Trihalomethanes": round(random.uniform(30, 100), 2),
        "Hardness": round(random.uniform(100, 300), 2)
    }

if __name__ == "__main__":
    while True:
        print(generate_mock_iot_data())
        time.sleep(5)