# backend/app/routes/dashboard.py
from flask import Blueprint, jsonify
from app.extensions import db
from app.models import Order, MenuItem, Reservation
from datetime import datetime, timedelta
from sqlalchemy import func

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/api/dashboard/stats')
def get_dashboard_stats():
    try:
        # Get today's date range
        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        tomorrow = today + timedelta(days=1)
        
        # Calculate today's revenue
        today_revenue = db.session.query(
            func.coalesce(func.sum(Order.total), 0)
        ).filter(
            Order.status == 'completed',
            Order.created_at >= today,
            Order.created_at < tomorrow
        ).scalar() or 0

        # Count active orders
        active_orders = db.session.query(Order).filter(
            Order.status.in_(['pending', 'preparing', 'ready'])
        ).count()

        # Count menu items
        menu_items = MenuItem.query.count()

        # Count today's reservations
        today_reservations = Reservation.query.filter(
            Reservation.date >= today.date(),
            Reservation.date < tomorrow.date()
        ).count()

        # Get recent orders
        recent_orders = Order.query.order_by(
            Order.created_at.desc()
        ).limit(5).all()

        # Format recent orders
        formatted_orders = [{
            'id': f"#{order.id:03d}",
            'customer': order.customer_name or 'Guest',
            'total': f"${order.total:.2f}",
            'status': order.status,
            'time': format_time_ago(order.created_at)
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
        return jsonify({'error': str(e)}), 500

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