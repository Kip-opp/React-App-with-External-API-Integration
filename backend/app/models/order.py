from datetime import datetime
from app.models.user import db


class Order(db.Model):
    __tablename__ = "orders"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    event_id = db.Column(db.Integer, db.ForeignKey("events.id"), nullable=False)
    ticket_id = db.Column(db.Integer, nullable=True)
    
    quantity = db.Column(db.Integer, default=1)
    total_price = db.Column(db.Float, default=0.0)
    status = db.Column(db.String(20), default="completed")  # completed, pending, cancelled
    
    # External reference (e.g., Eventbrite order ID)
    external_order_id = db.Column(db.String(100), nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    event = db.relationship("Event", backref="orders")
    user = db.relationship("User", backref="orders")

    def to_dict(self):
        return {
            "id": self.id,
            "event": self.event.to_dict() if self.event else None,
            "quantity": self.quantity,
            "total_price": self.total_price,
            "status": self.status,
            "created_at": self.created_at.isoformat(),
            "external_order_id": self.external_order_id
        }
