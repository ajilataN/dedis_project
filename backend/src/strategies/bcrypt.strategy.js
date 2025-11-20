const bcrypt = require("bcrypt");
const HashStrategy = require("./hash.strategy");

class BcryptStrategy extends HashStrategy {
  constructor(rounds) {
    super();
    this.rounds = rounds;
  }

  async hash(plain) {
    return bcrypt.hash(plain, this.rounds);
  }

  async compare(plain, hash) {
    return bcrypt.compare(plain, hash);
  }
}

module.exports = BcryptStrategy;
