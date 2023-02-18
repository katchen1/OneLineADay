import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCySvJMa7LFCzTjTBVtsdUOfLoajr-hTdc",
  appId: "1:989263156206:web:c557d0dfb04a00da40f4ff",
  authDomain: "cs-194-team-27.firebaseapp.com",
  databaseURL: "https://cs-194-team-27.firebaseio.com",
  projectId: "cs-194-team-27",
  storageBucket: "cs-194-team-27.appspot.com",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const auth = getAuth(app);
export { db };
