# Code Style Rules — light_restyle

- No comments anywhere in source files: no `#` inline comments, no
  docstrings, no commented-out code, no TODO markers.
- Every function and method signature uses full type hints (PEP 484).
- Function and variable names must be descriptive enough to replace
  what a comment would have explained. No abbreviations.
- No magic numbers or literals scattered in logic — all constants
  live in config.py.
- No print() calls. Use the logging module configured in io_utils.py.
- Each module holds either one class or a small set of single-purpose
  pure functions.
- Max function length: 40 lines. Split anything longer.
- Every new function ships with a pytest test in tests/.
- All documentation lives in README.md / ARCHITECTURE.md — never in
  the code itself.
