// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAZf7SzdWmYJffTV19DII34gARIU2a-pkE",
  authDomain: "trispider-control-panel-fad3b.firebaseapp.com",
  databaseURL: "https://trispider-control-panel-fad3b-default-rtdb.firebaseio.com",
  projectId: "trispider-control-panel-fad3b",
  storageBucket: "trispider-control-panel-fad3b.firebasestorage.app",
  messagingSenderId: "1016700832719",
  appId: "1:1016700832719:web:badb4ab4280e4f54b720ba",
  measurementId: "G-LQ61WT8LJ0"
};

const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);
export const database = getDatabase(app);
export { auth };
export default app;

//firebase login
//firebase init
// firebase deploy