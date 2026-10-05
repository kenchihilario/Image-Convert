import logging
import os

import numpy as np
import pytest
from PIL import Image

from light_restyle.io_utils import (
    InvalidImageError,
    get_logger,
    load_image,
    resize_preserving_aspect,
    save_image,
)

FIXTURE_DIR: str = os.path.join(os.path.dirname(__file__), "fixtures")
SAMPLE_INPUT: str = os.path.join(FIXTURE_DIR, "sample_input.jpg")
BAD_INPUT: str = os.path.join(FIXTURE_DIR, "bad_input.jpg")

def test_load_image_valid() -> None:
    image_array = load_image(SAMPLE_INPUT)
    assert isinstance(image_array, np.ndarray)
    assert image_array.shape == (100, 100, 3)

def test_load_image_invalid() -> None:
    with pytest.raises(InvalidImageError):
        load_image(BAD_INPUT)

def test_load_image_not_found() -> None:
    with pytest.raises(InvalidImageError):
        load_image(os.path.join(FIXTURE_DIR, "non_existent.jpg"))

def test_save_image() -> None:
    output_path = os.path.join(FIXTURE_DIR, "output.jpg")
    test_array = np.zeros((50, 50, 3), dtype=np.uint8)
    
    save_image(test_array, output_path)
    
    assert os.path.exists(output_path)
    with Image.open(output_path) as loaded:
        assert loaded.size == (50, 50)
    os.remove(output_path)

def test_resize_preserving_aspect_no_change() -> None:
    image = np.zeros((500, 500, 3), dtype=np.uint8)
    resized = resize_preserving_aspect(image, max_dim=1000)
    assert resized.shape == (500, 500, 3)

def test_resize_preserving_aspect_width_dominant() -> None:
    image = np.zeros((500, 1000, 3), dtype=np.uint8)
    resized = resize_preserving_aspect(image, max_dim=500)
    assert resized.shape == (250, 500, 3)

def test_resize_preserving_aspect_height_dominant() -> None:
    image = np.zeros((1000, 500, 3), dtype=np.uint8)
    resized = resize_preserving_aspect(image, max_dim=500)
    assert resized.shape == (500, 250, 3)

def test_get_logger() -> None:
    logger = get_logger("test_logger")
    assert isinstance(logger, logging.Logger)
    assert logger.name == "test_logger"
    assert logger.level == logging.INFO
    assert len(logger.handlers) == 1
