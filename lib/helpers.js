function generateRandom() {
  return crypto.randomUUID();
}

module.exports = { generateRandom };
