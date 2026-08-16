from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_pymongo import PyMongo

from .config import Config

mongo = PyMongo()
jwt = JWTManager()


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    CORS(app, resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}}, supports_credentials=True)
    mongo.init_app(app)
    jwt.init_app(app)

    from .api.auth import auth_bp
    from .api.predictions import predictions_bp
    from .api.admin import admin_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(predictions_bp, url_prefix="/api/predictions")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok", "service": "fake-news-detection-flask"})

    @app.errorhandler(413)
    def request_too_large(_error):
        return jsonify({"error": "Request is too large."}), 413

    return app
