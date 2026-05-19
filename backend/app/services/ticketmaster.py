import requests
from flask import current_app


class TicketmasterService:
    """Service for Ticketmaster API interactions."""

    def __init__(self):
        self.api_key = current_app.config.get("TICKETMASTER_API_KEY")
        self.base_url = "https://app.ticketmaster.com/discovery/v2"

    def is_configured(self):
        """Check if Ticketmaster API key is available."""
        return bool(self.api_key)

    def search_events(self, query="", location="", page=0, size=20):
        """
        Search Ticketmaster events.

        page starts at 0 for Ticketmaster.
        size controls how many events are returned.
        """
        if not self.is_configured():
            current_app.logger.warning("Ticketmaster API key is missing.")
            return None

        url = f"{self.base_url}/events.json"

        params = {
            "apikey": self.api_key,
            "size": size,
            "page": page,
        }

        if query:
            params["keyword"] = query

        if location:
            params["city"] = location
        else:
            # Default search region
            params["countryCode"] = "US"

        try:
            response = requests.get(
                url,
                params=params,
                timeout=12,
            )
            response.raise_for_status()
            return response.json()

        except requests.exceptions.RequestException as e:
            current_app.logger.error(
                f"Ticketmaster API error: {str(e)}"
            )
            return None

    def get_event(self, event_id):
        """Get one Ticketmaster event by ID."""
        if not self.is_configured():
            current_app.logger.warning("Ticketmaster API key is missing.")
            return None

        url = f"{self.base_url}/events/{event_id}.json"

        params = {
            "apikey": self.api_key
        }

        try:
            response = requests.get(
                url,
                params=params,
                timeout=12,
            )
            response.raise_for_status()
            return response.json()

        except requests.exceptions.RequestException as e:
            current_app.logger.error(
                f"Error fetching Ticketmaster event: {str(e)}"
            )
            return None