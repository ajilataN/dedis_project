class HashStrategy {
  async hash(_plain) {
    throw new Error("hash() not implemented");
  }
  async compare(_plain, _hash) {
    throw new Error("compare() not implemented");
  }
}
module.exports = HashStrategy;
