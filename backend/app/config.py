import os
from datetime import timedelta

from dotenv import load_dotenv

load_dotenv()


class Config:
    """Application configuration."""

    # ---------------------------------------------------
    # BASIC APP CONFIG
    # ---------------------------------------------------

    SECRET_KEY = os.getenv(
        "SECRET_KEY",
        "dev-secret-key-change-in-production"
    )

    FLASK_ENV = os.getenv(
        "FLASK_ENV",
        "development"
    )

    DEBUG = FLASK_ENV == "development"

    # ---------------------------------------------------
    # DATABASE CONFIG
    # ---------------------------------------------------

    # SQLite for development
    # PostgreSQL can later replace this using DATABASE_URL
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        "sqlite:///events.db"
    )

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # ---------------------------------------------------
    # JWT AUTH CONFIG
    # ---------------------------------------------------

    JWT_SECRET_KEY = os.getenv(
        "JWT_SECRET_KEY",
        "jwt-secret-key-change-in-production"
    )

    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)

    JWT_TOKEN_LOCATION = ["headers"]

    JWT_HEADER_NAME = "Authorization"

    JWT_HEADER_TYPE = "Bearer"

    # ---------------------------------------------------
    # ROLE-BASED AUTH CONFIG
    # ---------------------------------------------------

    ADMIN_EMAIL = os.getenv(
        "ADMIN_EMAIL",
        "asmien.sam@gmail.com"
    )

    ADMIN_PASSWORD = os.getenv(
        "ADMIN_PASSWORD",
        "samaangie@123"
    )

    ORGANIZER_SECRET_CODE = os.getenv(
        "ORGANIZER_SECRET_CODE",
        "EVENTSPHERE-ORG-2026"
    )

    # ---------------------------------------------------
    # EVENTBRITE CONFIG
    # ---------------------------------------------------

    EVENTBRITE_PRIVATE_TOKEN = os.getenv(
        "EVENTBRITE_PRIVATE_TOKEN"
    )

    EVENTBRITE_ORG_ID = os.getenv(
        "EVENTBRITE_ORG_ID"
    )

    EVENTBRITE_API_BASE = (
        "https://www.eventbriteapi.com/v3"
    )

    # ---------------------------------------------------
    # TICKETMASTER CONFIG
    # ---------------------------------------------------

    TICKETMASTER_API_KEY = os.getenv(
        "TICKETMASTER_API_KEY"
    )

    # ---------------------------------------------------
    # FRONTEND / CORS CONFIG
    # ---------------------------------------------------

    CORS_ORIGINS = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # ---------------------------------------------------
    # PAGINATION
    # ---------------------------------------------------

    DEFAULT_PAGE_SIZE = 12
    MAX_PAGE_SIZE = 50

    # ---------------------------------------------------
    # REMINDERS & NOTIFICATIONS
    # ---------------------------------------------------

    ENABLE_EVENT_REMINDERS = True

    REMINDER_WINDOW_HOURS = 24

    # ---------------------------------------------------
    # AI RECOMMENDATIONS
    # ---------------------------------------------------

    ENABLE_AI_RECOMMENDATIONS = True

    RECOMMENDATION_LIMIT = 8

    # ---------------------------------------------------
    # ANALYTICS
    # ---------------------------------------------------

    ENABLE_ANALYTICS = True

    # ---------------------------------------------------
    # REALTIME FEATURES
    # ---------------------------------------------------

    ENABLE_REALTIME_NOTIFICATIONS = True