const Base64Url = require('./Base64url');
const Hash = require('./Hash');

class JWT {
    static sign(data, secret) {
        let header = {
            "alg": "HS256",
            "typ": "JWT"
        };
        header = JSON.stringify(header);
        header = Base64Url.encode(header);
        data.iat = parseInt(Date.now().toString().slice(0, 10));
        data = JSON.stringify(data);
        data = Base64Url.encode(data);
        const token = Hash.hashData(`${header}.${data}`, secret);
        return `${header}.${data}.${token}`;
    }

    static verify(token, secret) {
        const parts = token.split('.');
        if (parts.length === 3) {
            const verified = Hash.checkHash(`${parts[0]}.${parts[1]}`, secret, parts[2]);
            if (!verified) return new Error('Invalid secret');
            return Base64Url.decode(parts[1]);
        }
        return new Error('Invalid secret');
    }
}

module.exports = JWT;