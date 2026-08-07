Prieds Knowledge Center - Event-Based Lazy Loading Optimization
Date: 2026-08-07

Files to replace on GitHub:
- master.html
- index.html
- knowledge-store.js
- knowledge-data.js (content unchanged; included so the package is complete)

What changed (no intended UI/feature change):
1. Removed the recurring Firebase state/savedAt polling every 10 seconds.
   - There is no background timer for Knowledge Center guide synchronization anymore.
   - Remote state is checked when the browser tab becomes visible again, the window receives focus, a BFCache page is restored, the browser comes back online, or another tab in the same browser signals a change.
   - A 30-second cooldown prevents duplicate focus/visibility checks from firing unnecessary requests.
2. Removed automatic location.reload() from Admin and Prieds Knowledge Center synchronization.
   - Public Knowledge Center applies changed guide data in memory and rerenders the current article/list without a full page refresh.
   - The active article is preserved by topic ID when possible, even if article ordering changed.
3. Create/Edit Guide is protected from remote refresh replacement.
   - If a Create/Edit form contains unsaved content, remote guide changes are not injected into the editor state.
   - Submit still fetches the latest cloud state first, then merges and saves the user's draft, reducing cross-device overwrite risk.
4. Large image assets remain lazy-loaded.
   - Initial sync reads only state/data, state/aiReport, and state/savedAt.
   - state/assets is resolved one asset at a time only when the related guide/image is opened.
5. Removed automatic startup migration/repair that previously attempted to read every imported screenshot.
   - Legacy imported screenshots self-heal only when that specific image is opened.
6. Admin hidden tabs are not rendered at first load.
   - Guide List renders when Guide List is opened.
   - Guide Arrangement renders when Guide Arrangement is opened.
   - Feedback report renders when Feedback Survey Report is opened.
7. ExcelJS and JSZip are loaded only when Import Excel / Download Template is actually used.
8. knowledge-store.js remains browser cache only (IndexedDB/localStorage).
   - Cross-device synchronization remains handled by the shared Firebase wrapper in master.html/index.html.
9. Saves continue using Firebase PATCH for guide/report core and asset updates instead of PUT of the whole state.
   - Existing remote assets are preserved without downloading/re-uploading them.

Expected Network/UI behavior after deployment:
- Opening Admin: no repeating savedAt.json request every 10 seconds.
- Leaving Admin/PKC open: no recurring guide-sync network traffic from the Knowledge Center sync layer.
- Returning to the tab/window: one lightweight savedAt check (subject to cooldown); guide core is downloaded only if the timestamp changed.
- When guide data changed: current Admin/PKC page is updated without location.reload().
- While typing Create/Edit Guide: the form remains intact even when another laptop updates Firebase.
- Opening a guide: only images used by that guide are requested.
- Import Excel libraries: requested only after the user uses Import Excel / Download Template.

Validation performed:
- Inline JavaScript in master.html and index.html passed node --check syntax validation.
- knowledge-store.js passed node --check syntax validation.
- No Knowledge Center 10-second polling timer remains.
- No location.reload() remains in Admin/Public sync handling.
- No direct full prieds_knowledge_center_v1/state.json fetch remains in the optimized package.

LOCAL CREATE / EDIT GUIDE DRAFT AUTOSAVE (Aug 7, 2026)
------------------------------------------------------
- Create Guide and Edit Guide drafts are automatically saved locally after form/content changes.
- Draft storage uses IndexedDB so large draft assets are not compressed or forced into localStorage quota.
- A lightweight localStorage fallback preserves text/content when IndexedDB is unavailable; large images are intentionally excluded from the fallback.
- Draft is saved immediately before leaving Create Guide for another Admin tab, and again when the browser tab becomes hidden/pagehide occurs.
- Returning to the Create Guide tab keeps the in-memory editor untouched.
- Accidental page refresh restores the latest local draft automatically (drafts expire after 7 days).
- Successful Submit/Update or explicit Cancel clears the local draft.
- Remote guide changes still do not replace an active Create/Edit draft.
- Submit/Update continues to refresh the latest Firebase state first, then merges the local editor changes before saving.
