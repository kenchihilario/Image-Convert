import os

import cv2
import numpy as np

from light_restyle.io_utils import load_image
from light_restyle.pipeline import run_pipeline

FIXTURE_DIR: str = os.path.join(os.path.dirname(__file__), "fixtures")
SAMPLE_INPUT: str = os.path.join(FIXTURE_DIR, "sample_input.jpg")
SAMPLE_OUTPUT: str = os.path.join(FIXTURE_DIR, "integration_output.jpg")

def _get_brightness_stats(image_path: str) -> tuple[float, float]:
    image = load_image(image_path)
    gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
    return float(np.mean(gray)), float(np.std(gray))

def test_end_to_end_light_airy_property() -> None:
    if os.path.exists(SAMPLE_OUTPUT):
        os.remove(SAMPLE_OUTPUT)

    run_pipeline(SAMPLE_INPUT, SAMPLE_OUTPUT, intensity=1.0)

    assert os.path.exists(SAMPLE_OUTPUT)

    input_mean, input_std = _get_brightness_stats(SAMPLE_INPUT)
    output_mean, output_std = _get_brightness_stats(SAMPLE_OUTPUT)

    assert output_mean > input_mean
    assert output_std < input_std

    os.remove(SAMPLE_OUTPUT)
