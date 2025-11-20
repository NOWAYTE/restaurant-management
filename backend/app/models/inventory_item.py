# backend/app/models/inventory_item.py
from datetime import datetime
from app.extensions import db

class InventoryItem(db.Model):
    __tablename__ = 'inventory_items'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    quantity = db.Column(db.Float, nullable=False)
    unit = db.Column(db.String(20), nullable=False)  # kg, g, l, ml, pcs, etc.
    min_quantity = db.Column(db.Float, nullable=False)
    menu_item_id = db.Column(db.Integer, db.ForeignKey('menu_items.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    menu_item = db.relationship('MenuItem', back_populates='inventory_items')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'quantity': self.quantity,
            'unit': self.unit,
            'min_quantity': self.min_quantity,
            'menu_item_id': self.menu_item_id,
            'is_low': self.quantity <= self.min_quantity
        }