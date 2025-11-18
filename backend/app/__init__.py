from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_socketio import SocketIO
from app.routes.orders import orders_bp

db = SQLAlchemy()
migrate = Migrate()
socketio = SocketIO(cors_allowed_origins="*")

def create_app():
    app = Flask(__name__)
    app.config.from_object("config")

    CORS(app)
    db.init_app(app)
    migrate.init_app(app, db)

    # import models so Alembic can see them
    from app.models import Reservation  

    # register routes
    from app.routes import reservations
    app.register_blueprint(reservations.bp)
    app.register_blueprint(orders_bp, url_prefix="/api/orders")
    return app

