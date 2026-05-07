## WARS IoT Simulation Documentation

# Overview

The sensor_simulator_v2.py mimics a physical IoT device installed at a water point. It provides the raw inputs necessary for the backend to execute the potability classification and failure risk regression.

# Data Source Mapping

The simulator provides 9 raw metrics:

    Physical:
        Turbidity, pH, Conductivity, Solids.
    Chemical:
        Chloramines, Sulfate, Organic_carbon, Trihalomethanes, Hardness.

# Simulation Logic

    Gaussian Noise:
        Unlike standard randomizers, we use random.gauss() to simulate the natural precision errors of physical hardware sensors.

    Seasonal Context:
        The simulator checks the system clock to determine the season (Dry vs. Wet), influencing the Turbidity baseline.

    Metadata Layer:
        Every payload includes a hardware_id and timestamp, allowing the Django backend to fetch the correct static infrastructure data (Age, Distance) from PostgreSQL.

# How to Trigger Alerts

    To test the AI alert system:

        # For Potability:

            Manually set drift in get_reading() to > 5.0. This will likely trigger an "Unsafe" classification.
        # For Failure Risk:
            Ensure the database has an Infrastructure_Age > 15 years for the tested hardware_id. The combination of age and high turbidity will spike the Risk Score > 0.7.
