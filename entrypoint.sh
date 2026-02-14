#!/bin/sh
# Substitui o placeholder pela variável de ambiente real
find /usr/share/nginx/html/assets -name "*.js" -exec \
  sed -i "s|__VITE_API_BASE_URL__|${VITE_API_BASE_URL}|g" {} \;

nginx -g "daemon off;"