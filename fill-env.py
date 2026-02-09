import os

os.environ["AWS_ACCESS_KEY_ID"] = "blahblah"
os.environ["AWS_SECRET_ACCESS_KEY"] = "blahblah"

# Database configuration – keep these values out of settings.py
DB_ENGINE = "django.db.backends.postgresql"
DB_NAME = "postgres"  # ← your database name
DB_USER = "postgres"  # ← your database user
DB_PASSWORD = "passworod"  # ← your database password
DB_HOST = "172.24.0.1"  # ← your database host
DB_PORT = "5432"  # ← your database port


SECRET_KEY = "blahblah"
DEBUG = "False"

