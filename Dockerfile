FROM docker.io/continuumio/miniconda3:latest

WORKDIR /app
COPY environment.yml .
RUN conda env create -f environment.yml && conda clean -afy
ENV PATH /opt/conda/envs/web1/bin:$PATH

COPY . .

# Create the staticfiles directory and set permissions
RUN mkdir -p /app/staticfiles && useradd -m myuser && chown -R myuser:myuser /app

USER myuser

# Use a shell form for ENTRYPOINT to allow for variable expansion if needed, 
# or stay with exec form:
CMD ["gunicorn", "--workers", "3", "--bind", "0.0.0.0:8000", "backend.wsgi:application"]
