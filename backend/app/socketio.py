from flask_socketio import SocketIO, emit, join_room, leave_room
from flask import request
from flask_jwt_extended import decode_token
from .extensions import db
from .models import Order
import os

socketio = SocketIO(cors_allowed_origins="*")

def init_socketio(app):
    socketio.init_app(app)
    
    @socketio.on('connect')
    def handle_connect():
        try:
            # Get token from query string
            token = request.args.get('token')
            if not token:
                return False
            
            # Verify token
            decoded = decode_token(token)
            user_id = decoded['sub']['id']
            print(f"Client connected: {user_id}")
            
            # Join room for user's role
            role = decoded['sub'].get('role', 'customer')
            join_room(role)
            
            # If kitchen staff, join kitchen room
            if role in ['kitchen', 'admin']:
                join_room('kitchen')
                
        except Exception as e:
            print(f"Authentication failed: {str(e)}")
            return False
    
    @socketio.on('disconnect')
    def handle_disconnect():
        print('Client disconnected')
    
    return socketio

def emit_order_created(order_data):
    """Emit event when a new order is created"""
    socketio.emit('order:created', order_data, room='kitchen')

def emit_order_updated(order_data):
    """Emit event when an order is updated"""
    socketio.emit('order:updated', order_data, room='kitchen')
    socketio.emit('order:updated', order_data, to=str(order_data['customer_id']))