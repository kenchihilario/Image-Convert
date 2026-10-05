# Light Restyle

An image stylization tool I made in my free time because I wanted to learn more about TensorFlow, computational photography, and procedural generation.

The tool turns ordinary photos into light, airy, high-key versions. It uses Python for the core logic, combining a TensorFlow Hub neural style transfer model with a deterministic color grading pipeline. I'm also experimenting with creating a simple web app for it.

It's still a work in progress, so I'm mostly using this project to learn, experiment, and add things whenever I have time.

## What I'm Using

- **Python 3.10+** for the core pipeline
- **TensorFlow / TF Hub** for the neural style transfer
- **Pillow & NumPy** for image processing and color grading
- **Vanilla HTML/CSS/JS** for the experimental web app
- **Pytest** for testing the pipeline

## How It Works

The project is split into a few different parts:

- **CLI Tool** – A Python command-line interface that runs the pipeline on your local images.
- **Procedural Style Generator** – Instead of needing a reference photo, the code procedurally generates a soft pastel radial gradient with texture noise to use as the style reference.
- **Color Grading Pipeline** – Fine-tunes the output to consistently hit that "high-key" aesthetic.
- **Web App** – An experimental frontend to play with the filters directly in the browser.

## Requirements

If you want to run the project, you'll mainly need:

- Python 3.10 or newer

## Running It

First, clone the repo and install it locally:

```bash
pip install -e .
```

Then you can run the pipeline using the command line:

```bash
light-restyle run --input photo.jpg --output result.jpg --intensity 0.8
```

*(Note: The first run might take a little while since it has to download the TF Hub model (~100MB) to your local `models/` directory. After that, it runs completely offline.)*

## Project Structure

- `src/light_restyle/` – The core Python package (pipeline, color grading, TF logic)
- `tests/` – Pytest test files
- `webapp/` – Experimental HTML/JS frontend
- `models/` – Local cache for the downloaded TensorFlow model

## Customizing the Style Reference

By default, the tool procedurally generates a reference image. If you want to use your own custom reference image:

1. Open `src/light_restyle/pipeline.py`.
2. Replace `style_reference = generate_light_airy_reference()` with `style_reference = load_image("path/to/your/custom_style.jpg")`.
3. Adjust the sizes if necessary in `config.py`.

## Why I Made This

This started as a project I wanted to work on in my free time. I wanted to see if I could reliably turn any photo into a bright, soft, "high-key" image without having to fiddle with Photoshop sliders every time.

I'm also using it as a way to learn more about TensorFlow, image processing math with NumPy, and how to package a Python CLI tool.

There will probably be a lot of things that get changed as I keep working on it, but that's part of the fun.

## Status

Work in progress.

I'm still adding features, tweaking the color grading math, and experimenting with the web app interface.
