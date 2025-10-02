const adjectives = ['happy', 'swift', 'brave', 'calm', 'bright', 'cool', 'wise', 'kind'];
const nouns = ['tiger', 'eagle', 'bear', 'wolf', 'hawk', 'lion', 'fox', 'deer'];

exports.generateReadableUserId = (userId) => {
  const seed = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const adjIndex = seed % adjectives.length;
  const nounIndex = (seed * 7) % nouns.length;
  const numbers = String(seed).slice(-3).padStart(3, '0');
  return `${adjectives[adjIndex]}_${nouns[nounIndex]}_${numbers}`;
};
