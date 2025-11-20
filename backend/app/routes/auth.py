# backend/app/routes/auth.py
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app import db
from app.models.user import User
from datetime import timedelta

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400
    
    user = User(
        email=data['email'],
        name=data['name'],
        role=data.get('role', 'customer')
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    access_token = create_access_token(
        identity={
            'id': user.id,
            'email': user.email,
            'role': user.role
        },
        expires_delta=timedelta(hours=24)
    )
    
    return jsonify({
        'access_token': access_token,
        'user': user.to_dict()
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    access_token = create_access_token(
        identity={
            'id': user.id,
            'email': user.email,
            'role': user.role
        },
        expires_delta=timedelta(hours=24)
    )
    
    return jsonify({
        'access_token': access_token,
        'user': user.to_dict()
    })

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    current_user = get_jwt_identity()
    user = User.query.get(current_user['id'])
    return jsonify(user.to_dict())