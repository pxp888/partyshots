docker run -d \
  --name nginx-proxy \
  --network=your_app_network \
  -p 80:80 \
  -v $(pwd)/nginx.conf:/etc/nginx/conf.d/default.conf:ro \
  nginx:latest


