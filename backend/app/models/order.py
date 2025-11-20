# backend/app/models/order.py
from datetime import datetime
from app.extensions import db

class Order(db.Model):
    __tablename__ = 'orders'
    
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    customer_name = db.Column(db.String(100), nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, confirmed, preparing, ready, completed, cancelled
    total_amount = db.Column(db.Numeric(10, 2), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    customer = db.relationship('User', back_populates='orders')
    order_items = db.relationship('OrderItem', back_populates='order', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'customer_id': self.customer_id,
            'customer_name': self.customer_name,
            'status': self.status,
            'total_amount': float(self.total_amount) if self.total_amount else 0.0,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'order_items': [item.to_dict() for item in self.order_items]
        }

class OrderItem(db.Model):
    __tablename__ = 'order_items'
    
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    menu_item_id = db.Column(db.Integer, db.ForeignKey('menu_items.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    special_requests = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    order = db.relationship('Order', back_populates='order_items')
    menu_item = db.relationship('MenuItem', back_populates='order_items')
    
    def to_dict(self):
        return {
            'id': self.id,
            'order_id': self.order_id,
            'menu_item_id': self.menu_item_id,
            'menu_item_name': self.menu_item.name if self.menu_item else None,
            'price': float(self.menu_item.price) if self.menu_item and self.menu_item.price else 0.0,
            'quantity': self.quantity,
            'special_requests': self.special_requests
        }