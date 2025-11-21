from flask import Blueprint, jsonify, request
from app.extensions import db
from app.models import Order, OrderItem, MenuItem
from datetime import datetime
from flask_jwt_extended import jwt_required
from sqlalchemy import func

kitchen_bp = Blueprint('kitchen', __name__)

@kitchen_bp.route('/orders', methods=['GET'])
def get_kitchen_orders():
    try:
        # Get all orders that are not completed or cancelled
        orders = Order.query.filter(
            Order.status.in_(['pending', 'preparing', 'ready'])
        ).order_by(Order.created_at.asc()).all()

        return jsonify([
            {
                'id': order.id,
                'tableNumber': order.table_number,
                'status': order.status,
                'createdAt': order.created_at.isoformat() if order.created_at else None,
                'items': [
                    {
                        'id': item.id,
                        'name': item.menu_item.name if item.menu_item else 'Unknown Item',
                        'quantity': item.quantity,
                        'specialRequests': item.special_requests,
                        'estimatedTime': 15  # Default preparation time in minutes
                    }
                    for item in order.order_items
                ]
            }
            for order in orders
        ]), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@kitchen_bp.route('/orders/<int:order_id>/status', methods=['PUT'])
@jwt_required()
def update_order_status(order_id):
    try:
        data = request.get_json()
        new_status = data.get('status')

        if new_status not in ['preparing', 'ready']:
            return jsonify({'error': 'Invalid status'}), 400

        order = Order.query.get_or_404(order_id)
        order.status = new_status
        order.updated_at = datetime.utcnow()
        db.session.commit()

        return jsonify({
            'message': 'Order status updated',
            'order': {
                'id': order.id,
                'status': order.status
            }
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@kitchen_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_kitchen_stats():
    try:
        # Count orders by status
        status_counts = db.session.query(
            Order.status,
            func.count(Order.id)
        ).filter(
            Order.status.in_(['pending', 'preparing', 'ready'])
        ).group_by(Order.status).all()

        # Convert safely to a dict
        status_counts_dict = {status: count for status, count in status_counts}

        # Placeholder average time
        avg_prep_time = 15

        return jsonify({
            'statusCounts': status_counts_dict,
            'avgPrepTime': avg_prep_time
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
