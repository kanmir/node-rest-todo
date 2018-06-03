class Base64url {
    static encode(data) {
        const result = new Buffer.from(data || '').toString('base64');
        return result.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }

    static decode(data) {
        data = data.replace(/-/g, '+').replace(/_/g, '/');
        while (data.length % 4) data += '=';
        return  Buffer.from(data || '', 'base64').toString('utf8');
    }
}

module.exports = Base64url;