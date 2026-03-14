import requests
import os

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
            # The API seems to prefer capitalized nouns in German
            # But let's try as is first, then capitalized if it's a noun
            response = requests.get(cls.BASE_URL.format(word=word), timeout=5)
            
            # If not found, try capitalized (common for German nouns)
            if response.status_code == 404 and not word[0].isupper():
                response = requests.get(cls.BASE_URL.format(word=word.capitalize()), timeout=5)
                
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
