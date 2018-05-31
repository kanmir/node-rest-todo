function pick(obj, props) {
    o = {};
    props.forEach(prop => {
        if (obj.hasOwnProperty(prop)) {
            o[prop] = obj[prop];
        }
    });
    return o;
}
module.exports = {pick};