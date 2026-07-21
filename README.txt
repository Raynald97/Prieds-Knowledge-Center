PRIEDS KNOWLEDGE CENTER — SYNCED MASTER

Files:
- index.html   : public Knowledge Center
- master.html  : Knowledge Center Admin
- assets/      : screenshots from the User Guide

IMPORTANT — HOW TO RUN
The two pages synchronize through IndexedDB and BroadcastChannel, so they must be opened from the SAME web origin.

Mac (recommended):
1. Double-click start-server.command.
2. The Admin and Knowledge Center pages will open in your browser.

Manual alternative:
1. Open Terminal in this folder.
2. Run: python3 -m http.server 8000
3. Open http://localhost:8000/master.html and http://localhost:8000/index.html

Changes made in master.html (create, update, delete, arrangement) are stored in the browser and immediately synchronized to index.html.
Use the same browser profile and the same localhost port to keep the same data.
