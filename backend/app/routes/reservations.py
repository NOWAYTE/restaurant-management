from flask import Blueprint, jsonify, request
from app.models.reservation import Reservation
from app import db

bp = Blueprint("reservations", __name__, url_prefix="/api/reservations")

@bp.get("/")
def get_reservations():
    reservations = Reservation.query.all()
    return jsonify([{
        "id": r.id,
        "name": r.name,
        "phone": r.phone,
        "party_size": r.party_size,
        "date": str(r.date),
        "time": str(r.time)
    } for r in reservations])

@bp.post("/")
def create_reservation():
    data = request.get_json()
    reservation = Reservation(
        name=data["name"],
        phone=data["phone"],
        party_size=data["party_size"],
        date=data["date"],
        time=data["time"]
    )
    db.session.add(reservation)
    db.session.commit()
    return jsonify({"message": "Reservation created"}), 201

