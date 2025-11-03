#!/bin/sh
while true; do
  curl -s http://backend:4000/api/fetch-trains
  sleep 120
done
