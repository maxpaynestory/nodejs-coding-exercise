const mongoose = require("mongoose");

function connect() {
    return new Promise((resolve, reject) => {
        if (process.env.NODE_ENV === 'test') {
            const { MongoMemoryServer } = require('mongodb-memory-server');
            const mongod = new MongoMemoryServer();

            mongod.getUri().then((uri) => {
                const mongooseOpts = {
                    useNewUrlParser: true,
                    useUnifiedTopology: true
                };
                mongoose.connect(uri, mongooseOpts).then((res, err) => {
                    if (err) return reject(err);
                    resolve();
                });
            }).catch((e1) => {
                return reject(e1);
            });
        } else {
            mongoose.connect(process.env.DB_URI, {
                useNewUrlParser: true, useUnifiedTopology: true, authSource: "admin"
            }).then((res, err) => {
                if (err) return reject(err);
                resolve();
            });
        }
    });
}

function close() {
    return mongoose.disconnect();
}

module.exports = {connect, close};