#!/bin/bash
cd "$(dirname "$0")"
PORT=8000
python3 -m http.server "$PORT" >/tmp/prieds-kc-server.log 2>&1 &
SERVER_PID=$!
sleep 1
open "http://localhost:$PORT/master.html"
open "http://localhost:$PORT/index.html"
echo "Prieds Knowledge Center is running at http://localhost:$PORT"
echo "Close this Terminal window or press Ctrl+C to stop the server."
trap 'kill $SERVER_PID 2>/dev/null' EXIT
wait $SERVER_PID
