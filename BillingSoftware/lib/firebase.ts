import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDEgXALincbdcAzGjBECg59wAd-c4Rc96M",
  authDomain: "billingapplive.firebaseapp.com",
  projectId: "billingapplive",
  storageBucket: "billingapplive.firebasestorage.app",
  messagingSenderId: "1025257545378",
  appId: "1:1025257545378:web:5f140f640612b0e65bc1fb"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

