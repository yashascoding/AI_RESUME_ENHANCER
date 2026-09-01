import sys
from pathlib import Path

# Ensure project root is on sys.path so `app.*` and `graph.*` resolve
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
