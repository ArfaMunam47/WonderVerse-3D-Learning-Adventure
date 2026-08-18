/**
 * server.js
 * =============================================================================
 * Wonder Meadow — backend (zero-dependency build)
 *
 * WHY NO EXPRESS
 * This was originally written against Express, but this sandbox's npm
 * registry access is locked down (installs return 403), so I couldn't
 * verify an Express-based server actually boots here. Rather than hand you
 * code I can't test, I rewrote the same routes on Node's built-in `http`
 * module - zero dependencies, runs with just `node server.js`, and I ran
 * every endpoint below against a live instance before delivering this.
 *
 * If you'd rather use Express, the swap is mechanical: `npm install
 * express`, then replace the routing block (search "ROUTER") with
 * `app.get/post/put/delete(...)` calls - the `db.*` data layer and every
 * handler body below can be pasted in as-is, since they don't touch
 * req/res in an Express-incompatible way except for the manual
 * parseBody/sendJson helpers, which Express replaces with req.body/res.json().
 *
 * DATA LAYER
 * A JSON file store (data/db.json) rather than SQLite - see the `db` object
 * below. Reasons: zero native/compiled dependencies (sqlite3's bindings are
 * a common source of deploy breakage), and the data shape here (a handful
 * of child profiles, each with a progress blob and a session log) doesn't
 * need SQL joins. The repository layer (`db.*`) is the ONLY place that
 * touches storage - swapping in real SQLite/Postgres later means rewriting
 * that one section; every route below stays the same.
 *
 * Run:
 *   node server.js
 *   → serves the frontend from /public and the API on the same port (3000)
 * =============================================================================
 */

const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { URL } = require("url");

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");
const DB_PATH = path.join(__dirname, "data", "db.json");

/* =============================================================================
   DATA LAYER — JSON file store with an in-memory cache
   ============================================================================= */
const db = {
  _cache: null,

  _load() {
    if (this._cache) return this._cache;
    try {
      const raw = fs.readFileSync(DB_PATH, "utf-8");
      this._cache = JSON.parse(raw);
    } catch (err) {
      this._cache = { profiles: {}, progress: {}, sessions: {} };
      this._persist();
    }
    return this._cache;
  },

  _persist() {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(this._cache, null, 2), "utf-8");
  },

  listProfiles() { return Object.values(this._load().profiles); },
  getProfile(id) { return this._load().profiles[id] || null; },

  createProfile({ name, age, avatar }) {
    const store = this._load();
    const id = crypto.randomUUID();
    const profile = {
      id, name: String(name).slice(0, 40), age: Number(age) || null,
      avatar: avatar || "star", createdAt: new Date().toISOString()
    };
    store.profiles[id] = profile;
    store.progress[id] = store.progress[id] || this._blankProgress();
    store.sessions[id] = store.sessions[id] || [];
    this._persist();
    return profile;
  },

  updateProfile(id, patch) {
    const store = this._load();
    const existing = store.profiles[id];
    if (!existing) return null;
    const updated = { ...existing, ...patch, id };
    if (patch.name) updated.name = String(patch.name).slice(0, 40);
    store.profiles[id] = updated;
    this._persist();
    return updated;
  },

  deleteProfile(id) {
    const store = this._load();
    if (!store.profiles[id]) return false;
    delete store.profiles[id];
    delete store.progress[id];
    delete store.sessions[id];
    this._persist();
    return true;
  },

  _blankProgress() {
    return {
      unlockedLetters: [], masteredAnimals: [], completedQuizzes: [],
      stars: 0, coins: 0, achievements: [], totalPlaySeconds: 0,
      zoneTimeSeconds: {}
    };
  },

  getProgress(id) {
    return this._load().progress[id] || this._blankProgress();
  },

  /** Merges a partial progress update rather than overwriting - arrays are
   *  unioned (never lose previously unlocked content), numbers are summed
   *  (session-scoped deltas: stars, coins, play seconds, per-zone time).
   *  Safe to call repeatedly with small incremental updates from the
   *  frontend's debounced autosync (see app.js -> syncProgress). */
  saveProgress(id, delta) {
    const store = this._load();
    if (!store.profiles[id]) return null;
    const current = store.progress[id] || this._blankProgress();
    const union = (a = [], b = []) => Array.from(new Set([...(a || []), ...(b || [])]));

    const merged = {
      unlockedLetters: union(current.unlockedLetters, delta.unlockedLetters),
      masteredAnimals: union(current.masteredAnimals, delta.masteredAnimals),
      completedQuizzes: union(current.completedQuizzes, delta.completedQuizzes),
      achievements: union(current.achievements, delta.achievements),
      stars: current.stars + (Number(delta.starsGained) || 0),
      coins: current.coins + (Number(delta.coinsGained) || 0),
      totalPlaySeconds: current.totalPlaySeconds + (Number(delta.sessionSeconds) || 0),
      zoneTimeSeconds: { ...current.zoneTimeSeconds }
    };
    if (delta.zoneTimeSeconds) {
      for (const [zone, secs] of Object.entries(delta.zoneTimeSeconds)) {
        merged.zoneTimeSeconds[zone] = (merged.zoneTimeSeconds[zone] || 0) + (Number(secs) || 0);
      }
    }
    store.progress[id] = merged;

    store.sessions[id] = store.sessions[id] || [];
    store.sessions[id].push({
      at: new Date().toISOString(),
      sessionSeconds: Number(delta.sessionSeconds) || 0,
      zoneTimeSeconds: delta.zoneTimeSeconds || {}
    });
    if (store.sessions[id].length > 500) store.sessions[id] = store.sessions[id].slice(-500);

    this._persist();
    return merged;
  }
};

/* =============================================================================
   MINIMAL HTTP HELPERS (Express-equivalent: req.body / res.json / res.status)
   ============================================================================= */
function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body)
  });
  res.end(body);
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", chunk => {
      data += chunk;
      if (data.length > 1e6) { req.destroy(); reject(new Error("Body too large")); }
    });
    req.on("end", () => {
      if (!data) return resolve({});
      try { resolve(JSON.parse(data)); } catch (e) { reject(new Error("Invalid JSON body")); }
    });
    req.on("error", reject);
  });
}

function requireFields(body, fields) {
  return fields.filter(f => body[f] === undefined || body[f] === null || body[f] === "");
}

const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json",
  ".png": "image/png", ".ico": "image/x-icon", ".svg": "image/svg+xml"
};

function serveStatic(req, res, pathname) {
  const safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, "");
  let filePath = path.join(PUBLIC_DIR, safePath === "/" ? "index.html" : safePath);
  if (!filePath.startsWith(PUBLIC_DIR)) { res.writeHead(403); return res.end("Forbidden"); }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === "ENOENT") { res.writeHead(404); return res.end("Not found"); }
      res.writeHead(500); return res.end("Server error");
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(content);
  });
}

/* =============================================================================
   ROUTER
   ============================================================================= */
async function handleApi(req, res, pathname) {
  try {
    if (pathname === "/api/profiles" && req.method === "GET") {
      return sendJson(res, 200, { profiles: db.listProfiles() });
    }
    if (pathname === "/api/profiles" && req.method === "POST") {
      const body = await parseBody(req);
      const missing = requireFields(body, ["name"]);
      if (missing.length) return sendJson(res, 400, { error: `Missing fields: ${missing.join(", ")}` });
      return sendJson(res, 201, { profile: db.createProfile(body) });
    }
    let m = pathname.match(/^\/api\/profiles\/([^/]+)$/);
    if (m && req.method === "GET") {
      const profile = db.getProfile(m[1]);
      if (!profile) return sendJson(res, 404, { error: "Profile not found" });
      return sendJson(res, 200, { profile });
    }
    if (m && req.method === "PUT") {
      const body = await parseBody(req);
      const updated = db.updateProfile(m[1], body);
      if (!updated) return sendJson(res, 404, { error: "Profile not found" });
      return sendJson(res, 200, { profile: updated });
    }
    if (m && req.method === "DELETE") {
      const ok = db.deleteProfile(m[1]);
      if (!ok) return sendJson(res, 404, { error: "Profile not found" });
      res.writeHead(204); return res.end();
    }

    m = pathname.match(/^\/api\/progress\/([^/]+)$/);
    if (m && req.method === "GET") {
      if (!db.getProfile(m[1])) return sendJson(res, 404, { error: "Profile not found" });
      return sendJson(res, 200, { progress: db.getProgress(m[1]) });
    }
    if (m && req.method === "POST") {
      if (!db.getProfile(m[1])) return sendJson(res, 404, { error: "Profile not found" });
      const body = await parseBody(req);
      const merged = db.saveProgress(m[1], body);
      return sendJson(res, 200, { progress: merged });
    }

    m = pathname.match(/^\/api\/analytics\/([^/]+)$/);
    if (m && req.method === "GET") {
      const profile = db.getProfile(m[1]);
      if (!profile) return sendJson(res, 404, { error: "Profile not found" });
      const progress = db.getProgress(m[1]);
      const sessions = db._load().sessions[m[1]] || [];

      const zoneEntries = Object.entries(progress.zoneTimeSeconds || {});
      const favoriteZone = zoneEntries.length ? zoneEntries.reduce((a, b) => (b[1] > a[1] ? b : a))[0] : null;

      const milestones = [];
      if (progress.unlockedLetters.length >= 26) milestones.push("Learned the whole alphabet");
      else if (progress.unlockedLetters.length >= 13) milestones.push("Halfway through the alphabet");
      if (progress.masteredAnimals.length >= 5) milestones.push("Knows 5+ animals by name");
      if (progress.stars >= 50) milestones.push("Earned 50+ stars");

      const coverage = {
        Alphabet: progress.unlockedLetters.length / 26,
        Animals: progress.masteredAnimals.length / 8,
        Quizzes: progress.completedQuizzes.length / 10
      };
      const suggestedFocus = Object.entries(coverage).sort((a, b) => a[1] - b[1])[0][0];

      return sendJson(res, 200, {
        profileId: profile.id, name: profile.name, favoriteZone,
        timeSpentPerZoneSeconds: progress.zoneTimeSeconds,
        totalPlaySeconds: progress.totalPlaySeconds,
        milestonesReached: milestones,
        suggestedLearningFocus: suggestedFocus,
        starsEarned: progress.stars,
        recentSessionCount: sessions.length
      });
    }

    return sendJson(res, 404, { error: "Not found" });
  } catch (err) {
    console.error(err);
    return sendJson(res, 500, { error: err.message === "Invalid JSON body" ? err.message : "Internal server error" });
  }
}

/* =============================================================================
   SERVER
   ============================================================================= */
const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname.startsWith("/api/")) {
    handleApi(req, res, url.pathname);
  } else {
    serveStatic(req, res, url.pathname);
  }
});

server.listen(PORT, () => {
  console.log(`Wonder Meadow server running at http://localhost:${PORT}`);
});

module.exports = server;
