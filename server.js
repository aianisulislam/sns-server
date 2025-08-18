// server.js
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");
const { createRoom, joinRoom, getRoom, leaveRoom, startWar, playCard, updateWinner, prepareNextTurn } = require("./lib/service");
const { createDeck, decideWinner } = require("./lib/controller");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const emitUpdatedGame = (io, roomId) => {
  const room = getRoom(roomId);
  if (room) {
    const playerIds = JSON.parse(room.player_ids);
    playerIds.forEach(playerId => {
      // Censor hand and deck for other players
      const players = room.players.map(p => p.id === playerId ? p : ({
        ...p,
        hand: JSON.stringify( Array((JSON.parse(p.hand)).length).fill({ value: "?", suit: "?" })),
        deck: JSON.stringify(Array((JSON.parse(p.deck)).length).fill({ value: "?", suit: "?" }))
      }));
      io.to(playerId).emit("roomUpdated", {...room, players});
    });
  }
}

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // Attach socket.io to the same server
  const io = new Server(server);

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Create a new war room
    socket.on("createRoom", ({ name }) => {
      try {
        const { roomId, playerId } = createRoom(name, createDeck());
        socket.join(playerId);
        emitUpdatedGame(io, roomId);
      } catch (err) {
        socket.emit("error", { code: "CREATE_FAILED", message: err.message });
      }
    });

    // Join an existing room
    socket.on("joinRoom", ({ name, roomId }) => {
      try {
        const { playerId } = joinRoom(roomId, name, createDeck());
        socket.join(playerId);
        startWar(roomId);
        emitUpdatedGame(io, roomId);
      } catch (err) {
        socket.emit("error", { code: "JOIN_FAILED", message: err.message });
      }
    });

    // Leave room
    socket.on("leaveRoom", ({ playerId, roomId }) => {
      try {
        const {room} = leaveRoom(roomId);
        socket.leave(playerId);
        JSON.parse(room.player_ids).forEach(id => {
          io.to(id).emit("roomUpdated", null);
        });
      } catch (err) {
        socket.emit("error", { code: "LEAVE_FAILED", message: err.message });
      }
    });

    // Play a card
    socket.on("playCard", ({ playerId, roomId, cardIndex }) => {
      try {
        const { pit, room } = playCard(roomId, playerId, cardIndex);
        if (pit.length < room.players.length) {
          emitUpdatedGame(io, roomId);
        } else {
          const winnerId = decideWinner(pit, room.players);
          updateWinner(roomId, winnerId);
          emitUpdatedGame(io, roomId);
          // sleep for 2 seconds before preparing next turn
          setTimeout(() => {
            prepareNextTurn(roomId);
            emitUpdatedGame(io, roomId);
          }, 2000);
        }
      } catch (err) {
        socket.emit("error", { code: "PLAY_FAILED", message: err.message });
      }
    });

    // ===== DISCONNECT =====
    socket.on("disconnect", () => {
      try {
        //TODO: Handle player disconnection logic
      } catch (err) {
        // silently ignore if no game
      }
    });
  });

  const port = 3000;
  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`🚀 Server ready at http://localhost:${port}`);
  });
});
