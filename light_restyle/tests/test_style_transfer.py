from unittest.mock import MagicMock, patch

import numpy as np
import pytest
import tensorflow as tf

from light_restyle.style_transfer import ModelLoadError, StyleTransferEngine, stylize

@patch("light_restyle.style_transfer.hub.load")
def test_style_transfer_engine_load_success(mock_load: MagicMock) -> None:
    mock_model = MagicMock()
    mock_load.return_value = mock_model
    
    engine = StyleTransferEngine()
    engine._load_model()
    
    mock_load.assert_called_once()
    assert engine.model == mock_model

@patch("light_restyle.style_transfer.hub.load")
def test_style_transfer_engine_load_failure(mock_load: MagicMock) -> None:
    mock_load.side_effect = Exception("Download failed")
    
    engine = StyleTransferEngine()
    with pytest.raises(ModelLoadError):
        engine._load_model()

@patch("light_restyle.style_transfer.StyleTransferEngine._load_model")
def test_stylize_function(mock_load_model: MagicMock) -> None:
    content = np.zeros((64, 64, 3), dtype=np.uint8)
    style = np.zeros((64, 64, 3), dtype=np.uint8)
    
    engine = StyleTransferEngine.get_instance()
    mock_model = MagicMock()
    
    mock_tensor = tf.constant(np.zeros((1, 64, 64, 3), dtype=np.float32))
    mock_model.return_value = [mock_tensor]
    engine.model = mock_model
    
    result = stylize(content, style)
    
    assert result.shape == (64, 64, 3)
    assert result.dtype == np.uint8
