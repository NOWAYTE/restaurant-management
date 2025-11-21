# backend/app/routes/dashboard.py
from flask import Blueprint, jsonify
from app.extensions import db
from app.models import Order, MenuItem, Reservation
from datetime import datetime, timedelta
from sqlalchemy import func

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/stats')
def get_dashboard_stats():
    try:
        # Get today's date range
        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        tomorrow = today + timedelta(days=1)
        
        print("Fetching today's revenue...")  # Debug log
        # Calculate today's revenue by joining with order_items and summing (price * quantity)
        today_revenue = db.session.query(
            func.coalesce(func.sum(OrderItem.quantity * OrderItem.price), 0)
        ).join(
            Order, Order.id == OrderItem.order_id
        ).filter(
            Order.status == 'completed',
            Order.created_at >= today,
            Order.created_at < tomorrow
        ).scalar()

        print("Counting active orders...")  # Debug log
        # Count active orders
        active_orders = db.session.query(Order).filter(
            Order.status.in_(['pending', 'preparing', 'ready'])
        ).count()

        print("Counting menu items...")  # Debug log
        # Count menu items
        menu_items = MenuItem.query.count()

        print("Fetching recent orders...")  # Debug log
        # Get recent orders with their total calculated from order_items
        recent_orders = db.session.query(
            Order,
            func.coalesce(func.sum(OrderItem.quantity * OrderItem.price), 0).label('order_total')
        ).outerjoin(
            OrderItem, Order.id == OrderItem.order_id
        ).group_by(Order.id).order_by(
            Order.created_at.desc()
        ).limit(5).all()

        # Format recent orders
        formatted_orders = [{
            'id': f"#{order.id:03d}",
            'customer': order.customer_name or 'Guest',
            'total': f"${float(total):.2f}",
            'status': order.status,
            'time': format_time_ago(order.created_at or datetime.utcnow())
        } for order, total in recent_orders]

        return jsonify({
            'stats': {
                'todayRevenue': float(today_revenue),
                'activeOrders': active_orders,
                'menuItems': menu_items,
                'todayReservations': 0  # Temporarily set to 0 since we don't have reservations yet
            },
            'recentOrders': formatted_orders
        })

    except Exception as e:
        import traceback
        error_details = {
            'error': str(e),
            'type': type(e).__name__,
            'traceback': traceback.format_exc()
        }
        print("Error in get_dashboard_stats:", error_details)
        return jsonify(error_details), 500

        
def format_time_ago(dt):
    now = datetime.utcnow()
    diff = now - dt
    seconds = diff.total_seconds()
    
    if seconds < 60:
        return 'Just now'
    minutes = seconds / 60
    if minutes < 60:
        return f"{int(minutes)} min ago"
    hours = minutes / 60
    if hours < 24:
        return f"{int(hours)} hr ago"
    days = hours / 24
    return f"{int(days)} days ago"