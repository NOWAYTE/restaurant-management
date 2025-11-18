from app import create_app, db
from app.models import MenuItem, InventoryItem, Order, OrderItem

app, _ = create_app()

with app.app_context():
    # Clear existing data
    db.session.query(OrderItem).delete()
    db.session.query(Order).delete()
    db.session.query(InventoryItem).delete()
    db.session.query(MenuItem).delete()
    db.session.commit()

    # Add menu items
    pizza = MenuItem(
        name="Margherita Pizza",
        price=12.99,
        description="Classic pizza with tomato sauce, mozzarella, and basil"
    )
    burger = MenuItem(
        name="Cheeseburger",
        price=9.99,
        description="Beef patty with cheese, lettuce, and special sauce"
    )
    salad = MenuItem(
        name="Caesar Salad",
        price=8.99,
        description="Romaine lettuce, croutons, parmesan, with Caesar dressing"
    )
    
    db.session.add_all([pizza, burger, salad])
    db.session.flush()  # Get the IDs
    
    # Add inventory items
    inventory = [
        # Pizza ingredients
        InventoryItem(name="Pizza Dough", quantity=100, unit="kg", menu_item=pizza),
        InventoryItem(name="Tomato Sauce", quantity=50, unit="liters", menu_item=pizza),
        InventoryItem(name="Mozzarella", quantity=30, unit="kg", menu_item=pizza),
        InventoryItem(name="Basil", quantity=5, unit="kg", menu_item=pizza),
        
        # Burger ingredients
        InventoryItem(name="Beef Patty", quantity=200, unit="pieces", menu_item=burger),
        InventoryItem(name="Burger Bun", quantity=200, unit="pieces", menu_item=burger),
        InventoryItem(name="Cheese Slice", quantity=200, unit="pieces", menu_item=burger),
        InventoryItem(name="Lettuce", quantity=20, unit="kg", menu_item=burger),
        
        # Salad ingredients
        InventoryItem(name="Romaine Lettuce", quantity=15, unit="kg", menu_item=salad),
        InventoryItem(name="Croutons", quantity=10, unit="kg", menu_item=salad),
        InventoryItem(name="Parmesan", quantity=8, unit="kg", menu_item=salad),
        InventoryItem(name="Caesar Dressing", quantity=10, unit="liters", menu_item=salad),
    ]
    
    db.session.add_all(inventory)
    db.session.commit()

    print("Database seeded successfully!")