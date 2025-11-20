from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_socketio import SocketIO
from app.extensions import db
from app.config import Config
from datetime import timedelta
from flask_jwt_extended import JWTManager

migrate = Migrate()

def create_app():
    app = Flask(__name__)
    app.config.from_object("config")

    CORS(app)
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    app.config['JWT_SECRET_KEY'] = Config.JWT_SECRET_KEY
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)

    # Import models here to avoid circular imports
    from app.models.reservation import Reservation
    from app.models.menu_item import MenuItem
    from app.models.inventory_item import InventoryItem
    from app.models.order import Order, OrderItem

    from app.routes.auth import auth_bp
    from app.routes.customer import customer_bp
    from app.routes.kitchen import kitchen_bp
    from app.routes.admin import admin_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(customer_bp, url_prefix='/api/customer')
    app.register_blueprint(kitchen_bp, url_prefix='/api/kitchen')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')


    # Register blueprints
    from app.routes import reservations
    from app.routes.orders import orders_bp
    from app.routes.menu import menu_bp
    
    app.register_blueprint(reservations.bp)
    app.register_blueprint(orders_bp, url_prefix="/api/orders")
    app.register_blueprint(menu_bp, url_prefix="/api/menu")

    return app
