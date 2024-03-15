const bcrypt = require("bcrypt")

async function verify(password, hash) {
    return await bcrypt.compare(password, hash)
}

async function hash(password) {
    return await bcrypt.hash(password, 10)
}

module.exports = {verify, hash}