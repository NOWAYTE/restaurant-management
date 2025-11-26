from flask import Blueprint, request, jsonify
from app.models.reservation import Reservation
from app import db
from datetime import datetime

bp = Blueprint("reservations", __name__, url_prefix="/api")

@bp.route('/reservations', methods=['GET'])
def get_reservations():
    reservations = Reservation.query.order_by(Reservation.date, Reservation.time).all()
    return jsonify([{
        "id": r.id,
        "name": r.name,
        "phone": r.phone,
        "party_size": r.party_size,
        "date": str(r.date),
        "time": str(r.time),
        "created_at": r.created_at.isoformat() if r.created_at else None
    } for r in reservations])

@bp.route('/reservations', methods=['POST'])
def create_reservation():
    data = request.get_json()
    
    try:
        reservation = Reservation(
            name=data['name'],
            phone=data['phone'],
            party_size=data['party_size'],
            date=datetime.strptime(data['date'], '%Y-%m-%d').date(),
            time=datetime.strptime(data['time'], '%H:%M').time()
        )
        
        db.session.add(reservation)
        db.session.commit()
        
        return jsonify({
            "message": "Reservation created successfully",
            "id": reservation.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400