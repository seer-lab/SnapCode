const admin = require("../config/firebaseConfig"); // Admin SDK inicializado
const { getFirestore } = require("firebase-admin/firestore");
const db = getFirestore();
const { generateReadableUserId } = require("../utils/readableIdGenerator");

// === índices ===
// readableId -> uid (para reglas)
async function ensureReadableIndex(readableId, uid) {
  const ref = db.collection("user_index").doc(readableId);
  const snap = await ref.get();
  if (!snap.exists || snap.data().uid !== uid) {
    await ref.set({ uid, createdAt: new Date() });
  }
}

// uid -> readableId (para backend lookups)
async function getOrCreateReadableIdForUid(uid) {
  const ref = db.collection("uid_index").doc(uid);
  const snap = await ref.get();
  if (snap.exists && snap.data().readableId) return snap.data().readableId;

  // base y unicidad simple
  let base = generateReadableUserId(uid);
  let candidate = base;
  let n = 2;
  while ((await db.collection("users").doc(candidate).get()).exists) {
    // si ya existe y pertenece al mismo uid en user_index, reutiliza
    const idx = await db.collection("user_index").doc(candidate).get();
    if (idx.exists && idx.data().uid === uid) break;
    candidate = `${base}_${n++}`;
  }

  await ref.set({ readableId: candidate, createdAt: new Date() });
  await ensureReadableIndex(candidate, uid);
  return candidate;
}

// === helpers cookies ===
const TWO_WEEKS = 14 * 24 * 60 * 60 * 1000; // 14 días

const returnuser = async (req, res) => {
  try {
    const sessionCookie = req.cookies.session;
    if (!sessionCookie) return res.status(401).json({ error: "No session." });

    const decoded = await admin.auth().verifySessionCookie(sessionCookie, true);
    const uid = decoded.uid;

    const readableId = await getOrCreateReadableIdForUid(uid);
    const userRef = db.collection("users").doc(readableId);
    const userSnap = await userRef.get();
    if (!userSnap.exists) {
      // crear doc base si no existe
      const fbUser = await admin.auth().getUser(uid);
      await userRef.set({
        readableId,
        
        displayName: fbUser.displayName ?? null,
        createdAt: new Date(),
        lastLogin: new Date(),
      });
      return res.status(200).json({
        success: true,
        user: { uid, readableId, displayName: fbUser.displayName ?? null },
      });
    }
    const data = userSnap.data();
    res.status(200).json({
      success: true,
      user: { uid, readableId: data.readableId, displayName: data.displayName },
    });
  } catch (err) {
    console.error("returnuser error:", err);
    res.status(401).json({ error: "Invalid session." });
  }
};

const login = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ error: "idToken is required." });

    // 1) Use firebase admin to verify the token
    const decoded = await admin.auth().verifyIdToken(idToken, true);
    const uid = decoded.uid;

    // 2) Create a session cookie
    const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn: TWO_WEEKS });
    res.cookie("session", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: TWO_WEEKS,
    });

    // 3) Ensure user document exists/updated
    const readableId = await getOrCreateReadableIdForUid(uid);
    const userRef = db.collection("users").doc(readableId);
    const fbUser = await admin.auth().getUser(uid);
    const snap = await userRef.get();

    if (!snap.exists) {
      await userRef.set({
        readableId,
        displayName: fbUser.displayName ?? null,
        createdAt: new Date(),
        lastLogin: new Date(),
      });
      console.log(`✅ Created users/${readableId}`);
    } else {
      await userRef.update({
        displayName: fbUser.displayName ?? null,
        lastLogin: new Date(),
      });
      console.log(`🔄 Updated users/${readableId}`);
    }

    // 4) Return user info
    const finalData = (await userRef.get()).data();
    res.status(200).json({
      success: true,
      user: {
        uid,
        readableId,
        displayName: finalData.displayName,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Authentication failed." });
  }
};

const authenticate = async (req, res) => {
  try {
    const sessionCookie = req.cookies.session;
    if (!sessionCookie) return res.status(401).json({ error: "No session." });

    const decoded = await admin.auth().verifySessionCookie(sessionCookie, true);
    const uid = decoded.uid;

    const readableId = await getOrCreateReadableIdForUid(uid);
    const userRef = db.collection("users").doc(readableId);
    const snap = await userRef.get();
    if (!snap.exists) return res.status(401).json({ error: "User doc not found." });

    const data = snap.data();
    res.status(200).json({
      success: true,
      user: {
        uid,
        readableId: data.readableId,
        displayName: data.displayName,
      },
    });
  } catch (err) {
    console.error("Authentication check failed:", err);
    res.status(401).json({ error: "Invalid or expired session." });
  }
};

const logout = (req, res) => {
  return res
    .clearCookie("session", {
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    })
    .status(200)
    .json({ success: true, message: "Logged out successfully" });
};

module.exports = { returnuser, login, logout, authenticate };
