from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = [
    "https://www.googleapis.com/auth/documents",
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/drive.file",
]


def generate_token():
    flow = InstalledAppFlow.from_client_secrets_file("client_secret.json", SCOPES)
    creds = flow.run_local_server(port=8080, access_type="offline", prompt="consent")

    # Save the credentials to token.json
    with open("token.json", "w") as token_file:
        token_file.write(creds.to_json())

    print("Token.json generated successfully!")


if __name__ == "__main__":
    generate_token()
