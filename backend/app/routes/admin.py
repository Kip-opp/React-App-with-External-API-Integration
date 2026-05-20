from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.models.user import User, db
from app.models.event import Event

admin_bp = Blueprint('admin', __name__)


@admin_bp.route('/admin/users', methods=['GET'])
@jwt_required()
def get_all_users():
    try:
        current_user = get_jwt_identity()
        user = User.query.filter_by(username=current_user).first()
        
        if not user or user.role != 'admin':
            return jsonify({'error': 'Unauthorized'}), 403
        
        users = User.query.all()
        users_data = [{
            'id': u.id,
            'username': u.username,
            'email': u.email,
            'role': u.role
        } for u in users]
        
        return jsonify({'users': users_data}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/admin/events', methods=['GET'])
@jwt_required()
def get_all_events_admin():
    try:
        current_user = get_jwt_identity()
        user = User.query.filter_by(username=current_user).first()
        
        if not user or user.role != 'admin':
            return jsonify({'error': 'Unauthorized'}), 403
        
        events = Event.query.all()
        events_data = [{
            'id': e.id,
            'title': e.title,
            'description': e.description,
            'date': e.date.isoformat() if e.date else None,
            'location': e.location,
            'status': e.status,
            'organizer': {
                'id': e.organizer.id,
                'username': e.organizer.username
            } if e.organizer else None
        } for e in events]
        
        return jsonify({'events': events_data}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/admin/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user_admin(user_id):
    try:
        current_user = get_jwt_identity()
        admin = User.query.filter_by(username=current_user).first()
        
        if not admin or admin.role != 'admin':
            return jsonify({'error': 'Unauthorized'}), 403
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        if user.id == admin.id:
            return jsonify({'error': 'Cannot delete your own account'}), 400
        
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({'message': 'User deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
