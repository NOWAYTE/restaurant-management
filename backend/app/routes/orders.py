from flask import Blueprint, request, jsonify
from app.models import Order, OrderItem, MenuItem
from app.services.inventory_service import reduce_inventory_for_order
from app import db

orders_bp = Blueprint("orders", __name__)

@orders_bp.route("/create", methods=["POST"])
def create_order():
    data = request.json

    customer_name = data["customer_name"]
    items = data["items"]  # [{menu_item_id: 1, quantity: 2}, ...]

    order = Order(customer_name=customer_name)
    db.session.add(order)
    db.session.flush()  # so we get order.id before commit

    for item in items:
        menu_id = item["menu_item_id"]
        qty = item["quantity"]

        order_item = OrderItem(
            order_id=order.id,
            menu_item_id=menu_id,
            quantity=qty
        )
        db.session.add(order_item)

    db.session.commit()

    # Reduce inventory
    reduce_inventory_for_order(order)

    return jsonify({
        "message": "Order created and inventory updated",
        "order_id": order.id
    }), 201
