# backend/app/routes/menu.py
from flask import Blueprint, jsonify
from app.models import MenuItem
from app import db

menu_bp = Blueprint("menu", __name__)

@menu_bp.route("/", methods=["GET"])
def get_menu():
    menu_items = MenuItem.query.all()
    return jsonify([{
        "id": item.id,
        "name": item.name,
        "price": float(item.price),
        "description": item.description
    } for item in menu_items])

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