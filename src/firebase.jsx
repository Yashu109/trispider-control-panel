// // Import the functions you need from the SDKs you need
// import { initializeApp } from 'firebase/app';
// import { getAuth } from 'firebase/auth';
// import { getDatabase } from 'firebase/database';
// import { getStorage } from 'firebase/storage';

// // Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyAZf7SzdWmYJffTV19DII34gARIU2a-pkE",
//   authDomain: "trispider-control-panel-fad3b.firebaseapp.com",
//   databaseURL: "https://trispider-control-panel-fad3b-default-rtdb.firebaseio.com",
//   projectId: "trispider-control-panel-fad3b",
//   storageBucket: "trispider-control-panel-fad3b.firebasestorage.app",
//   messagingSenderId: "1016700832719",
//   appId: "1:1016700832719:web:badb4ab4280e4f54b720ba",
//   measurementId: "G-LQ61WT8LJ0"
  
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);

// // Initialize services
// const auth = getAuth(app);
// const database = getDatabase(app);
// const storage = getStorage(app);

// // Export services
// export { auth, database, storage };
// export default app;


// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDyWO-IQ1Le9mla1amb_xIzcExe2fck8ZM",
  authDomain: "spherenex-control-panel-3c4de.firebaseapp.com",
  databaseURL: "https://spherenex-control-panel-3c4de-default-rtdb.firebaseio.com",
  projectId: "spherenex-control-panel-3c4de",
  storageBucket: "spherenex-control-panel-3c4de.firebasestorage.app",
  messagingSenderId: "21908120538",
  appId: "1:21908120538:web:413662ff7538eb05ea16e3",
  measurementId: "G-5FNP51HWHJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const database = getDatabase(app);
const storage = getStorage(app);

// Export services
export { auth, database, storage };
export default app;