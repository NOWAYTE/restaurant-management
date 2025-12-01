from datetime import datetime
from app.extensions import db

class Review(db.Model):
    __tablename__ = 'reviews'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)  # Nullable for guest reviews
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=True)
    guest_name = db.Column(db.String(100), nullable=True)  # For guest reviews
    guest_email = db.Column(db.String(120), nullable=True)  # For guest reviews
    rating = db.Column(db.Integer, nullable=False)  # 1-5
    comment = db.Column(db.Text, nullable=True)
    admin_comment = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(20), default='pending', nullable=False)  # pending/approved/rejected
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref='reviews')
    order = db.relationship('Order', backref='reviews')
    
    def to_dict(self, include_admin_fields=False):
        result = {
            'is_guest': self.user_id is None,
            'id': self.id,
            'user_id': self.user_id,
            'order_id': self.order_id,
            'rating': self.rating,
            'comment': self.comment,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'user': {
                'id': self.user.id if self.user else None,
                'name': self.user.name if self.user else self.guest_name,
                'email': self.user.email if self.user else self.guest_email
            },
            'order': {
                'id': self.order.id,
                'order_number': getattr(self.order, 'order_number', None)
            } if self.order else None
        }
        
        if include_admin_fields:
            result['admin_comment'] = self.admin_comment
            
        return result
