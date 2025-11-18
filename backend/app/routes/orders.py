# app/routes/orders.py
from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models import Order, OrderItem, MenuItem
from datetime import datetime

orders_bp = Blueprint('orders', __name__)

@orders_bp.route('/', methods=['GET'])
def get_orders():
    try:
        orders = Order.query.order_by(Order.created_at.desc()).all()
        return jsonify([{
            'id': order.id,
            'customer_name': order.customer_name,
            'status': order.status,
            'created_at': order.created_at.isoformat(),
            'items': [{
                'id': item.id,
                'menu_item_id': item.menu_item_id,
                'quantity': item.quantity,
                'menu_item_name': item.menu_item.name if item.menu_item else 'Unknown'
            } for item in order.order_items]
        } for order in orders]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@orders_bp.route('/create', methods=['POST'])
def create_order():
    try:
        data = request.get_json()
        order = Order(
            customer_name=data['customer_name'],
            status='pending'
        )
        db.session.add(order)
        db.session.flush()  # Get the order ID
        
        for item in data['items']:
            order_item = OrderItem(
                order_id=order.id,
                menu_item_id=item['menu_item_id'],
                quantity=item['quantity']
            )
            db.session.add(order_item)
        
        db.session.commit()
        return jsonify({'message': 'Order created successfully', 'order_id': order.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400
