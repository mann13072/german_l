import unicodedata
import re

def strip_german_article(text: str) -> str:
    """
    Removes common German articles (der, die, das) from the start of a string.
    Useful for dictionary lookups where articles aren't part of the headword.
    """
    if not isinstance(text, str):
        return ""
    
    # Remove articles at the start (case-insensitive)
    pattern = r'^(der|die|das)\s+'
    return re.sub(pattern, '', text, flags=re.IGNORECASE).strip()

def normalize_text(text: str) -> str:
    """
    Normalize German text for comparison in quiz answers.
    """
    if not isinstance(text, str):
        return ""
    
    # Convert to lowercase
    text = text.lower()
    
    # Normalize unicode NFD (decompose accented characters)
    text = unicodedata.normalize('NFD', text)
    
    # Remove diacritical marks but keep base characters
    # This converts ä → a, ö → o, ü → u, ß → ss
    text = ''.join(
        char for char in text
        if unicodedata.category(char) != 'Mn'  # Mn = Nonspacing_Mark
    )
    
    # Remove punctuation and special characters (except spaces)
    text = re.sub(r'[.!?,;:"—–\-()[\]{}<>]', '', text)
    
    # Normalize whitespace (multiple spaces → single space)
    text = re.sub(r'\s+', ' ', text)
    
    # Strip leading/trailing whitespace
    return text.strip()
