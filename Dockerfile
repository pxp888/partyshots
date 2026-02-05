# Use the official Miniconda image
FROM docker.io/continuumio/miniconda3:latest

# Set working directory
WORKDIR /app

# Copy the environment file
COPY environment.yml .

# Create the environment inside the container
RUN conda env create -f environment.yml

# Ensure the environment is activated when the container starts
# We use 'conda run' to execute our script within the specific env
SHELL ["conda", "run", "-n", "your_env_name", "/bin/bash", "-c"]

# Copy the rest of your code
COPY . .

# We use backend.wsgi because wsgi.py is inside the backend folder
# This gathers all your frontend assets into the STATIC_ROOT defined in settings.py
RUN conda run -n web1 python manage.py collectstatic --noinput
ENTRYPOINT ["conda", "run", "--no-capture-output", "-n", "web1", "gunicorn", "backend.wsgi:application", "--bind", "0.0.0.0:8000"]
