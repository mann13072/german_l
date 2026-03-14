import os
import requests
from flask import current_app

class AudioManager:
    """
    Handles fetching native human audio from Forvo API.
    """
    FORVO_API_KEY = os.environ.get('FORVO_API_KEY')
    BASE_URL = "https://apifree.forvo.com/key/{key}/format/json/action/word-pronunciations/word/{word}/language/de"

    @classmethod
    def get_audio_url(cls, word):
        if not cls.FORVO_API_KEY:
            return None
        
        try:
            url = cls.BASE_URL.format(key=cls.FORVO_API_KEY, word=word)
            response = requests.get(url, timeout=5)
            data = response.json()
            
            if data.get('items'):
                # Return the top-rated pronunciation
                return data['items'][0].get('pathmp3')
        except Exception as e:
            print(f"Error fetching audio for {word}: {e}")
        return None

    @classmethod
    def download_audio(cls, word, save_path):
        """Downloads the mp3 for a word if it doesn't exist."""
        if os.path.exists(save_path):
            return True
            
        audio_url = cls.get_audio_url(word)
        if not audio_url:
            return False
            
        try:
            r = requests.get(audio_url)
            with open(save_path, 'wb') as f:
                f.write(r.content)
            return True
        except Exception as e:
            print(f"Download failed for {word}: {e}")
            return False
