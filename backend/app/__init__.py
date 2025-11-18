from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_socketio import SocketIO
from app.extensions import db


migrate = Migrate()

def create_app():
    app = Flask(__name__)
    app.config.from_object("config")

    CORS(app)
    db.init_app(app)
    migrate.init_app(app, db)

    # Import models here to avoid circular imports
    from app.models.reservation import Reservation
    from app.models.menu_item import MenuItem
    from app.models.inventory_item import InventoryItem
    from app.models.order import Order, OrderItem

    # Register blueprints
    from app.routes import reservations
    from app.routes.orders import orders_bp
    from app.routes.menu import menu_bp
    
    app.register_blueprint(reservations.bp)
    app.register_blueprint(orders_bp, url_prefix="/api/orders")
    app.register_blueprint(menu_bp, url_prefix="/api/menu")

    return app
