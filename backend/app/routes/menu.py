# backend/app/routes/menu.py
from flask import Blueprint, request, jsonify
from app.models import MenuItem, db
from datetime import datetime

menu_bp = Blueprint("menu", __name__)

@menu_bp.route("/", methods=["GET", "POST"])
def handle_menu():
    if request.method == "GET":
        menu_items = MenuItem.query.all()
        return jsonify([{
            "id": item.id,
            "name": item.name,
            "description": item.description,
            "price": float(item.price),
            "category": item.category,
            "is_available": item.is_available,
            "image_url": item.image_url,
            "created_at": item.created_at.isoformat() if item.created_at else None,
            "updated_at": item.updated_at.isoformat() if item.updated_at else None
        } for item in menu_items])
    
    elif request.method == "POST":
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'price', 'category']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        try:
            new_item = MenuItem(
                name=data['name'],
                description=data.get('description', ''),
                price=data['price'],
                category=data['category'],
                is_available=data.get('is_available', True),
                image_url=data.get('image_url')
            )
            
            db.session.add(new_item)
            db.session.commit()
            
            return jsonify({
                "id": new_item.id,
                "name": new_item.name,
                "description": new_item.description,
                "price": float(new_item.price),
                "category": new_item.category,
                "is_available": new_item.is_available,
                "image_url": new_item.image_url,
                "created_at": new_item.created_at.isoformat(),
                "updated_at": new_item.updated_at.isoformat()
            }), 201
            
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500

@menu_bp.route("/<int:item_id>/inventory", methods=["GET"])
def get_menu_item_inventory(item_id):
    menu_item = MenuItem.query.get_or_404(item_id)
    inventory = [{
        "id": inv.id,
        "name": inv.name,
        "quantity": float(inv.quantity),
        "unit": inv.unit
    } for inv in menu_item.inventory_items]
    
    return jsonify(inventory)

@menu_bp.route("/<int:item_id>", methods=["GET", "PATCH", "DELETE"])
def manage_menu_item(item_id):
    if request.method == "PATCH":
        return update_menu_item(item_id)
    elif request.method == "DELETE":
        return delete_menu_item(item_id)
    elif request.method == "GET":
        return get_menu_item(item_id)

def update_menu_item(item_id):
    item = MenuItem.query.get_or_404(item_id)
    data = request.get_json()
    
    # Update fields if they exist in the request
    if 'name' in data:
        item.name = data['name']
    if 'description' in data:
        item.description = data['description']
    if 'price' in data:
        item.price = float(data['price'])
    if 'category' in data:
        item.category = data['category']
    if 'image_url' in data:
        item.image_url = data['image_url']
    if 'is_available' in data:
        item.is_available = bool(data['is_available'])
    
    item.updated_at = datetime.utcnow()
    
    try:
        db.session.commit()
        return jsonify({
            'id': item.id,
            'name': item.name,
            'description': item.description,
            'price': item.price,
            'category': item.category,
            'image_url': item.image_url,
            'is_available': item.is_available,
            'created_at': item.created_at.isoformat(),
            'updated_at': item.updated_at.isoformat() if item.updated_at else None
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

def delete_menu_item(item_id):
    item = MenuItem.query.get_or_404(item_id)
    
    try:
        db.session.delete(item)
        db.session.commit()
        return '', 204
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

def get_menu_item(item_id):
    item = MenuItem.query.get_or_404(item_id)
    return jsonify({
        'id': item.id,
        'name': item.name,
        'description': item.description,
        'price': item.price,
        'category': item.category,
        'image_url': item.image_url,
        'is_available': item.is_available,
        'created_at': item.created_at.isoformat(),
        'updated_at': item.updated_at.isoformat() if item.updated_at else None
    }), 200