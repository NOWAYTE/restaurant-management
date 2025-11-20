# backend/app/models/menu_item.py
from datetime import datetime
from app.extensions import db

class MenuItem(db.Model):
    __tablename__ = "menu_items"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    category = db.Column(db.String(50), nullable=False)  # e.g., "appetizer", "main", "dessert"
    is_available = db.Column(db.Boolean, default=True)
    image_url = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    order_items = db.relationship('OrderItem', back_populates='menu_item', lazy=True)
    inventory_items = db.relationship('InventoryItem', back_populates='menu_item', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'price': float(self.price) if self.price else 0.0,
            'category': self.category,
            'is_available': self.is_available,
            'image_url': self.image_url
        }