"""Tests for frontend TypeScript types (import validation)."""
import subprocess
import os


def test_frontend_typescript_compiles():
    """Verify the frontend TypeScript compiles without errors."""
    frontend_dir = os.path.join(os.path.dirname(__file__), "..", "frontend")
    result = subprocess.run(
        ["npx", "tsc", "--noEmit"],
        cwd=frontend_dir,
        capture_output=True,
        text=True,
        timeout=60,
    )
    assert result.returncode == 0, f"TypeScript errors:\n{result.stderr}"


def test_frontend_build():
    """Verify the frontend builds successfully."""
    frontend_dir = os.path.join(os.path.dirname(__file__), "..", "frontend")
    result = subprocess.run(
        ["npx", "vite", "build"],
        cwd=frontend_dir,
        capture_output=True,
        text=True,
        timeout=120,
    )
    assert result.returncode == 0, f"Build failed:\n{result.stderr}"
    assert "built in" in result.stdout.lower() or "✓" in result.stdout
