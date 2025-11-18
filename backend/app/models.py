from app import db
from datetime import datetime

class MenuItem(db.Model):
    __tablename__ = "menu_items"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    price = db.Column(db.Float, nullable=False)
    description = db.Column(db.Text)
    inventory_items = db.relationship('InventoryItem', backref='menu_item', lazy=True)
    order_items = db.relationship('OrderItem', backref='menu_item', lazy=True)


class InventoryItem(db.Model):
    __tablename__ = "inventory_items"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    quantity = db.Column(db.Float, nullable=False)  # e.g. 2.5 kg or 10 units
    unit = db.Column(db.String(50))  # kg, g, pieces, ml
    menu_item_id = db.Column(db.Integer, db.ForeignKey("menu_items.id"))


class Order(db.Model):
    __tablename__ = "orders"

    id = db.Column(db.Integer, primary_key=True)
    customer_name = db.Column(db.String(120), nullable=False)
    status = db.Column(db.String(30), default="pending")  # pending, preparing, completed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    order_items = db.relationship('OrderItem', backref='order', lazy=True)


class OrderItem(db.Model):
    __tablename__ = "order_items"

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey("orders.id"))
    menu_item_id = db.Column(db.Integer, db.ForeignKey("menu_items.id"))
    quantity = db.Column(db.Integer, nullable=False)  # number of servings

