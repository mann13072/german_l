from flask import Flask, render_template
from .config import Config

def create_app():
    app = Flask(__name__, 
                template_folder='../templates', 
                static_folder='../static')
    app.config.from_object(Config)

    from .routes.main_routes import main_bp
    from .routes.api_routes import api_bp

    app.register_blueprint(main_bp)
    app.register_blueprint(api_bp)

    @app.errorhandler(404)
    def not_found(error):
        return render_template("error.html", error="Page not found"), 404

    @app.errorhandler(500)
    def server_error(error):
        return render_template("error.html", error="Server error"), 500

    return app
