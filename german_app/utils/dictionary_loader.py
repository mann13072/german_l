import requests
import os
from .text_utils import strip_german_article

class DictionaryLoader:
    """
    Fetches word definitions and IPA pronunciations from Free Dictionary API (Wiktionary-based).
    """
    BASE_URL = "https://freedictionaryapi.com/api/v1/entries/de/{word}"

    @classmethod
    def get_definition(cls, word):
        """
        Fetches definition and IPA for a German word.
        Returns a dict with definition and ipa, or None if not found.
        """
        try:
            # 1. Strip German articles (Der, Die, Das) if present
            # Dictionary APIs usually want the base noun (e.g., 'Haltestelle' instead of 'Die Haltestelle')
            base_word = strip_german_article(word)
            
            # The API prefers capitalized nouns in German
            # Let's try capitalized first
            lookup_word = base_word.capitalize()
            
            response = requests.get(cls.BASE_URL.format(word=lookup_word), timeout=5)
            
            # If not found, try lowercased (for verbs, adjectives, etc.)
            if response.status_code == 404:
                response = requests.get(cls.BASE_URL.format(word=base_word.lower()), timeout=5)
                
            if response.status_code != 200:
                return None
                
            data = response.json()
            if not data.get('entries'):
                return None
                
            entry = data['entries'][0]
            
            # Extract IPA
            ipa = None
            if entry.get('pronunciations'):
                for p in entry['pronunciations']:
                    if p.get('type') == 'ipa':
                        ipa = p.get('text')
                        break
            
            # Extract first sense definition
            definition = None
            if entry.get('senses') and len(entry['senses']) > 0:
                definition = entry['senses'][0].get('definition')
            
            if not definition and not ipa:
                return None
                
            return {
                "word": data.get('word', word),
                "definition": definition,
                "ipa": ipa,
                "partOfSpeech": entry.get('partOfSpeech')
            }
            
        except Exception as e:
            print(f"Error fetching definition for {word}: {e}")
            return None
