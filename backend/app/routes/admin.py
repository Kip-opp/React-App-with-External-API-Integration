from datetime import datetime, timedelta

from flask import Blueprint, jsonify, request

from app.middleware.auth import admin_required
from app.models.user import User, db
from app.models.event import Event

admin_bp = Blueprint('admin', __name__)


@admin_bp.route('/admin/users', methods=['GET'])
@admin_required
def get_admin_users(current_user):
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', None, type=int)
    if per_page is None:
        per_page = request.args.get('limit', 10, type=int)
    role = request.args.get('role', None, type=str)
    recent = request.args.get('recent', None, type=str)

    query = User.query

    if role:
        query = query.filter_by(role=role)

    if recent == 'true':
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        query = query.filter(User.created_at >= seven_days_ago)

    pagination = query.order_by(User.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    users_data = [
        {
            'id': u.id,
            'username': u.username,
            'email': u.email,
            'role': u.role,
            'is_active': u.is_active,
            'created_at': u.created_at.isoformat() if u.created_at else None,
        }
        for u in pagination.items
    ]

    return jsonify({
        'users': users_data,
        'total': pagination.total,
        'page': pagination.page,
        'per_page': pagination.per_page,
        'total_pages': pagination.pages,
        'has_next': pagination.has_next,
        'has_prev': pagination.has_prev,
    }), 200


@admin_bp.route('/admin/events', methods=['GET'])
@admin_required
def get_admin_events(current_user):
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', None, type=int)
    if per_page is None:
        per_page = request.args.get('limit', 10, type=int)
    category = request.args.get('category', None, type=str)
    status = request.args.get('status', None, type=str)

    query = Event.query

    if category:
        query = query.filter_by(category=category)

    if status:
        query = query.filter_by(status=status)

    pagination = query.order_by(Event.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    events_data = []
    for e in pagination.items:
        event_dict = {
            'id': e.id,
            'name': e.name,
            'title': e.name,
            'description': e.description,
            'category': e.category,
            'start_date': e.start_date.isoformat() if e.start_date else None,
            'end_date': e.end_date.isoformat() if e.end_date else None,
            'date': e.start_date.isoformat() if e.start_date else None,
            'venue_name': e.venue_name,
            'location': e.venue_name,
            'status': e.status,
            'organizer': {
                'id': e.creator.id,
                'username': e.creator.username,
            } if e.creator else None,
            'created_at': e.created_at.isoformat() if e.created_at else None,
        }
        events_data.append(event_dict)

    return jsonify({
        'events': events_data,
        'total': pagination.total,
        'page': pagination.page,
        'per_page': pagination.per_page,
        'total_pages': pagination.pages,
        'has_next': pagination.has_next,
        'has_prev': pagination.has_prev,
    }), 200


@admin_bp.route('/admin/events/by-source', methods=['GET'])
@admin_required
def get_events_by_source(current_user):
    from flask import current_app

    from app.services.eventbrite import EventbriteService
    from app.services.ticketmaster import TicketmasterService
    from app.utils.mapper import map_eventbrite_events
    from app.utils.ticketmaster_mapper import map_ticketmaster_events

    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', None, type=int)
    if per_page is None:
        per_page = request.args.get('limit', 10, type=int)
    source = request.args.get('source', 'EventSphere')

    normalized = (source or '').lower().strip().replace(' ', '').replace('_', '')

    events_data = []
    total = 0
    total_pages = 1
    has_next = False
    has_prev = page > 1

    if normalized in ('eventsphere', 'local'):
        query = Event.query
        pagination = query.order_by(Event.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        for e in pagination.items:
            event_dict = {
                'id': e.id,
                'name': e.name,
                'title': e.name,
                'description': e.description,
                'category': e.category,
                'start_date': e.start_date.isoformat() if e.start_date else None,
                'end_date': e.end_date.isoformat() if e.end_date else None,
                'date': e.start_date.isoformat() if e.start_date else None,
                'venue_name': e.venue_name,
                'location': e.venue_name,
                'status': e.status,
                'organizer': {
                    'id': e.creator.id,
                    'username': e.creator.username,
                } if e.creator else None,
                'created_at': e.created_at.isoformat() if e.created_at else None,
                'source': 'EventSphere',
            }
            events_data.append(event_dict)
        total = pagination.total
        total_pages = pagination.pages
        has_next = pagination.has_next
        has_prev = pagination.has_prev

    elif normalized == 'eventbrite':
        try:
            service = EventbriteService()
            raw = service.get_organization_events(page=page)
            raw_events = raw.get('events', []) if isinstance(raw, dict) else []
            mapped = map_eventbrite_events({'events': raw_events}) if raw_events else []
            pagination_info = raw.get('pagination', {}) if isinstance(raw, dict) else {}
            total = pagination_info.get('object_count', len(mapped))
            total_pages = pagination_info.get('page_count', 1)
            has_next = page < total_pages if total_pages > 0 else False
            has_prev = page > 1

            for m in mapped:
                events_data.append({
                    'id': m.get('id') or m.get('eventbrite_id'),
                    'name': m.get('name'),
                    'title': m.get('name'),
                    'description': m.get('description'),
                    'category': m.get('category'),
                    'start_date': m.get('start_date'),
                    'end_date': m.get('end_date'),
                    'venue_name': m.get('venue_name'),
                    'location': m.get('venue_name'),
                    'status': 'approved',
                    'organizer': {'username': 'Eventbrite'},
                    'source': 'Eventbrite',
                    'checkout_url': m.get('checkout_url'),
                    'image_url': m.get('image_url'),
                })
        except Exception as ex:
            current_app.logger.error(f"Error fetching Eventbrite for admin: {ex}")
            events_data = []
            total = 0
            total_pages = 1

    elif normalized == 'ticketmaster':
        try:
            service = TicketmasterService()
            raw = service.search_events(page=page - 1, size=per_page)
            mapped = map_ticketmaster_events(raw) if raw else []
            page_info = raw.get('page', {}) if raw and isinstance(raw, dict) else {}
            total = page_info.get('totalElements', len(mapped))
            total_pages = page_info.get('totalPages', 1)
            has_next = (page_info.get('number', page - 1) + 1) < total_pages if total_pages > 0 else False
            has_prev = page > 1

            for m in mapped:
                events_data.append({
                    'id': m.get('id') or m.get('ticketmaster_id'),
                    'name': m.get('name'),
                    'title': m.get('name'),
                    'description': m.get('description'),
                    'category': m.get('category'),
                    'start_date': m.get('start_date'),
                    'end_date': m.get('end_date'),
                    'venue_name': m.get('venue_name'),
                    'location': m.get('venue_name'),
                    'status': m.get('status', 'approved'),
                    'organizer': {'username': m.get('promoter_name') or 'Ticketmaster'},
                    'source': 'Ticketmaster',
                    'checkout_url': m.get('checkout_url'),
                    'image_url': m.get('image_url'),
                })
        except Exception as ex:
            current_app.logger.error(f"Error fetching Ticketmaster for admin: {ex}")
            events_data = []
            total = 0
            total_pages = 1

    else:
        events_data = []
        total = 0
        total_pages = 1

    return jsonify({
        'events': events_data,
        'total': total,
        'page': page,
        'per_page': per_page,
        'total_pages': total_pages,
        'has_next': has_next,
        'has_prev': has_prev,
        'source': source,
    }), 200


@admin_bp.route('/admin/users/<int:user_id>', methods=['DELETE'])
@admin_required
def delete_user_admin(current_user, user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    if user.id == current_user.id:
        return jsonify({'error': 'Cannot delete your own account'}), 400

    db.session.delete(user)
    db.session.commit()

    return jsonify({'message': 'User deleted successfully'}), 200


@admin_bp.route('/admin/users/<int:user_id>/promote', methods=['PATCH'])
@admin_required
def promote_user(current_user, user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    if user.id == current_user.id:
        return jsonify({'error': 'Cannot promote yourself'}), 400

    user.role = 'admin'
    db.session.commit()

    return jsonify({
        'message': f'User {user.username} promoted to admin',
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role,
        }
    }), 200


@admin_bp.route('/admin/users/<int:user_id>/demote', methods=['PATCH'])
@admin_required
def demote_user(current_user, user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    if user.id == current_user.id:
        return jsonify({'error': 'Cannot demote yourself'}), 400

    if user.role != 'admin':
        return jsonify({'error': 'User is not an admin'}), 400

    user.role = 'user'
    db.session.commit()

    return jsonify({
        'message': f'User {user.username} demoted to regular user',
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role,
        }
    }), 200


@admin_bp.route('/admin/users/<int:user_id>/toggle-status', methods=['PATCH'])
@admin_required
def toggle_user_status(current_user, user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    if user.id == current_user.id:
        return jsonify({'error': 'Cannot toggle your own status'}), 400

    user.is_active = not user.is_active
    db.session.commit()

    status_label = 'activated' if user.is_active else 'suspended'

    return jsonify({
        'message': f'User {user.username} {status_label}',
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role,
            'is_active': user.is_active,
        }
    }), 200
