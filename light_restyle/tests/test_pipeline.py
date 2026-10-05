from unittest.mock import MagicMock, patch

import numpy as np
import pytest

from light_restyle.io_utils import InvalidImageError
from light_restyle.pipeline import _blend_images, run_pipeline
from light_restyle.style_transfer import ModelLoadError


def test_blend_images_full_intensity() -> None:
    original = np.zeros((100, 100, 3), dtype=np.uint8)
    stylized = np.ones((50, 50, 3), dtype=np.uint8) * 255
    blended = _blend_images(original, stylized, intensity=1.0)
    assert blended.shape == (100, 100, 3)
    assert blended[0, 0, 0] == 255


def test_blend_images_zero_intensity() -> None:
    original = np.zeros((100, 100, 3), dtype=np.uint8)
    stylized = np.ones((50, 50, 3), dtype=np.uint8) * 255
    blended = _blend_images(original, stylized, intensity=0.0)
    assert blended.shape == (100, 100, 3)
    assert blended[0, 0, 0] == 0


def test_blend_images_half_intensity() -> None:
    original = np.zeros((100, 100, 3), dtype=np.uint8)
    stylized = np.ones((50, 50, 3), dtype=np.uint8) * 200
    blended = _blend_images(original, stylized, intensity=0.5)
    assert blended.shape == (100, 100, 3)
    assert 90 < blended[0, 0, 0] < 110


@patch("light_restyle.pipeline.save_image")
@patch("light_restyle.pipeline.stylize")
@patch("light_restyle.pipeline.load_image")
def test_run_pipeline_success(mock_load: MagicMock, mock_stylize: MagicMock, mock_save: MagicMock) -> None:
    mock_load.return_value = np.zeros((100, 100, 3), dtype=np.uint8)
    mock_stylize.return_value = np.zeros((100, 100, 3), dtype=np.uint8)
    
    run_pipeline("input.jpg", "output.jpg", intensity=0.8)
    
    mock_load.assert_called_once_with("input.jpg")
    mock_stylize.assert_called_once()
    mock_save.assert_called_once()


@patch("light_restyle.pipeline.load_image")
def test_run_pipeline_load_error(mock_load: MagicMock) -> None:
    mock_load.side_effect = InvalidImageError("Bad image")
    with pytest.raises(InvalidImageError):
        run_pipeline("input.jpg", "output.jpg")


@patch("light_restyle.pipeline.stylize")
@patch("light_restyle.pipeline.load_image")
def test_run_pipeline_model_error(mock_load: MagicMock, mock_stylize: MagicMock) -> None:
    mock_load.return_value = np.zeros((100, 100, 3), dtype=np.uint8)
    mock_stylize.side_effect = ModelLoadError("Model failed")
    
    with pytest.raises(ModelLoadError):
        run_pipeline("input.jpg", "output.jpg")
