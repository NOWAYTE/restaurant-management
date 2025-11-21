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