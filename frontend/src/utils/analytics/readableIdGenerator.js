const adjectives = ['happy', 'swift', 'brave', 'calm', 'bright', 'cool', 'wise', 'kind'];
const nouns = ['tiger', 'eagle', 'bear', 'wolf', 'hawk', 'lion', 'fox', 'deer'];

export const hashUserId = async (userId) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(userId);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const generateReadableUserId = (userId) => {
  const seed = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const adjIndex = seed % adjectives.length;
  const nounIndex = (seed * 7) % nouns.length;
  const numbers = String(seed).slice(-3).padStart(3, '0');
  return `${adjectives[adjIndex]}_${nouns[nounIndex]}_${numbers}`;
};