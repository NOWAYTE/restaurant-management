from app.models import MenuItem, InventoryItem
from app import db

def reduce_inventory_for_order(order):
    """
    Reduces inventory levels based on ordered items.
    """
    for item in order.order_items:
        menu_item = item.menu_item

        inventory_items = InventoryItem.query.filter_by(menu_item_id=menu_item.id).all()

        for inv in inventory_items:
            reduction_amount = inv.quantity * item.quantity

            if inv.quantity < reduction_amount:
                raise Exception(f"Not enough stock for {inv.name}")

            inv.quantity -= reduction_amount

    db.session.commit()

