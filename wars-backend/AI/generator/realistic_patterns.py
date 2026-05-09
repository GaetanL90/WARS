import numpy as np
import random
from datetime import datetime

class WaterQualityPatterns:
    """
    Simulates the interconnected nature of water sensors.
    Example: When Turbidity spikes (runoff), Conductivity usually rises.
    """
    
    @staticmethod
    def apply_seasonal_physics(month, base_values):
        """
        Adjusts baselines based on Rwandan seasonal patterns[cite: 25, 29].
        0 = Dry Season, 1 = Wet Season
        """
        # Wet seasons in Rwanda: Feb-May and Sept-Nov
        is_wet = month in [2, 3, 4, 5, 9, 10, 11]
        
        modified_baselines = base_values.copy()
        if is_wet:
            # Runoff increases sediments and minerals [cite: 6, 29]
            modified_baselines["Turbidity"] *= 2.5 
            modified_baselines["Solids"] *= 1.4
            modified_baselines["Conductivity"] *= 1.2
            modified_baselines["pH"] -= 0.2 # Rain is slightly more acidic
        
        return modified_baselines

    @staticmethod
    def generate_correlated_noise(baselines):
        """
        Applies Gaussian noise and ensures metrics drift realistically.
        """
        readings = {}
        # Apply standard deviation noise for hardware realism
        for metric, value in baselines.items():
            if metric == "Solids":
                readings[metric] = round(max(0, value + np.random.normal(0, 500)), 0)
            elif metric == "Conductivity":
                readings[metric] = round(max(0, value + np.random.normal(0, 20)), 1)
            else:
                readings[metric] = round(max(0, value + np.random.normal(0, value * 0.05)), 2)
        
        return readings