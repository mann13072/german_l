import json
from typing import Dict, Optional, Any
from ..config import Config

_cached_data: Optional[Dict[str, Any]] = None

def load_data() -> Dict[str, Any]:
    """
    Load and cache German learning content from JSON file.
    """
    global _cached_data
    if _cached_data is None:
        try:
            with open(Config.DATA_PATH, "r", encoding="utf-8") as f:
                _cached_data = json.load(f)
        except FileNotFoundError:
            raise FileNotFoundError(f"Data file not found at {Config.DATA_PATH}")
        except json.JSONDecodeError as e:
            raise json.JSONDecodeError(f"Invalid JSON in {Config.DATA_PATH}", e.doc, e.pos)
    
    return _cached_data
