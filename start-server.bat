@echo off
cd /d %~dp0
start http://localhost:8000/master.html
start http://localhost:8000/index.html
python -m http.server 8000
