const app = require('./app.js');
const db = require('./db/mongo.js');
require('dotenv').config();

const BACKEND_PORT = process.env.BACKEND_PORT || 5000;

db.connect()
    .then(() => {
        app.listen(BACKEND_PORT, () => {
            console.log(`Server started at port ${BACKEND_PORT}`);
        });
    }).catch((err) => {
        console.log("Failed to start server");
    });