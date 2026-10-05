import cv2
import numpy as np
from typing import Callable, Optional

from light_restyle.color_grade import apply_light_airy_grade
from light_restyle.config import MAX_IMAGE_DIMENSION
from light_restyle.io_utils import (
    InvalidImageError,
    get_logger,
    load_image,
    resize_preserving_aspect,
    save_image,
)
from light_restyle.style_reference import generate_light_airy_reference
from light_restyle.style_transfer import ModelLoadError, stylize

logger = get_logger("light_restyle.pipeline")

def _blend_images(original: np.ndarray, stylized: np.ndarray, intensity: float) -> np.ndarray:
    height, width = original.shape[:2]
    resized_stylized = cv2.resize(stylized, (width, height), interpolation=cv2.INTER_CUBIC)

    if intensity >= 1.0:
        return resized_stylized
    if intensity <= 0.0:
        return original

    return cv2.addWeighted(
        resized_stylized, intensity, original, 1.0 - intensity, 0
    ).astype(np.uint8)

def process_image_in_memory(
    image: np.ndarray,
    progress_callback: Optional[Callable[[str], None]] = None
) -> np.ndarray:
    def _notify(msg: str) -> None:
        if progress_callback:
            progress_callback(msg)

    try:
        _notify("Preparing images and loading model...")
        logger.info("Preparing images and applying style transfer")
        processing_image = resize_preserving_aspect(image, MAX_IMAGE_DIMENSION)
        style_reference = generate_light_airy_reference()
        
        _notify("Applying style transfer (this takes time)...")
        stylized_image = stylize(processing_image, style_reference)
    except ModelLoadError as error:
        logger.error("Model failed to load")
        raise
    except Exception as error:
        logger.error("Stylization failed")
        raise

    try:
        _notify("Applying color grade...")
        logger.info("Applying color grade")
        return apply_light_airy_grade(stylized_image)
    except Exception as error:
        logger.error("Color grading failed")
        raise

def run_pipeline(
    input_path: str, 
    output_path: str, 
    intensity: float = 1.0,
    progress_callback: Optional[Callable[[str], None]] = None
) -> None:
    def _notify(msg: str) -> None:
        if progress_callback:
            progress_callback(msg)

    try:
        _notify("Loading input image...")
        logger.info("Loading input image")
        original_image = load_image(input_path)
    except InvalidImageError as error:
        logger.error("Failed to load input image")
        raise

    graded_image = process_image_in_memory(original_image, progress_callback)

    try:
        _notify("Saving output image...")
        logger.info("Saving output image")
        final_image = _blend_images(original_image, graded_image, intensity)
        save_image(final_image, output_path)
    except Exception as error:
        logger.error("Failed to save output image")
        raise
