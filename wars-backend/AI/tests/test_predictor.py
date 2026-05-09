from services.predictor import WARSPredictor


def test_predictor_loads():
    predictor = WARSPredictor()
    assert predictor is not None