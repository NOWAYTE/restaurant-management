# backend/app/routes/dashboard.py
from flask import Blueprint, jsonify
from app.extensions import db
from app.models import Order, MenuItem, Reservation
from datetime import datetime, timedelta
from sqlalchemy import func

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/stats')
@dashboard_bp.route('/stats')
def get_dashboard_stats():
    try:
        # Get today's date range
        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        tomorrow = today + timedelta(days=1)
        
        print("Fetching today's revenue...")  # Debug log
        # Calculate today's revenue
        today_revenue = db.session.query(
            func.coalesce(func.sum(Order.total), 0)
        ).filter(
            Order.status == 'completed',
            Order.created_at >= today,
            Order.created_at < tomorrow
        ).scalar() or 0

        print("Counting active orders...")  # Debug log
        # Count active orders
        active_orders = db.session.query(Order).filter(
            Order.status.in_(['pending', 'preparing', 'ready'])
        ).count()

        print("Counting menu items...")  # Debug log
        # Count menu items
        menu_items = MenuItem.query.count()

        print("Counting today's reservations...")  # Debug log
        # Count today's reservations
        today_reservations = 0  # Default to 0 if Reservation model doesn't exist
        if 'Reservation' in globals():
            today_reservations = Reservation.query.filter(
                Reservation.date >= today.date(),
                Reservation.date < tomorrow.date()
            ).count()

        print("Fetching recent orders...")  # Debug log
        # Get recent orders
        recent_orders = Order.query.order_by(
            Order.created_at.desc()
        ).limit(5).all()

        # Format recent orders
        formatted_orders = [{
            'id': f"#{order.id:03d}",
            'customer': getattr(order, 'customer_name', 'Guest') or 'Guest',
            'total': f"${float(getattr(order, 'total', 0)):.2f}",
            'status': getattr(order, 'status', 'pending'),
            'time': format_time_ago(getattr(order, 'created_at', datetime.utcnow()))
        } for order in recent_orders]

        return jsonify({
            'stats': {
                'todayRevenue': float(today_revenue),
                'activeOrders': active_orders,
                'menuItems': menu_items,
                'todayReservations': today_reservations
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
        print("Error in get_dashboard_stats:", error_details)  # Debug log
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