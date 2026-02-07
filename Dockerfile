FROM docker.io/continuumio/miniconda3:latest

WORKDIR /app
COPY environment.yml .
RUN conda env create -f environment.yml && conda clean -afy

# Set path so we don't have to keep calling 'conda run'
ENV PATH /opt/conda/envs/web1/bin:$PATH

COPY . .

# Run collectstatic
RUN python manage.py collectstatic --noinput

# Security: Create a non-privileged user and switch to it
RUN useradd -m myuser
USER myuser

# Gunicorn with workers: 2 * CPU cores + 1 is the rule of thumb
ENTRYPOINT ["gunicorn", "--workers", "3", "--bind", "0.0.0.0:8000", "backend.wsgi:application"]

