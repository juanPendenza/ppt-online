import { initializeApp } from "firebase/app";

import { getDatabase, ref, onValue } from "firebase/database";

const firebaseConfig = {
  apiKey: "TZNJuaO2rDMcQS1FW4mvhB5FfaiZpKXTzyphhkri",
  databaseURL: "https://ppt-online-255de-default-rtdb.firebaseio.com",
  projectId: "ppt-online-255de",
  authDomain: "ppt-online-255de.firebaseapp.com",
};

const app = initializeApp(firebaseConfig);

const rtdb = getDatabase(app);

export { rtdb, ref, onValue };
