const crypto = require('crypto');

class HashHelper {

    static hashData(data, secret) {
        const hash = crypto.createHmac('sha256', secret);
        hash.update(data);
        return hash.digest('hex');
    }

    static checkHash(data, secret, hash) {
        return this.hashData(data, secret) === hash;
    }

    static genRandomString(length) {
        return crypto.randomBytes(Math.ceil(length / 2))
            .toString('hex')
            .slice(0, length);
    }
}

module.exports = HashHelper;