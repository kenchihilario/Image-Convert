# light_restyle

A deterministic, high-key image stylization tool that turns ordinary photos into light and airy versions. It uses a TensorFlow Hub style transfer model combined with a deterministic color grading pipeline to consistently hit a high-key look.

## Installation

1. Ensure you have Python 3.10+ installed.
2. Clone this repository and navigate into the `light_restyle` directory.
3. Install the package and its dependencies:
```bash
pip install -e .
```
4. This registers the `light-restyle` command-line tool.

*Note: On your first run, the tool will automatically download the pretrained TensorFlow Hub model (~100MB) into a local `models/` directory. Subsequent runs will use the cached model and execute completely offline.*

## CLI Usage

Run the pipeline using the `light-restyle` command:

```bash
light-restyle run --input photo.jpg --output result.jpg --intensity 0.8
```

Options:
- `--input`: Path to the input image (JPEG, PNG, WEBP).
- `--output`: Path to save the stylized image.
- `--intensity`: Blend factor between 0.0 (original image) and 1.0 (fully stylized). Defaults to 1.0.

## Swapping the Procedural Style Reference

By default, the tool procedurally generates a soft pastel radial gradient with texture noise to use as the style reference. If you want to use your own custom reference image:

1. Open `src/light_restyle/pipeline.py`.
2. Replace `style_reference = generate_light_airy_reference()` with `style_reference = load_image("path/to/your/custom_style.jpg")`.
3. Adjust the sizes if necessary in `config.py`.
