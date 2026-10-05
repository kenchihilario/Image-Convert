from pathlib import Path
from unittest.mock import MagicMock, patch

from click.testing import CliRunner

from light_restyle.cli import cli
from light_restyle.io_utils import InvalidImageError
from light_restyle.style_transfer import ModelLoadError

@patch("light_restyle.cli.run_pipeline")
def test_cli_run_success(mock_run: MagicMock, tmp_path: Path) -> None:
    runner = CliRunner()
    input_file = tmp_path / "input.jpg"
    input_file.touch()

    result = runner.invoke(
        cli, ["run", "--input", str(input_file), "--output", "out.jpg", "--intensity", "0.8"]
    )

    assert result.exit_code == 0
    mock_run.assert_called_once_with(str(input_file), "out.jpg", 0.8)

@patch("light_restyle.cli.run_pipeline")
def test_cli_run_invalid_image(mock_run: MagicMock, tmp_path: Path) -> None:
    mock_run.side_effect = InvalidImageError("bad image")
    runner = CliRunner()
    input_file = tmp_path / "input.jpg"
    input_file.touch()

    result = runner.invoke(cli, ["run", "--input", str(input_file), "--output", "out.jpg"])
    assert result.exit_code == 1

@patch("light_restyle.cli.run_pipeline")
def test_cli_run_model_error(mock_run: MagicMock, tmp_path: Path) -> None:
    mock_run.side_effect = ModelLoadError("model error")
    runner = CliRunner()
    input_file = tmp_path / "input.jpg"
    input_file.touch()

    result = runner.invoke(cli, ["run", "--input", str(input_file), "--output", "out.jpg"])
    assert result.exit_code == 2
