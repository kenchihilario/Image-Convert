MAX_IMAGE_DIMENSION: int = 2048
DEFAULT_JPEG_QUALITY: int = 95
VALID_IMAGE_FORMATS: tuple[str, ...] = ("JPEG", "PNG", "WEBP")
LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

DEFAULT_STYLE_SIZE: int = 512
STYLE_GRADIENT_COLORS: tuple[tuple[int, int, int], ...] = (
    (255, 255, 224),
    (255, 228, 225),
    (240, 248, 255),
    (255, 255, 255)
)
STYLE_GRADIENT_STOPS: tuple[float, ...] = (0.0, 0.3, 0.7, 1.0)
NOISE_INTENSITY: float = 10.0
NOISE_BLUR_KERNEL: tuple[int, int] = (5, 5)

MODEL_URL: str = "https://tfhub.dev/google/magenta/arbitrary-image-stylization-v1-256/2"
MODEL_URL_FALLBACK: str = "https://www.kaggle.com/models/google/arbitrary-image-stylization-v1/TensorFlow1/256/2"

SHADOW_LIFT_AMOUNT: float = 0.15
HIGHLIGHT_SOFTEN_AMOUNT: float = 0.1
CONTRAST_REDUCTION: float = 0.1
DESATURATION_AMOUNT: float = 0.15
WARMTH_AMOUNT: float = 0.05
