Prieds Knowledge Center - Lazy Loading Optimization
Date: 2026-08-07

Files to replace on GitHub:
- master.html
- index.html
- knowledge-store.js
- knowledge-data.js (content unchanged; included so the package is complete)

What changed (no intended UI/feature change):
1. Admin/public pages no longer download the complete Firebase state including all assets on every sync check.
   - Initial sync reads only state/data, state/aiReport, and state/savedAt.
   - state/assets is resolved one asset at a time only when the related guide/image is actually opened.
2. Background sync checks only state/savedAt every 10 seconds.
   - Full guide data is refreshed only if savedAt changes.
3. Removed automatic startup migration/repair that previously attempted to read every imported screenshot.
   - Legacy imported screenshots self-heal only when that specific image is opened.
4. Admin hidden tabs are not rendered at first load.
   - Guide List renders when Guide List is opened.
   - Guide Arrangement renders when Guide Arrangement is opened.
   - Feedback report renders when Feedback Survey Report is opened.
5. ExcelJS and JSZip are loaded only when Import Excel / Download Template is actually used.
6. knowledge-store.js is browser cache only (IndexedDB/localStorage).
   - Cross-device synchronization remains handled by the shared Firebase wrapper in master.html/index.html.
   - This removes the duplicate legacy Firebase backend request.
7. Saves use Firebase PATCH for guide/report core and asset updates instead of PUT of the whole state.
   - Existing remote assets are preserved without downloading/re-uploading them.
8. Write actions refresh the latest guide core before editing/deleting/importing/saving arrangement to reduce cross-device overwrite risk.

Expected Network behavior after deployment:
- Opening Admin: no repeating ~16 MB state.json downloads.
- Background: tiny savedAt.json request about every 10 seconds while the page is visible.
- Opening a guide: only images used by that guide are requested.
- Import Excel libraries: requested only after the user uses Import Excel / Download Template.

Validation performed:
- Inline JavaScript in master.html and index.html passed `node --check` syntax validation.
- No direct full `prieds_knowledge_center_v1/state.json` fetch remains in the optimized package.
