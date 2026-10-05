import sys

import click

from light_restyle.io_utils import InvalidImageError, get_logger
from light_restyle.pipeline import run_pipeline
from light_restyle.style_transfer import ModelLoadError

logger = get_logger("light_restyle.cli")

@click.group()
@click.version_option(version="0.1.0")
def cli() -> None:
    pass

@cli.command()
@click.option("--input", "input_path", required=True, type=click.Path(exists=True, dir_okay=False))
@click.option("--output", "output_path", required=True, type=click.Path(dir_okay=False))
@click.option("--intensity", type=float, default=1.0)
def run(input_path: str, output_path: str, intensity: float) -> None:
    try:
        run_pipeline(input_path, output_path, intensity)
        logger.info("Pipeline completed successfully")
        sys.exit(0)
    except InvalidImageError:
        logger.error("Failed due to invalid input image")
        sys.exit(1)
    except ModelLoadError:
        logger.error("Failed due to model load error")
        sys.exit(2)
    except Exception as error:
        logger.error(f"Failed due to unexpected error: {error}")
        sys.exit(3)
