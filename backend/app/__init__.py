from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_socketio import SocketIO
from app.extensions import db
from datetime import timedelta
from flask_jwt_extended import JWTManager
from .socketio import init_socketio, socketio
# Import config from the root directory
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))
from config import SQLALCHEMY_DATABASE_URI, SQLALCHEMY_TRACK_MODIFICATIONS, SECRET_KEY

class Config:
    SQLALCHEMY_DATABASE_URI = SQLALCHEMY_DATABASE_URI
    SQLALCHEMY_TRACK_MODIFICATIONS = SQLALCHEMY_TRACK_MODIFICATIONS
    SECRET_KEY = SECRET_KEY
    JWT_SECRET_KEY = SECRET_KEY  # Add JWT secret key
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)  # Token expires in 24 hours
migrate = Migrate()
jwt = JWTManager()
def create_app():
    app = Flask(__name__)
    app.config.from_object("config")

    CORS(
    app,
    supports_credentials=True,
    origins=["http://localhost:3000"],
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    socketio = init_socketio(app)

    app.config['JWT_SECRET_KEY'] = Config.JWT_SECRET_KEY
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)

    # Create default admin user if it doesn't exist
    with app.app_context():
        from app.models.user import User
        admin_email = "admin@example.com"
        admin = User.query.filter_by(email=admin_email).first()
        
        if not admin:
            admin = User(
                email=admin_email,
                name="Admin User",
                role="admin"
            )
            admin.set_password("admin123")  # Change this to a secure password in production
            db.session.add(admin)
            db.session.commit()
            print("\n=== Created default admin user ===")
            print(f"Email: {admin_email}")
            print("Password: admin123")
            print("==============================\n")

    # Import models here to avoid circular imports
    from app.models.reservation import Reservation
    from app.models.menu_item import MenuItem
    from app.models.inventory_item import InventoryItem
    from app.models.order import Order, OrderItem

    from app.routes.auth import auth_bp
    from app.routes.customer import customer_bp
    from app.routes.kitchen import kitchen_bp
    from app.routes.admin import admin_bp
    from app.routes.orders import orders_bp
    from app.routes.dashboard import dashboard_bp


    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(customer_bp, url_prefix='/api/customer')
    app.register_blueprint(kitchen_bp, url_prefix='/api/kitchen')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(orders_bp, url_prefix='/api/orders')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')


    # Register blueprints
    from app.routes import reservations
    from app.routes.menu import menu_bp
    
    app.register_blueprint(reservations.bp)
    app.register_blueprint(menu_bp, url_prefix="/api/menu")

    return app


