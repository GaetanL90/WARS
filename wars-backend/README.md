## WARS Backend - ML & Sensor Intelligence

This is the backend service for the WARS project, responsible for simulating sensor data, performing feature engineering, and running machine learning inference using Random Forest and Extra Trees models.

## Project Structure

# generator/:

    Contains scripts for synthetic data generation and sensor simulation

    # realistic_patterns.py:
    Generates data following natural sensor fluctuations.

    # sensor_simulator.py:

    Simulates live data streams for the frontend.

# ml/:

    The core intelligence layer.

        # feature_engineering.py:

        Transformation logic for raw sensor data.predictor.py: Wrapper for model loading and prediction logic.

        # inference_pipeline.py:

        The end-to-end flow from raw input to output.

## models/:

    Compressed serialized models (.pkl) and schema definitions.

## Tech Stack

    Language: Python 3.x
    Libraries: Scikit-learn, Pandas, NumPy, JoblibEnvironment: WSL (Ubuntu)

## Installation

1. Clone the repository: git clone <fork-url>

   ## Example: git clone https://github.com/SilasHakuzwimana/WARS.git

   cd wars-backend

2. Create a virtual environment:Bashpython3 -m venv venv
   source venv/bin/activate
3. Install dependencies:
   pip install -r requirements.txt

## Models in Use

# Model

    WARS_Classifier_RF

# Algorithm

    Random Forest

# Purpose

    Categorizes sensor states and zone identification.

# Model

    WARS_Regressor_ET

# Algorithm

    Extra Trees

# Purpose

    Predicts continuous numerical values/trends.

## Usage

To run the inference pipeline manually for testing:

```bash
python3 ml/inference_pipeline.py
```

To start the sensor simulation:

```bash
python3 generator/sensor_simulator.py
```
