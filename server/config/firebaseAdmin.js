// config/firebaseAdmin.js
import admin from 'firebase-admin';
import serviceAccount from '../serviceAccountKey.json' assert { type: 'json' }; // Ensure you have assert { type: 'json' } for ES modules

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

export default admin;