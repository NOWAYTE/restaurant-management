# app/routes/orders.py
from flask import Blueprint, request, jsonify, current_app
from app.extensions import db
from app.models import Order, OrderItem, MenuItem, User
from app.socketio import emit_order_created, emit_order_updated
from datetime import datetime
from flask_jwt_extended import jwt_required, get_jwt_identity

orders_bp = Blueprint('orders', __name__)

@orders_bp.route('/', methods=['GET'])
@jwt_required()
def get_orders():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        # Admins and kitchen staff see all orders, customers only see their own
        if user.role in ['admin', 'kitchen']:
            orders = Order.query.order_by(Order.created_at.desc()).all()
        else:
            orders = Order.query.filter_by(customer_id=current_user_id).order_by(Order.created_at.desc()).all()
            
        return jsonify([{
            'id': order.id,
            'customer_id': order.customer_id,
            'customer_name': order.customer_name,
            'status': order.status,
            'table_number': order.table_number,
            'created_at': order.created_at.isoformat(),
            'items': [{
                'id': item.id,
                'menu_item_id': item.menu_item_id,
                'name': item.menu_item.name if item.menu_item else 'Unknown',
                'quantity': item.quantity,
                'price': float(item.price) if item.price else 0.0,
                'special_requests': item.special_requests
            } for item in order.order_items]
        } for order in orders]), 200
    except Exception as e:
        current_app.logger.error(f'Error fetching orders: {str(e)}')
        return jsonify({'error': 'Failed to fetch orders'}), 500


@orders_bp.route('/<int:order_id>', methods=['GET'])
@jwt_required()
def get_order(order_id):
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        order = Order.query.get_or_404(order_id)
        
        # Check if user has permission to view this order
        if user.role not in ['admin', 'kitchen'] and order.customer_id != current_user_id:
            return jsonify({'error': 'Unauthorized'}), 403
            
        return jsonify({
            'id': order.id,
            'customer_id': order.customer_id,
            'customer_name': order.customer_name,
            'status': order.status,
            'table_number': order.table_number,
            'created_at': order.created_at.isoformat(),
            'items': [{
                'id': item.id,
                'menu_item_id': item.menu_item_id,
                'name': item.menu_item.name if item.menu_item else 'Unknown',
                'quantity': item.quantity,
                'price': float(item.price) if item.price else 0.0,
                'special_requests': item.special_requests
            } for item in order.order_items]
        }), 200
    except Exception as e:
        current_app.logger.error(f'Error fetching order {order_id}: {str(e)}')
        return jsonify({'error': 'Failed to fetch order'}), 500


@orders_bp.route('/<int:order_id>/status', methods=['PATCH'])
@jwt_required()
def update_order_status(order_id):
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        # Only admin and kitchen staff can update order status
        if user.role not in ['admin', 'kitchen']:
            return jsonify({'error': 'Unauthorized'}), 403
            
        data = request.get_json()
        new_status = data.get('status')
        
        if not new_status or new_status not in ['pending', 'preparing', 'ready', 'served', 'completed', 'cancelled']:
            return jsonify({'error': 'Invalid status'}), 400
            
        order = Order.query.get_or_404(order_id)
        old_status = order.status
        order.status = new_status
        
        # Update updated_at timestamp
        order.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        # Prepare order data for WebSocket
        order_data = {
            'id': order.id,
            'customer_id': order.customer_id,
            'customer_name': order.customer_name,
            'status': order.status,
            'table_number': order.table_number,
            'previous_status': old_status,
            'updated_at': order.updated_at.isoformat(),
            'items': [{
                'id': item.id,
                'menu_item_id': item.menu_item_id,
                'name': item.menu_item.name if item.menu_item else 'Unknown',
                'quantity': item.quantity,
                'price': float(item.price) if item.price else 0.0
            } for item in order.order_items]
        }
        
        # Emit WebSocket event
        emit_order_updated(order_data)
        
        return jsonify({
            'message': 'Order status updated successfully',
            'order': order_data
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f'Error updating order status: {str(e)}')
        return jsonify({'error': 'Failed to update order status'}), 500

@orders_bp.route('/create', methods=['POST'])
def create_order():
    try:
        data = request.get_json()
        
        # Check if this is a guest order or authenticated user
        is_guest = data.get('is_guest_order', True)
        
        if is_guest:
            # Handle guest order
            if not all(key in data for key in ['customer_name', 'customer_phone']):
                return jsonify({'error': 'Name and phone are required for guest orders'}), 400
                
            order = Order(
                customer_name=data['customer_name'],
                customer_phone=data['customer_phone'],
                customer_email=data.get('customer_email'),
                customer_address=data.get('customer_address'),
                status='pending',
                table_number=data.get('table_number', 1),
                is_guest_order=True
            )
        else:
            # Handle authenticated user order
            current_user_id = get_jwt_identity()
            user = User.query.get(current_user_id)
            if not user:
                return jsonify({'error': 'User not found'}), 404
                
            order = Order(
                customer_name=user.name,
                customer_id=user.id,
                customer_phone=data.get('customer_phone', ''),
                customer_email=user.email,
                status='pending',
                table_number=data.get('table_number', 1),
                is_guest_order=False
            )
        db.session.add(order)
        db.session.flush()  # Get the order ID
        
        order_items = []
        for item in data['items']:
            menu_item = MenuItem.query.get(item['menu_item_id'])
            if not menu_item:
                continue
                
            # Use provided price if available, otherwise use menu item price
            item_price = item.get('price', menu_item.price)
            
            order_item = OrderItem(
                order_id=order.id,
                menu_item_id=item['menu_item_id'],
                quantity=item['quantity'],
                price=item_price,
                special_requests=item.get('special_requests', '')
            )
            db.session.add(order_item)
            order_items.append({
                'id': order_item.id,
                'name': menu_item.name,
                'quantity': order_item.quantity,
                'price': float(order_item.price),
                'special_requests': order_item.special_requests
            })
        
        db.session.commit()
        
        # Prepare order data for WebSocket
        order_data = {
            'id': order.id,
            'customer_id': order.customer_id,
            'customer_name': order.customer_name,
            'status': order.status,
            'table_number': order.table_number,
            'created_at': order.created_at.isoformat(),
            'items': order_items
        }
        
        # Emit WebSocket event
        emit_order_created(order_data)
        
        return jsonify({
            'message': 'Order created successfully', 
            'order_id': order.id,
            'order': order_data
        }), 201
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f'Error creating order: {str(e)}')
        return jsonify({'error': 'Failed to create order'}), 400

@orders_bp.route('/test', methods=['GET'])
def test_route():
    print("Test endpoint hit!")  # This should appear in your Flask console
    return jsonify({"message": "Test successful!"}), 200
