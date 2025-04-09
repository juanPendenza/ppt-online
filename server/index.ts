import * as express from "express";
import { firestore, rtdb } from "./db";
import * as cors from "cors";
import * as path from "path";
import { nanoid } from "nanoid";

const app = express();
app.use(
  cors({
    origin: process.env.FRONTEND_URL, // solo puede hacerlo con el 5173
  })
);
app.use(express.json());
const port = 3002;

const userRef = firestore.collection("users");
const roomRef = firestore.collection("rooms");

app.post("/signup", (req, res) => {
  const email: string = req.body.email;
  const nombre: string = req.body.nombre;
  userRef
    .where("email", "==", email)
    .get()
    .then((snap) => {
      if (snap.empty) {
        userRef
          .add({
            email,
            nombre,
          })
          .then((newRef) => {
            res.json({
              id: newRef.id,
              new: true,
            });
          });
      } else {
        res.status(400).json("user already exists");
      }
    });
});

app.post("/auth", (req, res) => {
  const { email } = req.body;
  userRef
    .where("email", "==", email)
    .get()
    .then((snap) => {
      if (snap.empty) {
        res.status(404).json({
          message: "El usuario no existe",
        });
      } else {
        res.json({
          id: snap.docs[0].id,
          data: snap.docs[0].data(),
        });
      }
    });
});

app.post("/rooms", (req, res) => {
  const { userId } = req.body;
  const { userName } = req.body;
  userRef
    .doc(userId.toString())
    .get()
    .then((snap) => {
      if (snap.exists) {
        const newRoomRef = rtdb.ref("rooms/" + nanoid());
        newRoomRef
          .set({
            owner: userId,
            currentGame: {
              playerOne: {
                id: userId,
                name: userName,
                online: true,
                start: false,
                currentHand: "",
              },
              playerTwo: {
                id: "",
                name: "",
                online: false,
                start: false,
                currentHand: "",
              },
              history: {
                playerOne: 0,
                playerTwo: 0,
                result: "",
              },
            },
          })
          .then(() => {
            const roomPrivateId = newRoomRef.key;
            const roomPublicId = 1000 + Math.floor(Math.random() * 999);
            roomRef
              .doc(roomPublicId.toString())
              .set({
                rtdbRoomId: roomPrivateId,
              })
              .then(() => {
                res.json({
                  id: roomPublicId.toString(),
                  privateId: roomPrivateId!.toString(),
                });
              });
          });
      } else {
        res.status(401).json({
          message: "El user no existe",
        });
      }
    });
});

app.get("/rooms/:roomId", (req, res) => {
  const { userId } = req.query;
  const { roomId } = req.params;
  const { userName } = req.query;
  userRef
    .doc(userId!.toString())
    .get()
    .then((snap) => {
      if (snap.exists) {
        roomRef
          .doc(roomId)
          .get()
          .then((docSnap) => {
            const data = docSnap.data();
            if (data) {
              let rtdbRoomRef = rtdb.ref("rooms/" + data.rtdbRoomId);
              rtdbRoomRef.get().then((snap) => {
                let roomData = snap.val();
                let playerOneId = roomData.currentGame.playerOne.id;
                let playerTwoId = roomData.currentGame.playerTwo.id;
                if (
                  playerTwoId == "" ||
                  userId == playerOneId ||
                  userId == playerTwoId
                ) {
                  if (userName == roomData.currentGame.playerOne.name) {
                    rtdbRoomRef.child("currentGame").child("playerOne").update({
                      online: true,
                    });
                  } else {
                    rtdbRoomRef.child("currentGame").child("playerTwo").update({
                      name: userName,
                      id: userId,
                      online: true,
                    });
                  }
                  res.json(data);
                } else {
                  res.status(401).json({
                    error: true,
                    message: "El room esta lleno",
                  });
                }
              });
            } else {
              res.status(401).json({
                error: true,
                message: "El room no existe",
              });
            }
          });
      } else {
        res.status(401).json({
          error: true,
          message: "El user no existe",
        });
      }
    });
});

app.patch("/rooms/status", (req, res) => {
  const { userId } = req.body;
  const { roomId } = req.body;
  const { player } = req.body;
  userRef
    .doc(userId.toString())
    .get()
    .then((snap) => {
      if (snap.exists) {
        let data = { player: player, status: true };
        let rtdbRoomRef = rtdb.ref("rooms/" + roomId);
        rtdbRoomRef.child("currentGame").child(player).update({
          start: true,
        });
        res.json(data);
      } else {
        res.status(401).json({
          message: "El user no existe",
        });
      }
    });
});

app.patch("/rooms/hand", (req, res) => {
  const { userId } = req.body;
  const { roomId } = req.body;
  const { player } = req.body;
  const { hand } = req.body;
  userRef
    .doc(userId.toString())
    .get()
    .then((snap) => {
      if (snap.exists) {
        let data = { player: player, hand: hand };
        let rtdbRoomRef = rtdb.ref("rooms/" + roomId);
        rtdbRoomRef.child("currentGame").child(player).update({
          currentHand: hand,
        });
        res.json(data);
      } else {
        res.status(401).json({
          message: "no existis",
        });
      }
    });
});

app.patch("/rooms/history", (req, res) => {
  const { userId } = req.body;
  const { roomId } = req.body;
  const { result } = req.body;
  userRef
    .doc(userId.toString())
    .get()
    .then((snap) => {
      if (snap.exists) {
        let rtdbRoomRef = rtdb.ref("rooms/" + roomId);
        let currentHistory;
        rtdbRoomRef
          .child("currentGame")
          .get()
          .then((snap) => {
            if (snap.exists) {
              currentHistory = snap.val().history;
              if (result == "playerOne") {
                currentHistory.playerOne = currentHistory.playerOne + 1;
                rtdbRoomRef.child("currentGame").child("history").update({
                  playerOne: currentHistory.playerOne,
                  result: "playerOne",
                });
              } else if (result == "playerTwo") {
                currentHistory.playerTwo = currentHistory.playerTwo + 1;
                rtdbRoomRef.child("currentGame").child("history").update({
                  playerTwo: currentHistory.playerTwo,
                  result: "playerTwo",
                });
              } else {
                rtdbRoomRef.child("currentGame").child("history").update({
                  result: "empate",
                });
              }
              res.json(currentHistory);
            }
          });
      } else {
        res.status(401).json({
          message: "no existis",
        });
      }
    });
});

app.patch("/rooms/reset", (req, res) => {
  const { userId } = req.body;
  const { roomId } = req.body;
  const { player } = req.body;
  const { hand } = req.body;
  userRef
    .doc(userId.toString())
    .get()
    .then((snap) => {
      if (snap.exists) {
        let data = { player: player, hand: hand, status: false };
        let rtdbRoomRef = rtdb.ref("rooms/" + roomId);
        rtdbRoomRef.child("currentGame").child(player).update({
          start: false,
          currentHand: hand,
        });
        rtdbRoomRef.child("currentGame").child("history").update({
          result: "",
        });
        res.json(data);
      } else {
        res.status(401).json({
          message: "no existis",
        });
      }
    });
});

app.patch("/rooms/logout", (req, res) => {
  const { userId } = req.body;
  const { roomId } = req.body;
  const { player } = req.body;
  userRef
    .doc(userId.toString())
    .get()
    .then((snap) => {
      if (snap.exists) {
        let data = { player: player, hand: "", status: false, online: false };
        let rtdbRoomRef = rtdb.ref("rooms/" + roomId);
        rtdbRoomRef.child("currentGame").child(player).update({
          online: false,
          start: false,
          currentHand: "",
        });
        res.json(data);
      } else {
        res.status(401).json({
          message: "no existis",
        });
      }
    });
});

app.use(express.static(path.join(__dirname, "../dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

app.listen(port, () => console.log("Servidor escuchando en el puerto " + port));
