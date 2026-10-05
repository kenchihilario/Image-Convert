import logging
import sys
from typing import Tuple

import cv2
import numpy as np
from PIL import Image

from light_restyle.config import (
    DEFAULT_JPEG_QUALITY,
    LOG_FORMAT,
    MAX_IMAGE_DIMENSION,
    VALID_IMAGE_FORMATS,
)

class InvalidImageError(Exception):
    pass

def load_image(path: str) -> np.ndarray:
    try:
        image = Image.open(path)
        image.verify()
    except Exception as error:
        raise InvalidImageError(str(error)) from error

    if image.format not in VALID_IMAGE_FORMATS:
        raise InvalidImageError(image.format)

    image = Image.open(path)
    image = image.convert("RGB")
    return np.array(image)

def save_image(array: np.ndarray, path: str, quality: int = DEFAULT_JPEG_QUALITY) -> None:
    image = Image.fromarray(array)
    image.save(path, quality=quality)

def _calculate_new_dimensions(width: int, height: int, max_dim: int) -> Tuple[int, int]:
    if width <= max_dim and height <= max_dim:
        return width, height

    if width > height:
        new_width = max_dim
        new_height = int(height * (max_dim / width))
    else:
        new_height = max_dim
        new_width = int(width * (max_dim / height))

    return new_width, new_height

def resize_preserving_aspect(image: np.ndarray, max_dim: int = MAX_IMAGE_DIMENSION) -> np.ndarray:
    height, width, _ = image.shape
    new_width, new_height = _calculate_new_dimensions(width, height, max_dim)

    if new_width == width and new_height == height:
        return image

    return cv2.resize(image, (new_width, new_height), interpolation=cv2.INTER_AREA)

def get_logger(name: str) -> logging.Logger:
    logger = logging.getLogger(name)
    if not logger.handlers:
        logger.setLevel(logging.INFO)
        handler = logging.StreamHandler(sys.stdout)
        formatter = logging.Formatter(LOG_FORMAT)
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        logger.propagate = False
    return logger
