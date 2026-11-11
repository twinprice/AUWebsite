# Site feedback database: one-time setup

The feedback form (`feedback.html`) saves each note as a row in a Google Sheet.
The responses page (`responses.html`) reads the sheet and lets the band change
Status and Notes. A small Apps Script attached to the sheet connects the two.
It's free and takes about 10 minutes.

## 1. Make the sheet and paste the script
1. Sign in to the Google account that should own the notes (the band Gmail works well).
2. Create a new Google Sheet at sheets.new. Name it "AU site feedback".
3. In the sheet, open **Extensions > Apps Script**.
4. Delete the sample code, paste in everything from `feedback-db/Code.gs`, and click **Save**.

## 2. Set the band passcode
1. In Apps Script, click **Project Settings** (gear icon, left side).
2. Under **Script Properties**, click **Add script property**.
3. Property: `PASSCODE`. Value: a word the band will share, for example the name of a song. Click **Save script properties**.
4. Go back to **Editor**, pick `setup` in the function menu at the top, and click **Run**.
   Google asks you to authorize the script. Allow it. (On "Google hasn't verified this app", click **Advanced**, then **Go to ... (unsafe)**. It's your own script.)
   The sheet now has a **Responses** tab.

## 3. Publish it as a web app
1. Click **Deploy > New deployment**.
2. Click the gear next to "Select type" and choose **Web app**.
3. Execute as: **Me**. Who has access: **Anyone**.
4. Click **Deploy** and copy the **Web app URL** (it ends in `/exec`).

## 4. Connect the site
1. Open `assets/feedback-config.js`.
2. Paste the URL between the quotes after `dbUrl:`.
3. Optional: paste the Google Sheet's own link after `sheetUrl:` so responses.html shows "Open the sheet".
4. Commit the change. GitHub Pages updates in a minute or two.

## Check it
1. Open `feedback.html` on the live site and send a test note.
2. Open `responses.html`, enter the passcode, and change the test note's status.
3. The sheet's Responses tab shows both changes.

## Good to know
- Anyone who finds the web app URL can add a note. Only people with the passcode can read the notes or change them.
- If you edit `Code.gs` later, use **Deploy > Manage deployments > Edit > New version** so the URL stays the same.
- You can also sort, filter and edit right in the sheet. The Status column has a dropdown.
- When the site goes live: remove the "Site feedback" link from `band_v4.html` and delete `feedback.html`, `responses.html`, `assets/feedback-config.js` and this folder. The sheet keeps every note.
