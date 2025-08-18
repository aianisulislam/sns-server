// lib/service.js
import db, { generateUniqueId } from "./db.js";

/* ============ HELPERS ============ */
function runQuery(query, params = []) {
  const stmt = db.prepare(query);
  const info = stmt.run(params);
  return info.lastInsertRowid || info.lastID || null;
}

function getQuery(query, params = []) {
  const stmt = db.prepare(query);
  return stmt.get(params);
}

function allQuery(query, params = []) {
  const stmt = db.prepare(query);
  return stmt.all(params);
}

/* ============ CASES ============ */

export function createRoom(playerName, deck) {
  const playerId = generateUniqueId('players');
  const hand = deck.splice(0, 13)
  runQuery(
    `INSERT INTO players (id, name, online_status, deck, hand, score) VALUES (?, ?, 'online', ?, ?, 0)`,
    [playerId, playerName, JSON.stringify(deck), JSON.stringify(hand)]
  );

  const playerIds = JSON.stringify([playerId]);

  const roomId = generateUniqueId('war_rooms');
  const message = roomId;
  runQuery(
    `INSERT INTO war_rooms (id, player_ids, pit, turn, status, message) VALUES (?, ?, '[]', '', 'waiting', ?)`,
    [roomId, playerIds, message]
  );

  return { roomId, playerId };
}

export function joinRoom(roomId, playerName, deck) {
  const playerId = generateUniqueId('players');
  const hand = deck.splice(0, 13)
  runQuery(
    `INSERT INTO players (id, name, online_status, deck, hand, score) VALUES (?, ?, 'online', ?, ?, 0)`,
    [playerId, playerName, JSON.stringify(deck), JSON.stringify(hand)]
  );

  const room = getQuery(`SELECT * FROM war_rooms WHERE id = ?`, [roomId]);
  if (!room) throw new Error("Room not found");

  const playerIds = JSON.parse(room.player_ids);
  playerIds.push(playerId);

  runQuery(`UPDATE war_rooms SET player_ids = ? WHERE id = ?`, [
    JSON.stringify(playerIds),
    roomId,
  ]);

  return { roomId, playerId };
}

export function getRoom(roomId) {
  const room = getQuery(`SELECT * FROM war_rooms WHERE id = ?`, [roomId]);
  if (!room) throw new Error("Room not found");

  const playerIds = JSON.parse(room.player_ids);
  let players = [];
  if (playerIds.length > 0) {
    const placeholders = playerIds.map(() => '?').join(',');
    players = allQuery(
      `SELECT * FROM players WHERE id IN (${placeholders})`,
      playerIds
    );
  }
  return { ...room, players };
}

export function leaveRoom(roomId) {
  const room = getQuery(`SELECT * FROM war_rooms WHERE id = ?`, [roomId]);
  if (!room) throw new Error("Room not found");

  runQuery(`DELETE FROM war_rooms WHERE id = ?`, [roomId]);
  return { room };
}

export function startWar(roomId) {
  const room = getRoom(roomId);
  const turnIndex = Math.floor(Math.random() * room.players.length);
  const player = room.players[turnIndex];
  const turn = player.id;
  runQuery(`UPDATE war_rooms SET status = 'active', turn = ?, message = ? WHERE id = ?`, [turn, `${player.name}'s turn`, roomId]);
  return { roomId, status: "active" };
}

export function drawCards(roomId) {
  const room = getRoom(roomId);
  if (room.status !== "active") throw new Error("War not active");
  for (const player of room.players) {
    const deck = JSON.parse(player.deck);
    const hand = deck.splice(0, 13);
    runQuery(`UPDATE players SET hand = ?, deck = ? WHERE id = ?`, [
      JSON.stringify(hand),
      JSON.stringify(deck),
      player.id,
    ]);
  }
  return true;
}

export function playCard(roomId, playerId, cardIndex) {
  const room = getRoom(roomId);
  const player = room?.players.find(p => p.id === playerId);

  if (!player || !room) throw new Error("Invalid room/player");

  if (room.turn !== playerId) {
    throw new Error("It's not your turn");
  }
  let hand = JSON.parse(player.hand);
  let pit = JSON.parse(room.pit);

  const [card] = hand.splice(cardIndex, 1);
  // card removed from player's hand
  runQuery(`UPDATE players SET hand = ? WHERE id = ?`, [
    JSON.stringify(hand),
    playerId,
  ]);

  // card pushed to pit, turn updated
  pit.push({ card, playerId: playerId });
  const newTurnIndex = (room.players.findIndex(p => p.id === room.turn) + 1) % room.players.length;
  const newPlayer = room.players[newTurnIndex];
  const newTurn = newPlayer.id;
  runQuery(`UPDATE war_rooms SET pit = ?, turn = ?, message = ? WHERE id = ?`, [
    JSON.stringify(pit),
    newTurn,
    `${newPlayer.name}'s turn`,
    roomId,
  ]);

  return { pit, room };
}

export function updateWinner (roomId, winnerId) {
  const room = getRoom(roomId);
  if (winnerId == "") {
    const message = "It's a draw!";
    runQuery(`UPDATE war_rooms SET message = ? WHERE id = ?`, [message, roomId]);
    return { message };
  } else {
    const winnerPlayer = room.players.find(p => p.id === winnerId);
    runQuery(`UPDATE players SET score = score + 1 WHERE id = ?`, [winnerPlayer.id]);
    const message = `${winnerPlayer.name} wins this pit!`;
    runQuery(`UPDATE war_rooms SET message = ?, turn = ? WHERE id = ?`, [message, winnerId, roomId]);
    return { message };
  }
}

export function prepareNextTurn(roomId) {
  const room = getRoom(roomId);
  const nextTurnPlayer = room.players.find(p => p.id === room.turn);
  const hand = JSON.parse(nextTurnPlayer.hand);
  const deck = JSON.parse(nextTurnPlayer.deck);
  // If the hand is empty, check deck for cards
  if (hand.length === 0) {
    if (deck.length < 13) {
      // set finished status if no cards left
      runQuery(`UPDATE war_rooms SET status = 'finished', message = ? WHERE id = ?`, ["Game over!", roomId]);
      return;
    } else {
      drawCards(roomId);
      runQuery(`UPDATE war_rooms SET pit = '[]', message = ? WHERE id = ?`, [
        `${nextTurnPlayer.name}'s turn`,
        roomId,
      ]);
      return;
    }
  } else {
    runQuery(`UPDATE war_rooms SET pit = '[]', message = ? WHERE id = ?`, [
      `${nextTurnPlayer.name}'s turn`,
      roomId,
    ]);
    return;
  }
}

export function clearPit(roomId) {
  runQuery(`UPDATE war_rooms SET pit = '[]' WHERE id = ?`, [roomId]);
  return { roomId, pit: [] };
}

export function updateScore(playerId, delta) {
  const player = getQuery(`SELECT * FROM players WHERE id = ?`, [playerId]);
  if (!player) throw new Error("Player not found");

  const newScore = (player.score || 0) + delta;

  runQuery(`UPDATE players SET score = ? WHERE id = ?`, [newScore, playerId]);
  return { playerId, score: newScore };
}

export function updateOnlineStatus(playerId, isOnline) {
  const player = getQuery(`SELECT * FROM players WHERE id = ?`, [playerId]);
  if (!player) throw new Error("Player not found");

  const newStatus = isOnline ? "online" : "offline";

  runQuery(`UPDATE players SET online_status = ? WHERE id = ?`, [
    newStatus,
    playerId,
  ]);

  return { playerId, onlineStatus: newStatus };
}
