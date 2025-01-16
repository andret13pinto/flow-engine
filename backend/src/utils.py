

def search_google_docs_by_name(service, name):
    """Search for a Google Docs file by name using the Drive API."""
    query = f"name = '{name}' and mimeType = 'application/vnd.google-apps.document'"
    results = (
        service.files()
        .list(q=query, spaces="drive", fields="files(id, name)")
        .execute()
    )
    files = results.get("files", [])
    return files
