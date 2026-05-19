import requests
from flask import current_app


class EventbriteService:
    """Service for Eventbrite API interactions."""

    def __init__(self):
        self.token = current_app.config.get("EVENTBRITE_PRIVATE_TOKEN")
        self.org_id = current_app.config.get("EVENTBRITE_ORG_ID")
        self.base_url = current_app.config.get(
            "EVENTBRITE_API_BASE",
            "https://www.eventbriteapi.com/v3"
        )

        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json",
        }

    def is_configured(self):
        """Check if Eventbrite credentials are available."""
        return bool(self.token and self.org_id and self.base_url)

    def search_events(self, query=None, location=None, page=1):
        """
        Get events from the Eventbrite organization.

        Eventbrite organization endpoint does not fully support q/location
        filtering, so filtering is handled after the API response.
        """
        if not self.is_configured():
            current_app.logger.warning("Eventbrite API credentials are missing.")
            return {"events": [], "pagination": {}}

        url = f"{self.base_url}/organizations/{self.org_id}/events/"

        params = {
            "page": page,
            "expand": "venue,ticket_availability",
            "status": "live,started,ended",
        }

        try:
            response = requests.get(
                url,
                headers=self.headers,
                params=params,
                timeout=12,
            )
            response.raise_for_status()
            data = response.json()

            events = data.get("events", [])

            if query:
                query_lower = query.lower()
                events = [
                    event for event in events
                    if query_lower in event.get("name", {}).get("text", "").lower()
                    or query_lower in event.get("description", {}).get("text", "").lower()
                ]

            return {
                "events": events,
                "pagination": data.get("pagination", {}),
            }

        except requests.exceptions.RequestException as e:
            current_app.logger.error(f"Eventbrite API error: {str(e)}")
            return {"events": [], "pagination": {}}

    def get_event(self, event_id):
        """Get single Eventbrite event details."""
        if not self.is_configured():
            current_app.logger.warning("Eventbrite API credentials are missing.")
            return None

        url = f"{self.base_url}/events/{event_id}/"

        params = {
            "expand": "venue,ticket_availability,category,subcategory"
        }

        try:
            response = requests.get(
                url,
                headers=self.headers,
                params=params,
                timeout=12,
            )
            response.raise_for_status()
            return response.json()

        except requests.exceptions.RequestException as e:
            current_app.logger.error(f"Error fetching Eventbrite event: {str(e)}")
            return None

    def create_event(self, event_data):
        """
        Create a new event under the Eventbrite organization.

        This is optional because local EventSphere events can exist without
        immediately publishing to Eventbrite.
        """
        if not self.is_configured():
            current_app.logger.warning("Eventbrite API credentials are missing.")
            return None

        url = f"{self.base_url}/organizations/{self.org_id}/events/"

        payload = {
            "event": {
                "name": {
                    "html": event_data["name"]
                },
                "description": {
                    "html": event_data.get("description", "")
                },
                "start": {
                    "timezone": event_data.get("timezone", "Africa/Nairobi"),
                    "utc": event_data["start_date"],
                },
                "end": {
                    "timezone": event_data.get("timezone", "Africa/Nairobi"),
                    "utc": event_data["end_date"],
                },
                "currency": event_data.get("currency", "KES"),
                "online_event": event_data.get("online_event", False),
                "listed": True,
                "shareable": True,
                "capacity": event_data.get("capacity", 100),
            }
        }

        try:
            response = requests.post(
                url,
                headers=self.headers,
                json=payload,
                timeout=12,
            )
            response.raise_for_status()
            return response.json()

        except requests.exceptions.RequestException as e:
            current_app.logger.error(f"Error creating Eventbrite event: {str(e)}")
            return None

    def create_ticket_class(self, event_id, ticket_data):
        """Create ticket types for an Eventbrite event."""
        if not self.is_configured():
            current_app.logger.warning("Eventbrite API credentials are missing.")
            return None

        url = f"{self.base_url}/events/{event_id}/ticket_classes/"

        price = float(ticket_data.get("price", 0))

        payload = {
            "ticket_class": {
                "name": ticket_data["name"],
                "quantity_total": ticket_data.get("quantity", 100),
                "cost": f"KES {price:.2f}",
                "free": price == 0,
            }
        }

        try:
            response = requests.post(
                url,
                headers=self.headers,
                json=payload,
                timeout=12,
            )
            response.raise_for_status()
            return response.json()

        except requests.exceptions.RequestException as e:
            current_app.logger.error(f"Error creating Eventbrite ticket: {str(e)}")
            return None

    def publish_event(self, event_id):
        """Publish an Eventbrite event."""
        if not self.is_configured():
            current_app.logger.warning("Eventbrite API credentials are missing.")
            return None

        url = f"{self.base_url}/events/{event_id}/publish/"

        try:
            response = requests.post(
                url,
                headers=self.headers,
                timeout=12,
            )
            response.raise_for_status()
            return response.json()

        except requests.exceptions.RequestException as e:
            current_app.logger.error(f"Error publishing Eventbrite event: {str(e)}")
            return None

    def get_organization_events(self, page=1):
        """Get live events from the Eventbrite organization."""
        if not self.is_configured():
            current_app.logger.warning("Eventbrite API credentials are missing.")
            return {"events": [], "pagination": {}}

        url = f"{self.base_url}/organizations/{self.org_id}/events/"

        params = {
            "page": page,
            "expand": "venue,ticket_availability",
            "status": "live",
        }

        try:
            response = requests.get(
                url,
                headers=self.headers,
                params=params,
                timeout=12,
            )
            response.raise_for_status()
            return response.json()

        except requests.exceptions.RequestException as e:
            current_app.logger.error(f"Error fetching Eventbrite org events: {str(e)}")
            return {"events": [], "pagination": {}}