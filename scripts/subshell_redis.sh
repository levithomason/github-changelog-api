#!/usr/bin/env bash

start_redis() {
  redis-server
}

wait_for_redis() {
  echo "...waiting for redis-server to start"
  while [[ $(redis-cli ping) != 'PONG' ]]; do
    sleep 0.1
  done

  echo "redis-server running..."
  exit 0
}

# start redis in a subshell
start_redis & wait_for_redis
