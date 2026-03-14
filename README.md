# 🇩🇪 German Learning App (Modular)

A modular, production-ready Flask application for learning German (A1 to B2).

## 🚀 Features
- **Roadmap**: Interactive level progression.
- **Vocabulary**: Flashcards and quizzes with progress tracking.
- **Sentences**: Dynamic sentence-building exercises.
- **Modular Architecture**: Clean separation of concerns (routes, utils, config).
- **Security**: XSS protection and input validation.
- **Persistence**: Progress saved via `localStorage` with in-memory fallbacks.
- **Theming**: Support for Light and Dark modes.

## 📁 Project Structure
```text
german_l/
├── app.py                      # Main entry point
├── german_app/                 # App package
│   ├── config.py               # Configuration
│   ├── routes/                 # Blueprints for Main and API routes
│   └── utils/                  # Data loading and text normalization
├── data/                       # JSON content
├── static/                     # CSS, JS, and Images
├── templates/                  # Jinja2 HTML templates
└── requirements.txt            # Python dependencies
```

## 🛠️ Setup & Running

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the App**:
   ```bash
   python app.py
   ```

3. **Access the App**:
   Open `http://localhost:8080` in your browser.

## 🧪 Testing
- **Health Check**: `GET /api/health`
- **Quiz**: Visit any `/vocab/<level>` page.
- **Sentences**: Visit any `/sentences/<level>` page.

## 📜 License
MIT
