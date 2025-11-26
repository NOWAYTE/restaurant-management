# backend/app/routes/admin.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.menu_item import MenuItem
from app.models.user import User
from app.models.inventory_item import InventoryItem

admin_bp = Blueprint('admin', __name__)
# Menu Management
@admin_bp.route('/menu', methods=['POST'])
@jwt_required()
def create_menu_item():
    if get_jwt_identity()['role'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
        
    data = request.get_json()
    menu_item = MenuItem(
        name=data['name'],
        description=data.get('description'),
        price=data['price'],
        category=data.get('category', 'other'),
        is_available=data.get('is_available', True),
        image_url=data.get('image_url')
    )
    db.session.add(menu_item)
    db.session.commit()
    return jsonify(menu_item.to_dict()), 201

# Staff Management
@admin_bp.route('/staff', methods=['POST'])
@jwt_required()
def create_staff():
    if get_jwt_identity()['role'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
        
    data = request.get_json()
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400
    
    user = User(
        email=data['email'],
        name=data['name'],
        role='staff'
    )
    user.set_password(data['password'])
    db.session.add(user)
    db.session.commit()
    
    return jsonify(user.to_dict()), 201

# Inventory Management
@admin_bp.route('/inventory', methods=['GET'])
@jwt_required()
def get_inventory():
    if get_jwt_identity()['role'] not in ['admin', 'staff']:
        return jsonify({'error': 'Unauthorized'}), 403
    
    items = InventoryItem.query.all()
    return jsonify([item.to_dict() for item in items])

# Reports
@admin_bp.route('/reports/sales', methods=['GET'])
@jwt_required()
def get_sales_report():
    if get_jwt_identity()['role'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    # Implement sales report logic
    return jsonify({
        'total_sales': 0,
        'total_orders': 0,
        'active_menu_items': 0
    })

@admin_bp.route('/api/admin/stats')
def get_stats():
    # Get total reservations
    total_reservations = Reservation.query.count()
    
    # Get today's reservations
    today = date.today()
    today_reservations = Reservation.query.filter(
        db.func.date(Reservation.date) == today
    ).count()
    
    # Get upcoming reservations (future dates)
    upcoming_reservations = Reservation.query.filter(
        db.func.date(Reservation.date) > datetime.now().date()
    ).count()
    
    return jsonify({
        'totalReservations': total_reservations,
        'todayReservations': today_reservations,
        'upcomingReservations': upcoming_reservations
    })