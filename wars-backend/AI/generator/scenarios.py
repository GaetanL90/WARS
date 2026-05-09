import random

def heavy_rain_event(base_readings):
    """
    Simulates a contamination spike after a storm.
    Increases Turbidity and reduces pH to trigger 'Unsafe' classification.
    """
    scen_data = base_readings.copy()
    scen_data["Turbidity"] = round(random.uniform(8.0, 15.0), 2) # High contamination [cite: 5]
    scen_data["pH"] = round(random.uniform(5.5, 6.2), 2) # Acidic runoff [cite: 5]
    scen_data["Solids"] *= 2.0 # High sediment [cite: 5]
    return scen_data

def pipe_failure_risk(base_readings):
    """
    Simulates chemical indicators of pipe degradation.
    Spikes Sulfate and Conductivity to increase the Failure Risk Score.
    """
    scen_data = base_readings.copy()
    scen_data["Conductivity"] = round(random.uniform(900, 1200), 1) # Mineral leaching [cite: 5]
    scen_data["Sulfate"] = round(random.uniform(500, 700), 2) # Chemical corrosion indicator [cite: 5]
    return scen_data

def chlorination_failure(base_readings):
    """
    Simulates a pump failure at the treatment plant.
    Drops Chloramines to dangerously low levels.
    """
    scen_data = base_readings.copy()
    scen_data["Chloramines"] = round(random.uniform(0.0, 0.5), 2) # Disinfection loss [cite: 5]
    return scen_data