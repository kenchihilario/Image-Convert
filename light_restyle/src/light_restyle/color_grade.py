import cv2
import numpy as np

from light_restyle.config import (
    CONTRAST_REDUCTION,
    DESATURATION_AMOUNT,
    HIGHLIGHT_SOFTEN_AMOUNT,
    SHADOW_LIFT_AMOUNT,
    WARMTH_AMOUNT,
)


def lift_shadows(image: np.ndarray, amount: float) -> np.ndarray:
    float_img = image.astype(np.float32) / 255.0
    lifted = float_img + amount * (1.0 - float_img) ** 2
    return np.clip(lifted * 255.0, 0, 255).astype(np.uint8)


def soften_highlights(image: np.ndarray, amount: float) -> np.ndarray:
    float_img = image.astype(np.float32) / 255.0
    softened = float_img - amount * float_img ** 2
    return np.clip(softened * 255.0, 0, 255).astype(np.uint8)


def reduce_contrast(image: np.ndarray, amount: float) -> np.ndarray:
    float_img = image.astype(np.float32) / 255.0
    mean_luminance = 0.5
    reduced = mean_luminance + (float_img - mean_luminance) * (1.0 - amount)
    return np.clip(reduced * 255.0, 0, 255).astype(np.uint8)


def desaturate(image: np.ndarray, amount: float) -> np.ndarray:
    hsv = cv2.cvtColor(image, cv2.COLOR_RGB2HSV).astype(np.float32)
    hsv[..., 1] = hsv[..., 1] * (1.0 - amount)
    hsv[..., 1] = np.clip(hsv[..., 1], 0, 255)
    return cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2RGB)


def apply_warm_white_balance(image: np.ndarray, amount: float) -> np.ndarray:
    float_img = image.astype(np.float32)
    float_img[..., 0] = float_img[..., 0] * (1.0 + amount)
    float_img[..., 2] = float_img[..., 2] * (1.0 - amount)
    return np.clip(float_img, 0, 255).astype(np.uint8)


def apply_light_airy_grade(image: np.ndarray) -> np.ndarray:
    graded = lift_shadows(image, SHADOW_LIFT_AMOUNT)
    graded = soften_highlights(graded, HIGHLIGHT_SOFTEN_AMOUNT)
    graded = reduce_contrast(graded, CONTRAST_REDUCTION)
    graded = desaturate(graded, DESATURATION_AMOUNT)
    graded = apply_warm_white_balance(graded, WARMTH_AMOUNT)
    return graded
