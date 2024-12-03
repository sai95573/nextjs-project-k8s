// lib/firebaseAdmin.js
import admin from 'firebase-admin';

// const serviceAccount = require('../../');
const serviceAccount = require("./the-sleep-company-c4bb9-firebase-adminsdk-4xjzi-40e83c201d.json");


if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;
