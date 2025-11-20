from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import MenuItem, Order, OrderItem, Reservation

customer_bp = Blueprint('customer', __name__)

@customer_bp.route('/menu', methods=['GET'])
def get_menu():
    menu_items = MenuItem.query.filter_by(is_available=True).all()
    return jsonify([{
        'id': item.id,
        'name': item.name,
        'description': item.description,
        'price': float(item.price),
        'category': item.category,
        'image_url': item.image_url
    } for item in menu_items])

@customer_bp.route('/orders', methods=['POST'])
@jwt_required()
def create_order():
    data = request.get_json()
    current_user = get_jwt_identity()
    
    # Create order
    order = Order(
        customer_id=current_user['id'],
        customer_name=data.get('customer_name'),
        status='pending',
        total_amount=0  # Will be calculated
    )
    db.session.add(order)
    db.session.flush()  # Get the order ID
    
    # Calculate total and create order items
    total = 0
    for item in data.get('items', []):
        menu_item = MenuItem.query.get(item['menu_item_id'])
        if not menu_item or not menu_item.is_available:
            db.session.rollback()
            return jsonify({'error': f'Menu item {item["menu_item_id"]} not available'}), 400
            
        order_item = OrderItem(
            order_id=order.id,
            menu_item_id=menu_item.id,
            quantity=item['quantity'],
            special_requests=item.get('special_requests')
        )
        db.session.add(order_item)
        total += menu_item.price * item['quantity']
    
    # Update order total
    order.total_amount = total
    db.session.commit()
    
    return jsonify({'message': 'Order created successfully', 'order_id': order.id}), 201

# Add more customer routes...