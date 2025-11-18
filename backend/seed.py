from app import create_app
from app.extensions import db
from app.models import Reservation, MenuItem, InventoryItem, Order, OrderItem
from datetime import datetime, time

app = create_app()

def seed_database():
    with app.app_context():
        # Clear existing data
        db.session.query(OrderItem).delete()
        db.session.query(Order).delete()
        db.session.query(InventoryItem).delete()
        db.session.query(MenuItem).delete()
        db.session.query(Reservation).delete()
        db.session.commit()

        # Add sample reservations
        reservations = [
            Reservation(
                name="John Doe",
                phone="1234567890",
                party_size=4,
                date=datetime.now().date(),
                time=time(19, 0)
            )
        ]
        db.session.add_all(reservations)

        # Add menu items
        pizza = MenuItem(
            name="Margherita Pizza",
            price=12.99,
            description="Classic pizza with tomato sauce, mozzarella, and basil"
        )
        db.session.add(pizza)
        db.session.flush()

        # Add inventory for pizza
        inventory = [
            InventoryItem(name="Pizza Dough", quantity=100, unit="kg", menu_item=pizza),
            InventoryItem(name="Tomato Sauce", quantity=50, unit="liters", menu_item=pizza),
            InventoryItem(name="Mozzarella", quantity=30, unit="kg", menu_item=pizza),
            InventoryItem(name="Basil", quantity=5, unit="kg", menu_item=pizza)
        ]
        db.session.add_all(inventory)
        db.session.commit()

        print("Database seeded successfully!")

if __name__ == "__main__":
    seed_database()
