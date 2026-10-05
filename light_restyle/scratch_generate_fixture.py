import os
import numpy as np
from PIL import Image

fixture_dir = "tests/fixtures"
os.makedirs(fixture_dir, exist_ok=True)
array = np.zeros((100, 100, 3), dtype=np.uint8)
array[:, :50] = [255, 0, 0]
array[:, 50:] = [0, 255, 0]
image = Image.fromarray(array)
image.save(os.path.join(fixture_dir, "sample_input.jpg"))
image.save(os.path.join(fixture_dir, "sample_input.png"))
with open(os.path.join(fixture_dir, "bad_input.jpg"), "w") as bad_file:
    bad_file.write("not an image")
