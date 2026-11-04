/* LocalStorage progress & XP for HackerBot Defense Lab */
const STORAGE_KEY = 'hackerbot_defense_lab_v1';

const DEFAULT_STATE = {
  xp: 0,
  level: 1,
  rooms: {},
  completedCount: 0
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_STATE);
    return { ...structuredClone(DEFAULT_STATE), ...JSON.parse(raw) };
  } catch {
    return structuredClone(DEFAULT_STATE);
  }
}

function saveState(state) {
  state.updatedAt = Date.now();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  if (window.CloudSync) window.CloudSync.push(state);
}

/* daily streak (separate key, backward compatible) */
function touchStreak() {
  const k = 'hackerbot_defense_streak';
  const today = new Date().toISOString().slice(0, 10);
  let s; try { s = JSON.parse(localStorage.getItem(k)) || {}; } catch { s = {}; }
  if (s.last !== today) {
    const y = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
    s.count = s.last === y ? (s.count || 0) + 1 : 1;
    s.best = Math.max(s.best || 0, s.count); s.last = today;
    localStorage.setItem(k, JSON.stringify(s));
  }
  return s;
}
function replaceState(remote) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(remote));
}

function xpForLevel(level) {
  return level * 100;
}

function recalcLevel(state) {
  let level = 1;
  let remaining = state.xp;
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level++;
  }
  state.level = level;
  state.xpIntoLevel = remaining;
  state.xpNeeded = xpForLevel(level);
  state.xpPercent = Math.min(100, Math.round((remaining / xpForLevel(level)) * 100));
  return state;
}

function getProgress() {
  return recalcLevel(loadState());
}

function saveRoomScore(roomId, score, xpEarned) {
  const state = loadState();
  const prev = state.rooms[roomId];
  const wasComplete = prev && prev.completed;
  const bestScore = prev ? Math.max(prev.score || 0, score) : score;

  state.rooms[roomId] = {
    completed: score >= 50,
    score: bestScore,
    lastScore: score,
    completedAt: score >= 50 ? new Date().toISOString() : (prev && prev.completedAt) || null
  };

  if (!wasComplete && score >= 50) {
    state.xp += xpEarned;
    state.completedCount = Object.values(state.rooms).filter(r => r.completed).length;
  } else if (wasComplete && score > (prev.score || 0)) {
    // small bonus for improvement
    state.xp += Math.min(10, Math.floor((score - (prev.score || 0)) / 5));
  }

  saveState(state);
  return recalcLevel(state);
}

function isRoomUnlocked(roomId, roomsMeta) {
  const state = loadState();
  const room = roomsMeta.find(r => r.id === roomId);
  if (!room) return false;
  if (!room.requires || room.requires.length === 0) return true;
  return room.requires.every(reqId => state.rooms[reqId] && state.rooms[reqId].completed);
}

function resetProgress() {
  localStorage.removeItem(STORAGE_KEY);
}

window.DefenseStorage = {
  getProgress,
  saveRoomScore,
  isRoomUnlocked,
  resetProgress,
  xpForLevel,
  touchStreak,
  loadState,
  replaceState
};
