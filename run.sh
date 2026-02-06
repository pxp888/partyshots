podman run -dt --rm \
  --name web1-container \
  -p 8000:8000 \
  -v ./env.py:/app/env.py:Z \
  web1-app
