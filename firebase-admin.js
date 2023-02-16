const admin = require("firebase-admin");

const serviceAccount = require("gym-auth-development-firebase-adminsdk-lzm2x-8b0366f7a8.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
