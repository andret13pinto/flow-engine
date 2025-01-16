from googleapiclient.discovery import build
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow
from google.oauth2.credentials import Credentials
import os

# Google API scopes for both Docs and Drive
SCOPES = [
    "https://www.googleapis.com/auth/documents",
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/drive.file",
]

# Directory to store authentication tokens
TOKEN_DIR = "google_auth"
TOKEN_PATH = os.path.join(TOKEN_DIR, "token.json")
CREDENTIALS_PATH = os.path.join(TOKEN_DIR, "credentials.json")


def authenticate_google_docs():
    """Authenticate and return the Google Docs service."""
    creds = _get_credentials()
    return build("docs", "v1", credentials=creds)


def authenticate_google_drive():
    """Authenticate and return the Google Drive service."""
    creds = _get_credentials()
    return build("drive", "v3", credentials=creds)


def _get_credentials():
    """Retrieve valid user credentials from storage or initiate authorization flow."""
    creds = None

    # Ensure the token directory exists
    if not os.path.exists(TOKEN_DIR):
        os.makedirs(TOKEN_DIR)

    # Load credentials from token.json if available
    if os.path.exists(TOKEN_PATH):
        creds = Credentials.from_authorized_user_file(TOKEN_PATH, SCOPES)

    # If credentials are invalid or not found, prompt for authorization
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not os.path.exists(CREDENTIALS_PATH):
                raise ValueError(
                    f"Missing OAuth client credentials file at {CREDENTIALS_PATH}. "
                    f"Download it from your Google Cloud Console."
                )
            flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_PATH, SCOPES)
            creds = flow.run_local_server(port=0)

        # Save the credentials for the next run
        with open(TOKEN_PATH, "w") as token_file:
            token_file.write(creds.to_json())

    return creds
