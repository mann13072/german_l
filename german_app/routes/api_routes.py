from flask import Blueprint, jsonify, request, current_app
from ..utils.text_utils import normalize_text
from ..utils.data_loader import load_data
from ..utils.audio_manager import AudioManager
from ..utils.dictionary_loader import DictionaryLoader

api_bp = Blueprint('api', __name__, url_prefix='/api')

@api_bp.route("/check-sentence", methods=["POST"])
def check_sentence():
    try:
        payload = request.get_json(silent=True)
        if not payload:
            return jsonify({"error": "Invalid request", "message": "JSON required"}), 400
        
        user_answer = payload.get("answer")
        correct_answer = payload.get("correct")
        
        if user_answer is None or correct_answer is None:
            return jsonify({"error": "Missing required fields"}), 400
        
        user_clean = normalize_text(str(user_answer)[:500])
        correct_clean = normalize_text(str(correct_answer)[:500])
        
        is_correct = user_clean == correct_clean
        
        return jsonify({
            "correct": is_correct,
            "expected": correct_answer,
            "user_normalized": user_clean,
            "correct_normalized": correct_clean
        })
    except Exception as e:
        current_app.logger.error(f"Error in check_sentence: {str(e)}")
        return jsonify({"error": "Server error"}), 500

@api_bp.route("/audio-url", methods=["GET"])
def get_audio_url():
    """Returns the URL for a word's pronunciation."""
    word = request.args.get('word')
    if not word:
        return jsonify({"error": "Word required"}), 400
    
    # Try to find high-quality native audio
    url = AudioManager.get_audio_url(word)
    return jsonify({"url": url})

@api_bp.route("/define/<word>", methods=["GET"])
def get_definition(word):
    """Returns the definition and IPA for a word."""
    if not word:
        return jsonify({"error": "Word required"}), 400
    
    data = DictionaryLoader.get_definition(word)
    if not data:
        return jsonify({"error": "Definition not found"}), 404
        
    return jsonify(data)

@api_bp.route("/health", methods=["GET"])
def health():
    try:
        load_data()
        return jsonify({"status": "healthy"}), 200
    except Exception as e:
        return jsonify({"status": "unhealthy", "error": str(e)}), 500
