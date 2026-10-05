import numpy as np

from light_restyle.style_reference import (
    _calculate_distances,
    _interpolate_colors,
    _add_texture_noise,
    generate_light_airy_reference,
)

def test_calculate_distances() -> None:
    distances = _calculate_distances(100)
    assert distances.shape == (100, 100)
    assert np.min(distances) >= 0.0
    assert np.max(distances) <= 1.0

def test_interpolate_colors() -> None:
    distances = np.array([[0.0, 0.5], [1.0, 0.1]])
    colors = _interpolate_colors(distances)
    assert colors.shape == (2, 2, 3)
    assert np.all(colors[0, 0] == np.array([255, 255, 224]))

def test_add_texture_noise() -> None:
    image = np.zeros((50, 50, 3), dtype=np.float32)
    textured = _add_texture_noise(image)
    assert textured.shape == (50, 50, 3)
    assert np.max(textured) <= 255
    assert np.min(textured) >= 0

def test_generate_light_airy_reference() -> None:
    image = generate_light_airy_reference(size=128)
    assert image.shape == (128, 128, 3)
    assert image.dtype == np.uint8
