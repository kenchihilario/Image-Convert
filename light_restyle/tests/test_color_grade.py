import numpy as np

from light_restyle.color_grade import (
    apply_light_airy_grade,
    apply_warm_white_balance,
    desaturate,
    lift_shadows,
    reduce_contrast,
    soften_highlights,
)


def test_lift_shadows() -> None:
    image = np.array([[[0, 0, 0], [255, 255, 255]]], dtype=np.uint8)
    graded = lift_shadows(image, amount=0.5)
    assert graded[0, 0, 0] > 0
    assert graded[0, 1, 0] == 255


def test_soften_highlights() -> None:
    image = np.array([[[0, 0, 0], [255, 255, 255]]], dtype=np.uint8)
    graded = soften_highlights(image, amount=0.5)
    assert graded[0, 0, 0] == 0
    assert graded[0, 1, 0] < 255


def test_reduce_contrast() -> None:
    image = np.array([[[0, 0, 0], [255, 255, 255]]], dtype=np.uint8)
    graded = reduce_contrast(image, amount=0.5)
    assert graded[0, 0, 0] > 0
    assert graded[0, 1, 0] < 255


def test_desaturate() -> None:
    image = np.array([[[255, 0, 0]]], dtype=np.uint8)
    graded = desaturate(image, amount=0.5)
    assert graded[0, 0, 0] == 255
    assert graded[0, 0, 1] > 0
    assert graded[0, 0, 2] > 0


def test_apply_warm_white_balance() -> None:
    image = np.array([[[100, 100, 100]]], dtype=np.uint8)
    graded = apply_warm_white_balance(image, amount=0.1)
    assert graded[0, 0, 0] > 100
    assert graded[0, 0, 2] < 100


def test_apply_light_airy_grade() -> None:
    image = np.zeros((10, 10, 3), dtype=np.uint8)
    graded = apply_light_airy_grade(image)
    assert graded.shape == (10, 10, 3)
    assert graded.dtype == np.uint8
