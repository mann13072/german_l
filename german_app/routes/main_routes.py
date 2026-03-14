from flask import Blueprint, render_template, current_app
from ..utils.data_loader import load_data

main_bp = Blueprint('main', __name__)

@main_bp.route("/")
def index():
    try:
        data = load_data()
        return render_template("index.html", levels=data["levels"])
    except Exception as e:
        current_app.logger.error(f"Error in index route: {str(e)}")
        return render_template("error.html", error="Could not load content"), 500

@main_bp.route("/vocab/<level>")
def vocab(level):
    try:
        data = load_data()
        level_data = next(
            (l for l in data["levels"] if l["id"] == level.lower()),
            None
        )
        
        if not level_data:
            return "Level not found", 404
        
        # Merge all vocab sections into one for simplified UI
        merged_words = []
        for sec in level_data.get("vocab_sections", []):
            merged_words.extend(sec.get("words", []))
        
        merged_section = {
            "id": "all_vocab",
            "title": "All Vocabulary",
            "words": merged_words
        }
        
        # We don't want to modify the cached data in-place
        # But for this app's simplified logic, we just pass the modified level_data
        # Create a shallow copy to be safer
        display_level_data = level_data.copy()
        display_level_data["vocab_sections"] = [merged_section]
        
        return render_template(
            "vocab.html",
            level=display_level_data,
            all_levels=data["levels"]
        )
    except Exception as e:
        current_app.logger.error(f"Error in vocab route for level {level}: {str(e)}")
        return render_template("error.html", error="Could not load vocabulary"), 500

@main_bp.route("/sentences/<level>")
def sentences(level):
    try:
        data = load_data()
        level_data = next(
            (l for l in data["levels"] if l["id"] == level.lower()),
            None
        )
        
        if not level_data:
            return "Level not found", 404
        
        return render_template(
            "sentences.html",
            level=level_data,
            all_levels=data["levels"]
        )
    except Exception as e:
        current_app.logger.error(f"Error in sentences route for level {level}: {str(e)}")
        return render_template("error.html", error="Could not load sentences"), 500
