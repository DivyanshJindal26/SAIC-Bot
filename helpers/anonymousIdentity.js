// helpers/anonymousIdentity.js
// In-memory storage for user identities (persists only during bot runtime)
const userIdentities = new Map();

// Random username generators
const adjectives = [
  "Swift",
  "Silent",
  "Mysterious",
  "Ancient",
  "Bright",
  "Dark",
  "Golden",
  "Silver",
  "Brave",
  "Wise",
  "Quick",
  "Bold",
  "Clever",
  "Noble",
  "Wild",
  "Free",
  "Shadow",
  "Storm",
  "Crystal",
  "Mystic",
  "Lunar",
  "Solar",
  "Cosmic",
  "Royal",
  "Thunder",
  "Lightning",
  "Frost",
  "Flame",
  "Ocean",
  "Mountain",
  "Forest",
  "Desert",
  "Crimson",
  "Azure",
  "Emerald",
  "Violet",
  "Amber",
  "Jade",
  "Ruby",
  "Sapphire",
  "Twilight",
  "Dawn",
  "Midnight",
  "Noon",
  "Aurora",
  "Eclipse",
  "Zenith",
  "Horizon",
];

const nouns = [
  "Phoenix",
  "Dragon",
  "Wolf",
  "Eagle",
  "Tiger",
  "Lion",
  "Bear",
  "Hawk",
  "Fox",
  "Raven",
  "Owl",
  "Falcon",
  "Panther",
  "Jaguar",
  "Lynx",
  "Cobra",
  "Warrior",
  "Knight",
  "Sage",
  "Wanderer",
  "Hunter",
  "Guardian",
  "Seeker",
  "Voyager",
  "Scholar",
  "Mystic",
  "Oracle",
  "Prophet",
  "Warrior",
  "Champion",
  "Hero",
  "Legend",
  "Spirit",
  "Soul",
  "Ghost",
  "Phantom",
  "Specter",
  "Shadow",
  "Echo",
  "Whisper",
  "Star",
  "Comet",
  "Meteor",
  "Nova",
  "Galaxy",
  "Nebula",
  "Cosmos",
  "Universe",
];

// Avatar colors (used for default Discord avatars)
const avatarColors = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#FFA07A",
  "#98D8C8",
  "#F7DC6F",
  "#BB8FCE",
  "#85C1E2",
  "#F8B739",
  "#52B788",
  "#E63946",
  "#A8DADC",
  "#F1FAEE",
  "#457B9D",
  "#1D3557",
  "#E76F51",
  "#F4A261",
  "#E9C46A",
  "#2A9D8F",
  "#264653",
  "#D62828",
  "#F77F00",
  "#FCBF49",
  "#EAE2B7",
  "#003049",
  "#023E8A",
  "#0077B6",
  "#0096C7",
  "#00B4D8",
  "#48CAE4",
];

/**
 * Generate a random username
 */
function generateUsername() {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 100);
  return `${adjective}${noun}${number}`;
}

/**
 * Generate a simple avatar URL using Discord's default avatar style
 * We'll use a colored circle with initials
 */
function generateAvatarUrl(username) {
  const color = avatarColors[Math.floor(Math.random() * avatarColors.length)];
  const initials = username.substring(0, 2).toUpperCase();

  // Using DiceBear API for consistent random avatars
  // You can also use: ui-avatars.com, robohash.org, or avatars.dicebear.com
  const seed = username + Math.random().toString(36).substring(7);
  return `https://api.dicebear.com/7.x/initials/png?seed=${encodeURIComponent(
    username
  )}&backgroundColor=${color.substring(1)}`;
}

/**
 * Get or create anonymous identity for a user
 * @param {string} userId - Discord user ID
 * @returns {{username: string, avatarUrl: string}}
 */
function getAnonymousIdentity(userId) {
  // Check if user already has an identity
  if (userIdentities.has(userId)) {
    return userIdentities.get(userId);
  }

  // Generate new identity
  const username = generateUsername();
  const avatarUrl = generateAvatarUrl(username);

  const identity = {
    username,
    avatarUrl,
    createdAt: new Date(),
  };

  // Store identity
  userIdentities.set(userId, identity);

  console.log(
    `[Anonymous] New identity created: ${username} for user ${userId}`
  );

  return identity;
}

/**
 * Get statistics about anonymous users
 */
function getStats() {
  return {
    totalUsers: userIdentities.size,
    identities: Array.from(userIdentities.entries()).map(
      ([userId, identity]) => ({
        userId,
        username: identity.username,
        createdAt: identity.createdAt,
      })
    ),
  };
}

/**
 * Clear all identities (useful for testing or reset)
 */
function clearAllIdentities() {
  const count = userIdentities.size;
  userIdentities.clear();
  console.log(`[Anonymous] Cleared ${count} identities`);
  return count;
}

/**
 * Remove a specific user's identity
 */
function removeIdentity(userId) {
  return userIdentities.delete(userId);
}

module.exports = {
  getAnonymousIdentity,
  getStats,
  clearAllIdentities,
  removeIdentity,
};
