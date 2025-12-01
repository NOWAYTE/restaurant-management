from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.models import db, Review, User, Order
from datetime import datetime
from sqlalchemy import func, or_

reviews_bp = Blueprint('reviews', __name__)

@reviews_bp.route('', methods=['POST'])
def create_review():
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['rating', 'name', 'email']
    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({'error': f'{field.capitalize()} is required'}), 400
            
    if not (1 <= int(data['rating']) <= 5):
        return jsonify({'error': 'A valid rating between 1 and 5 is required'}), 400
        
    # For authenticated users, use their user_id
    current_user_id = None
    if 'Authorization' in request.headers:
        try:
            from flask_jwt_extended import get_jwt_identity, get_jwt
            current_user_id = get_jwt_identity()
            
            # Check if user has already reviewed this order (if order_id is provided)
            if 'order_id' in data and data['order_id']:
                existing_review = Review.query.filter_by(
                    user_id=current_user_id,
                    order_id=data['order_id']
                ).first()
                if existing_review:
                    return jsonify({'error': 'You have already reviewed this order'}), 400
        except:
            # If JWT is invalid, treat as guest
            pass
    
    # Create new review
    review = Review(
        user_id=current_user_id,
        guest_name=data['name'],
        guest_email=data['email'],
        order_id=data.get('order_id'),
        rating=data['rating'],
        comment=data.get('comment', ''),
        status='pending'  # New reviews need admin approval
    )
    
    db.session.add(review)
    db.session.commit()
    
    # For guest reviews, don't include admin fields
    include_admin = False
    if 'Authorization' in request.headers:
        try:
            from flask_jwt_extended import get_jwt
            current_user_roles = get_jwt().get('roles', [])
            include_admin = any(role in current_user_roles for role in ['admin', 'staff'])
        except:
            pass
            
    return jsonify(review.to_dict(include_admin_fields=include_admin)), 201

@reviews_bp.route('', methods=['GET'])
def get_reviews():
    # Get query parameters
    status = request.args.get('status')
    user_id = request.args.get('user_id', type=int)
    order_id = request.args.get('order_id', type=int)
    email = request.args.get('email')  # For searching guest reviews by email
    min_rating = request.args.get('min_rating', type=int)
    
    query = Review.query
    
    # Apply filters
    if status:
        query = query.filter(Review.status == status)
    if user_id:
        query = query.filter(Review.user_id == user_id)
    if order_id:
        query = query.filter(Review.order_id == order_id)
    if email:
        query = query.filter(Review.guest_email == email)
    if min_rating:
        query = query.filter(Review.rating >= min_rating)
    
    # For admin dashboard, show all reviews regardless of status
    # Only apply status filter for non-admin users
    current_user_roles = get_jwt().get('roles', []) if request.headers.get('Authorization') else []
    is_admin_or_staff = any(role in current_user_roles for role in ['admin', 'staff'])
    
    # If no status filter is applied and user is not admin, only show approved reviews
    if not status and not is_admin_or_staff:
        query = query.filter(Review.status == 'approved')
    
    reviews = query.order_by(Review.created_at.desc()).all()
    return jsonify([review.to_dict(include_admin_fields=is_admin_or_staff) for review in reviews])
    # Get query parameters
    status = request.args.get('status')
    user_id = request.args.get('user_id', type=int)
    order_id = request.args.get('order_id', type=int)
    email = request.args.get('email')  # For searching guest reviews by email
    min_rating = request.args.get('min_rating', type=int)
    
    query = Review.query
    
    # Apply filters
    if status:
        query = query.filter(Review.status == status)
    if user_id:
        query = query.filter(Review.user_id == user_id)
    if order_id:
        query = query.filter(Review.order_id == order_id)
    if email:
        query = query.filter(Review.guest_email == email)
    if min_rating:
        query = query.filter(Review.rating >= min_rating)
    
    # Only show approved reviews to non-admin users
    current_user_roles = get_jwt().get('roles', []) if request.headers.get('Authorization') else []
    if 'admin' not in current_user_roles and 'staff' not in current_user_roles:
        query = query.filter(Review.status == 'approved')
    
    reviews = query.order_by(Review.created_at.desc()).all()
    current_user_roles = get_jwt().get('roles', []) if request.headers.get('Authorization') else []
    is_admin_or_staff = any(role in current_user_roles for role in ['admin', 'staff'])
    return jsonify([review.to_dict(include_admin_fields=is_admin_or_staff) for review in reviews])

@reviews_bp.route('/<int:review_id>', methods=['PATCH'])
@jwt_required()
def update_review(review_id):
    # Only admin can update review status
    current_user_roles = get_jwt().get('roles', [])
    if 'admin' not in current_user_roles and 'staff' not in current_user_roles:
        return jsonify({'error': 'Unauthorized'}), 403
    
    review = Review.query.get_or_404(review_id)
    data = request.get_json()
    
    if 'status' in data:
        if data['status'] not in ['pending', 'approved', 'rejected']:
            return jsonify({'error': 'Invalid status'}), 400
        review.status = data['status']
    
    if 'admin_comment' in data and ('admin' in current_user_roles or 'staff' in current_user_roles):
        # Only admins can add admin comments
        review.admin_comment = data['admin_comment']
    
    db.session.commit()
    
    # Include admin fields if the requester is an admin/staff
    current_user_roles = get_jwt().get('roles', [])
    is_admin_or_staff = any(role in current_user_roles for role in ['admin', 'staff'])
    return jsonify(review.to_dict(include_admin_fields=is_admin_or_staff))

@reviews_bp.route('/stats', methods=['GET'])
def get_review_stats():
    # Get overall statistics
    stats = {
        'total': Review.query.count(),
        'approved': Review.query.filter_by(status='approved').count(),
        'pending': Review.query.filter_by(status='pending').count(),
        'rejected': Review.query.filter_by(status='rejected').count(),
        'average_rating': db.session.query(db.func.avg(Review.rating))
                               .filter(Review.status == 'approved')
                               .scalar() or 0,
        'rating_distribution': {
            '5': Review.query.filter_by(rating=5, status='approved').count(),
            '4': Review.query.filter_by(rating=4, status='approved').count(),
            '3': Review.query.filter_by(rating=3, status='approved').count(),
            '2': Review.query.filter_by(rating=2, status='approved').count(),
            '1': Review.query.filter_by(rating=1, status='approved').count(),
        }
    }
    
    # Add some additional calculated fields
    stats['total_ratings'] = sum(stats['rating_distribution'].values())
    stats['positive_percentage'] = 0
    
    if stats['total_ratings'] > 0:
        positive_reviews = stats['rating_distribution']['4'] + stats['rating_distribution']['5']
        stats['positive_percentage'] = round((positive_reviews / stats['total_ratings']) * 100, 1)
    
    return jsonify(stats)
