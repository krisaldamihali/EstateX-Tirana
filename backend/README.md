# EstateX Tirana Backend

Flask API used by the EstateX Tirana portfolio app.

## Public Copy Notes

This public repository excludes the private trained model, raw Tirana listings dataset, and local SQLite database from the original workspace. The API has been adjusted so it can import and start without those private files.

When private assets are absent:

- Listing endpoints return empty lists.
- The estimator falls back to a simple non-private calculation path.
- User/account tables are created locally in a new SQLite database when the server starts.

## Run Locally

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r backend/requirements.txt
$env:APP_SECRET_KEY="replace-with-a-local-dev-secret"
python backend/app.py
```

Private production assets are intentionally not documented here.
