from marshmallow import Schema, fields, validate


class SavedEventSchema(Schema):
    # Core IDs
    id = fields.Int(dump_only=True)

    user_id = fields.Int(
        dump_only=True
    )

    # External event info
    external_event_id = fields.Str(
        required=True,
        validate=validate.Length(min=1)
    )

    source = fields.Str(
        required=True,
        validate=validate.OneOf([
            "eventbrite",
            "ticketmaster",
            "local"
        ])
    )

    # Event details
    event_name = fields.Str(
        required=True,
        validate=validate.Length(min=2, max=255)
    )

    event_description = fields.Str()

    venue_name = fields.Str()

    venue_address = fields.Str()

    image_url = fields.Url(
        schemes={"http", "https"},
        allow_none=True
    )

    event_url = fields.Url(
        schemes={"http", "https"},
        allow_none=True
    )

    event_date = fields.Str()

    category = fields.Str()

    # Reminder functionality
    reminder_enabled = fields.Bool()

    reminder_sent = fields.Bool(
        dump_only=True
    )

    reminder_datetime = fields.DateTime(
        allow_none=True
    )

    # Optional notes
    notes = fields.Str(
        allow_none=True,
        validate=validate.Length(max=1000)
    )

    # Timestamps
    saved_at = fields.DateTime(
        dump_only=True
    )

    updated_at = fields.DateTime(
        dump_only=True
    )