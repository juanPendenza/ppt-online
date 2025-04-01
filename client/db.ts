import { initializeApp } from "firebase/app";

import { getDatabase, ref, onValue } from "firebase/database";

const firebaseConfig = {
  apiKey: "TZNJuaO2rDMcQS1FW4mvhB5FfaiZpKXTzyphhkri",
  databaseURL: "https://modulo-6-firebase-default-rtdb.firebaseio.com/",
  projectId: "modulo-6-firebase",
  authDomain: "modulo-6-firebase.firebaseapp.com",
};

const app = initializeApp(firebaseConfig);

const rtdb = getDatabase(app);

export { rtdb, ref, onValue };
