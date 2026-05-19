import os
import sys

ROOT_DIR = os.path.dirname(
    os.path.dirname(__file__)
)

sys.path.insert(0, ROOT_DIR)

from backend.app import create_app

app = create_app()