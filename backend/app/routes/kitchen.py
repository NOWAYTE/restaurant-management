# backend/app/routes/kitchen.py
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.order import Order, OrderItem
from app.extensions import db

kitchen_bp = Blueprint('kitchen', __name__)

@kitchen_bp.route('/orders', methods=['GET'])
@jwt_required()
def get_kitchen_orders():
    # Only return orders that are not yet completed
    orders = Order.query.filter(
        Order.status.in_(['pending', 'confirmed', 'preparing'])
    ).order_by(Order.created_at.asc()).all()
    
    return jsonify([order.to_dict() for order in orders])

@kitchen_bp.route('/orders/<int:order_id>/status', methods=['PATCH'])
@jwt_required()
def update_order_status(order_id):
    order = Order.query.get_or_404(order_id)
    data = request.get_json()
    
    valid_statuses = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled']
    new_status = data.get('status')
    
    if new_status not in valid_statuses:
        return jsonify({'error': 'Invalid status'}), 400
    
    order.status = new_status
    db.session.commit()
    
    # Here you could emit a socket.io event to update all connected clients
    # socketio.emit('order_updated', order.to_dict())
    
    return jsonify(order.to_dict())

@kitchen_bp.route('/inventory', methods=['GET'])
@jwt_required()
def get_inventory():
    # Add inventory management logic here
    return jsonify({'message': 'Inventory endpoint'})