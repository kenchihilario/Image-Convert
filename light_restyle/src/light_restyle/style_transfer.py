import os
from typing import Any, Optional

import numpy as np
import tensorflow as tf
import tensorflow_hub as hub

from light_restyle.config import MODEL_URL, MODEL_URL_FALLBACK

class ModelLoadError(Exception):
    pass

class StyleTransferEngine:
    _instance: Optional["StyleTransferEngine"] = None

    def __init__(self) -> None:
        self.model: Optional[Any] = None
        os.environ["TFHUB_CACHE_DIR"] = os.path.join(os.getcwd(), "models")

    @classmethod
    def get_instance(cls) -> "StyleTransferEngine":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def _load_model(self) -> None:
        if self.model is not None:
            return

        try:
            self.model = hub.load(MODEL_URL)
        except Exception:
            try:
                self.model = hub.load(MODEL_URL_FALLBACK)
            except Exception as e:
                raise ModelLoadError(str(e)) from e

    def stylize(self, content: np.ndarray, style: np.ndarray) -> np.ndarray:
        self._load_model()

        content_tensor = tf.convert_to_tensor(content, dtype=tf.float32)
        content_tensor = content_tensor / 255.0
        content_tensor = tf.expand_dims(content_tensor, axis=0)

        style_tensor = tf.convert_to_tensor(style, dtype=tf.float32)
        style_tensor = style_tensor / 255.0
        style_tensor = tf.expand_dims(style_tensor, axis=0)

        if self.model is None:
            raise ModelLoadError("Model failed to load.")

        results = self.model(tf.constant(content_tensor), tf.constant(style_tensor))
        stylized_image = results[0]

        stylized_image = tf.squeeze(stylized_image, axis=0)
        stylized_image = stylized_image * 255.0
        return np.clip(stylized_image.numpy(), 0, 255).astype(np.uint8)

def stylize(content: np.ndarray, style: np.ndarray) -> np.ndarray:
    engine = StyleTransferEngine.get_instance()
    return engine.stylize(content, style)
