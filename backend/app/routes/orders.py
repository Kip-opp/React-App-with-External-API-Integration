from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.order import Order

orders_bp = Blueprint("orders", __name__)


@orders_bp.route("/orders/my", methods=["GET"])
@jwt_required()
def get_my_orders():
    user_id = get_jwt_identity()
    orders = Order.query.filter_by(user_id=user_id).order_by(Order.created_at.desc()).all()
    return jsonify({
        "orders": [order.to_dict() for order in orders]
    }), 200
