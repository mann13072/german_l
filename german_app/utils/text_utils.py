import unicodedata
import re

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
