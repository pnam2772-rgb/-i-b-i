import { collection, doc, getDocs, limit, orderBy, query, serverTimestamp, setDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';

export const upsertLeaderboardEntry = async ({ userId, displayName, days, levelName }) => {
  if (!isFirebaseConfigured || !db || !userId) return;

  const ref = doc(db, 'leaderboard', userId);
  await setDoc(
    ref,
    {
      userId,
      displayName,
      days,
      levelName,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
};

export const fetchLeaderboard = async (maxEntries = 50) => {
  if (!isFirebaseConfigured || !db) return [];

  const leaderboardQuery = query(
    collection(db, 'leaderboard'),
    orderBy('days', 'desc'),
    limit(maxEntries)
  );

  const snapshot = await getDocs(leaderboardQuery);
  return snapshot.docs.map((docSnap, index) => ({
    id: docSnap.id,
    rank: index + 1,
    ...docSnap.data(),
  }));
};

export const savePushToken = async ({ userId, token, platform }) => {
  if (!isFirebaseConfigured || !db || !userId || !token) return;

  const ref = doc(db, 'pushTokens', userId);
  await setDoc(
    ref,
    {
      userId,
      token,
      platform,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
};
