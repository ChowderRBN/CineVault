// ══════════════════════════════════════════
//  CineVault — config.js
//  !! FILL THIS IN BEFORE PUSHING TO GITHUB !!
// ══════════════════════════════════════════

const CONFIG = {

  // ── STEP 1: Create a GitHub Gist ──────────────────────────────────────────
  // 1. Go to https://gist.github.com
  // 2. Create a NEW secret gist
  //    - Filename:  cinevault.json
  //    - Content:   {}
  // 3. Copy the Gist ID from the URL and paste below
  //    e.g. https://gist.github.com/yourusername/abc123def456
  //                                               ↑ this part
  GIST_ID: 'a715d17db2a3eeee398f9a537af197ca',

  // ── STEP 2: Create a GitHub Personal Access Token ─────────────────────────
  // 1. Go to https://github.com/settings/tokens
  // 2. Click "Generate new token (classic)"
  // 3. Name it "CineVault" and check ONLY the "gist" scope
  // 4. Copy the token and paste below
  GITHUB_TOKEN: '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',

  // ── STEP 3: Set your hashed password ──────────────────────────────────────
  // Your plain-text password is NEVER stored here — only a SHA-256 hash.
  // To generate your hash:
  //   1. Open your browser console (F12 → Console tab)
  //   2. Paste this line, replacing "yourpassword" with your real password:
  //
  //      crypto.subtle.digest('SHA-256', new TextEncoder().encode('yourpassword'))
  //        .then(b => console.log([...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')))
  //
  //   3. Copy the long string it prints and paste it below
  //
  // The hash below is for the default password
  PASSWORD_HASH: 'a6eceb921d3d6a42e83e5c21abaaebd1e287e2065528aae66b087ff7f25d46c7',

  // ── STEP 4: Set your username ──────────────────────────────────────────────
  ADMIN_USERNAME: 'admin',

};