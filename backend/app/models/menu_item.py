from app.extensions import db

class MenuItem(db.Model):
    __tablename__ = "menu_items"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    price = db.Column(db.Float, nullable=False)
    description = db.Column(db.Text)
    inventory_items = db.relationship('InventoryItem', backref='menu_item', lazy=True)
    order_items = db.relationship('OrderItem', backref='menu_item', lazy=True)
