import cv2
import numpy as np

from light_restyle.config import (
    DEFAULT_STYLE_SIZE,
    NOISE_BLUR_KERNEL,
    NOISE_INTENSITY,
    STYLE_GRADIENT_COLORS,
    STYLE_GRADIENT_STOPS,
)

def _calculate_distances(size: int) -> np.ndarray:
    y_indices, x_indices = np.ogrid[:size, :size]
    center_y, center_x = size / 2, size / 2
    distances = np.sqrt((x_indices - center_x) ** 2 + (y_indices - center_y) ** 2)
    max_distance = np.sqrt(2 * (size / 2) ** 2)
    return np.clip(distances / max_distance, 0.0, 1.0)

def _interpolate_colors(distances: np.ndarray) -> np.ndarray:
    size = distances.shape[0]
    result = np.zeros((size, size, 3), dtype=np.float32)
    stops = np.array(STYLE_GRADIENT_STOPS)
    colors = np.array(STYLE_GRADIENT_COLORS, dtype=np.float32)

    for i in range(len(stops) - 1):
        mask = (distances >= stops[i]) & (distances <= stops[i + 1])
        if not np.any(mask):
            continue

        range_span = stops[i + 1] - stops[i]
        local_ratio = (distances[mask] - stops[i]) / range_span
        
        for c in range(3):
            result[mask, c] = (
                colors[i, c] * (1 - local_ratio) + colors[i + 1, c] * local_ratio
            )
            
    return result

def _add_texture_noise(image: np.ndarray) -> np.ndarray:
    noise = np.random.normal(0, NOISE_INTENSITY, image.shape).astype(np.float32)
    blurred_noise = cv2.GaussianBlur(noise, NOISE_BLUR_KERNEL, 0)
    return np.clip(image + blurred_noise, 0, 255)

def generate_light_airy_reference(size: int = DEFAULT_STYLE_SIZE) -> np.ndarray:
    distances = _calculate_distances(size)
    gradient_image = _interpolate_colors(distances)
    textured_image = _add_texture_noise(gradient_image)
    return textured_image.astype(np.uint8)
