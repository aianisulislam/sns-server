"use client";
import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Image from "next/image";
import sword from "./assets/sword.svg";
import shield from "./assets/shield.svg";
import bow from "./assets/bow.svg";
import spear from "./assets/spear.svg";
import wheel from "./assets/wheel.svg";
import elephant from "./assets/elephant.svg";
import horse from "./assets/horse.svg";
import knight from "./assets/knight.svg";
import helmet from "./assets/helmet.svg";
import king from "./assets/king.svg";
import queen from "./assets/queen.svg";
import crown from "./assets/crown.svg";
import mark from "./assets/mark.svg";
import back from "./assets/back.svg";

const socket = io();

const suitsObj = {
  Crown: crown,
  Shield: shield,
  Bow: bow,
  Sword: sword,
  Spear: spear,
  "?": mark
};

const valuesObj = {
  King: king,
  Queen: queen,
  Wheel: wheel,
  Elephant: elephant,
  Horse: horse,
  Knight: knight,
  "9": helmet,
  "8": helmet,
  "7": helmet,
  "6": helmet,
  "5": helmet,
  "4": helmet,
  "3": helmet,
  "2": helmet,
  "1": helmet,
  "?": mark
};

const Modal = ({ show, onClose, children }) => {
  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.7)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
      onClick={onClose} // close when clicking outside
    >
      <div
        style={{
          backgroundColor: "#222",
          padding: "20px",
          borderRadius: "8px",
          minWidth: "300px",
          maxWidth: "90%",
        }}
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
      >
        {children}
      </div>
    </div>
  );
};

const Card = ({ value, suit, onClick }) => {
  const isFaceCard = [
    "Wheel",
    "Elephant",
    "Horse",
    "Knight"
  ].includes(value.name);
  return (
    <div
      onClick={onClick ? () => onClick() : undefined}
      style={{
        width: "120px",
        height: "180px",
        borderRadius: "12px",
        border: "2px solid #444",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: value.name == "?" ? undefined : "6px 4px",
        backgroundColor: "#333",
        boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
        color: "#fff",
        fontWeight: 500,
        cursor: onClick ? "pointer" : "default",
        fontFamily: "Impact, sans-serif",
      }}
    > {value.name == "?" && <Image src={back} style={{ width: '100%', height: '100%' }} alt="card back" />}
      {value.name !== "?" && (
        <>
          {/* Top-left value and suit */}
          <div>
            <div style={{ width: 18, display: 'flex', gap: 6, flexDirection: 'column' }}>
              {suit && <Image src={suit.symbol} style={{ width: '18px', height: '18px' }} alt="suit" />}
              {isFaceCard ? <Image src={value.symbol} style={{ width: '18px', height: '18px' }} alt="name" /> : <span style={{ width: "18px", textAlign: "center" }}>{value.name?.[0]}</span>}
            </div>
          </div>
          {/* Center suit/value display */}
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {<Image src={suit.name !== "Crown" ? suit.symbol : value.symbol} height={48} width={48} alt="center image" />}
          </div>
          {/* Bottom-right value and suit (rotated for traditional card style) */}
          <div
            style={{
              transform: "rotate(180deg)",
            }}
          >
            <div style={{ width: 18, display: 'flex', gap: 6, flexDirection: 'column' }}>
              {suit && <Image src={suit.symbol} style={{ width: '18px', height: '18px' }} alt="suit" />}
              {isFaceCard ? <Image src={value.symbol} style={{ width: '18px', height: '18px' }} alt="name" /> : <span style={{ width: "18px", textAlign: "center" }}>{value.name?.[0]}</span>}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const CardFan = ({ cards }) => {
  const total = cards.length;
  const spread = Math.min(total, 13); // max 13 cards
  const angleStep = 10; // degrees between cards
  const startAngle = -((spread - 1) * angleStep) / 2; // center the fan

  return (
    <div
      style={{
        position: "relative",
        width: "500px", // adjust for fan size
        height: "200px",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-end",
      }}
    >
      {cards.map((card, index) => {
        const angle = startAngle + index * angleStep;

        return (
          <div
            key={`${card.value?.name}-${card.suit?.name}-${index}`}
            style={{
              position: "absolute",
              bottom: 0,
              transform: `rotate(${angle}deg)`,
              transformOrigin: "bottom center",
              zIndex: index,
            }}
          >
            <Card value={card.value} suit={card.suit} onClick={card.onClick} />
          </div>
        );
      })}
    </div>
  );
};

const CardStack = ({ cards }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        position: "relative",
        paddingRight: "108px",
      }}
    >
      {cards.map((card, index) => (
        <div
          key={`${card.value?.name}-${card.suit?.name}-${index}`}
          style={{
            zIndex: index,
            width: 30
          }}
        >
          <Card
            value={card.value}
            suit={card.suit}
          />
        </div>
      ))}
    </div>
  );
};

const SuitCard = ({ suit }) => {
  return (
    <div
      style={{
        width: "36px",
        height: "54px",
        borderRadius: "6px",
        border: "2px solid #444",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "6px 4px",
        backgroundColor: "#333",
        boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
        color: "#fff",
      }}
    >
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        {<Image src={suit.symbol} height={24} width={24} alt="suit" />}
      </div>
    </div>
  );
};


export default function App() {
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [gameState, setGameState] = useState(null);
  const [myPlayerId, setMyPlayerId] = useState("");
  const [myState, setMyState] = useState(null);
  const [opponentState, setOpponentState] = useState(null);
  const [isPlayEnabled, setIsPlayEnabled] = useState(false);

  useEffect(() => {
    if (gameState && myPlayerId) {
      const myPlayer = gameState.players.find(p => p.id === myPlayerId);
      const opponentPlayer = gameState.players.find(p => p.id !== myPlayerId);
      setMyState(myPlayer);
      setOpponentState(opponentPlayer);
      gameState.turn === myPlayerId && gameState.pit.length < 2 ? setIsPlayEnabled(true) : setIsPlayEnabled(false);
    }
  }, [myPlayerId, gameState]);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("✅ Connected to server");
    });

    socket.on("roomUpdated", (data) => {
      updateGameState(data);
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected");
    });

    return () => {
      socket.off("connect");
      socket.off("roomUpdated");
      socket.off("disconnect");
    };
  }, []);

  const updateGameState = (data) => {
    const newGameData = {
      ...data,
      player_ids: JSON.parse(data.player_ids),
      pit: JSON.parse(data.pit).map(p => ({
        card: {
          value: {
            name: p.card.value,
            symbol: valuesObj[p.card.value],
          },
          suit: {
            name: p.card.suit,
            symbol: suitsObj[p.card.suit],
          },
        },
        playerId: p.playerId,
      })),
      players: data.players.map(player => ({
        ...player,
        deck: (JSON.parse(player.deck)).map(card => ({
          value: {
            name: card.value,
            symbol: valuesObj[card.value],
          },
          suit: {
            name: card.suit,
            symbol: suitsObj[card.suit],
          },
        })),
        hand: (JSON.parse(player.hand)).map(card => ({
          value: {
            name: card.value,
            symbol: valuesObj[card.value],
          },
          suit: {
            name: card.suit,
            symbol: suitsObj[card.suit],
          },
        }))
      })),
    }
    console.log("Updated game state:", newGameData);
    setGameState((prev) => {
      if (!prev) {
        setMyPlayerId(newGameData.player_ids[newGameData.player_ids.length - 1]);
      }
      return newGameData;
    });
  }
  

  const handleCreateRoom = () => {
    socket.emit("createRoom", { name });
    setShowCreate(false);
    setName("");
  };

  const handleJoinRoom = () => {
    socket.emit("joinRoom", { name, roomId });
    setShowJoin(false);
    setName("");
    setRoomId("");
  };

  const handlePlayCard = (i) => {
    setIsPlayEnabled(false);
    socket.emit("playCard", {
      playerId: myState.id,
      roomId: gameState.id,
      cardIndex: i
    })
  }

  const isCardAllowedToPlay = (card) => {
    if (card.suit.name === "Crown") return true; // Crown can always be played
    if (gameState.pit.length === 0) return true; // First card can always be played
    const firstCardSuit = gameState.pit[0].card.suit.name;
    if (firstCardSuit == "Crown" || card.suit.name === firstCardSuit) return true; // Same suit or when crown is played first
    if (myState.hand.some(c => c.suit.name === firstCardSuit)) return false; // If you have the first suit, you must play it
    return true; //
  }
  return (
    <div >
      <div style={{ color: "#fff", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <CardFan
          cards={(opponentState?.hand ?? []).map((c, i) => ({
            value: c.value,
            suit: c.suit,
          }))}
        />
        <div style={{ color: "#ff999c", marginTop: "54px" }}>{opponentState ? `${opponentState.name} (${opponentState.score})`: !myState ? "Create or join a war!" : "Waiting for opponent to join!"}</div>
        <div style={{ margin: "20px", paddingTop: "20px", border: "2px solid #444", borderRadius: "8px", backgroundColor: "#222", width: "308px", position: "relative" }}>
          <div
            onClick={() => setShowInfo(true)}
            style={{ fontSize: 16, fontWeight: 300, position: 'absolute', right: 4, top: 0, cursor: 'pointer' }}
          >&#9432;</div>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", height: "196px" }}>
            {gameState && (gameState?.pit ?? []).map((p, index) => (
              <div key={index} style={{ margin: "0 5px" }}>
                <Card
                  value={p.card.value}
                  suit={p.card.suit}
                />
              </div>)
            )}
            {!gameState && (
              <>
                <div
                  onClick={() => setShowCreate(true)}
                  style={
                    {
                      width: "120px",
                      height: "180px",
                      borderRadius: "12px",
                      border: "2px solid #444",
                      display: "flex",
                      flexDirection: "column",
                      padding: "6px 4px",
                      backgroundColor: "#333",
                      boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                      color: "#fff",
                      fontFamily: "sans-serif",
                      textAlign: "center",
                      margin: "0 5px"
                    }
                  }
                >
                  Create a war
                </div>
                <div
                  onClick={() => setShowJoin(true)}
                  style={
                    {
                      width: "120px",
                      height: "180px",
                      borderRadius: "12px",
                      border: "2px solid #444",
                      display: "flex",
                      flexDirection: "column",
                      padding: "6px 4px",
                      backgroundColor: "#333",
                      boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                      color: "#fff",
                      fontFamily: "sans-serif",
                      textAlign: "center",
                      margin: "0 5px"
                    }
                  }
                >
                  Join a war
                </div>

              </>
            )}
          </div>

          <div style={{ textAlign: "center", color: "#fff", fontWeight: "bold", margin: "10px" }}>
            {gameState?.message ?? ""}
          </div>
        </div>

        <CardFan
          cards={(myState?.hand ?? []).map((c, i) => ({
            value: c.value,
            suit: c.suit,
            onClick: !isPlayEnabled
              ? null // not my turn
              : !isCardAllowedToPlay(c)
                ? null // Not the right suit to play
                : () => {
                handlePlayCard(i);
              },
          }))}
        />
        {myState && <div style={{ color: "#99acff", marginTop: "54px" }}>{myState.name} ({myState.score})</div>}
        <Modal
          show={showInfo}
          onClose={() => setShowInfo(false)}
        >
          <div >
            <div style={{ fontWeight: 700, fontSize: 18, textAlign: 'center' }}>Game Rules:</div>
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', gap: 60, marginTop: 12 }}>
                <CardStack cards={["Wheel", "Elephant", "Horse", "Knight", "9", "8", "7", "6", "5", "4", "3", "2", "1"].reverse().map(v => ({
                  value: { name: v, symbol: valuesObj[v] },
                  suit: {
                    name: "Shield",
                    symbol: suitsObj["Shield"]
                  }
                }))} />
                <CardStack cards={["Wheel", "Elephant", "Horse", "Knight", "9", "8", "7", "6", "5", "4", "3", "2", "1"].reverse().map(v => ({
                  value: { name: v, symbol: valuesObj[v] },
                  suit: {
                    name: "Sword",
                    symbol: suitsObj["Sword"]
                  }
                }))} />
              </div>
              <div style={{ display: 'flex', gap: 60, marginTop: 12 }}>
                <CardStack cards={["Wheel", "Elephant", "Horse", "Knight", "9", "8", "7", "6", "5", "4", "3", "2", "1"].reverse().map(v => ({
                  value: { name: v, symbol: valuesObj[v] },
                  suit: {
                    name: "Bow",
                    symbol: suitsObj["Bow"]
                  }
                }))} />
               <CardStack cards={["Wheel", "Elephant", "Horse", "Knight", "9", "8", "7", "6", "5", "4", "3", "2", "1"].reverse().map(v => ({
                  value: { name: v, symbol: valuesObj[v] },
                  suit: {
                    name: "Spear",
                    symbol: suitsObj["Spear"]
                  }
                }))} />
              </div>
              <div style={{ display: 'flex', gap: 12, position: 'absolute', top: 0, right: 0, left: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
                <Card value={{name: "King", symbol: valuesObj.King}} suit={{ name: "Crown", symbol: crown }} />
                <Card value={{name: "Queen", symbol: valuesObj.Queen}} suit={{ name: "Crown", symbol: crown }} />
              </div>
            </div>
            <br />


            <ul style={{ lineHeight: 2 }}>
              <li><b>Distribution:</b> Each player has 54 cards (4 suits &times; 13 cards + 2 crown cards).</li>
              <li><b>Rounds:</b> The game has 4 rounds. In each round, players use 13 cards, playing one card at a time until all 13 are used.</li>
              <li><b>Pit:</b> The first player may play any card. The second player must play a card of the same suit if they have one; otherwise, they may play any card.</li>
              <li><b>Wildcards:</b> Crown cards can be played on top of any card. Once a crown is played, the next player is free to play any card they choose. </li>
              <li><b>Winning:</b>
                <ul>
                  <li>If both players play the same suit, the higher value wins; equal values result in a draw.</li>
                  <li>If a crown card (king or queen) is played, it beats every other card. If both players play a crown, the pit is a draw.</li>
                  <li>If two different suits are played, the card values don&apos;t matter. Instead, compare the suits according to the hierarchy shown below:
                    <div style={{ margin: 12, display: "flex", justifyContent: "center", alignItems: "center", gap: 48 }}>
                      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 4, border: "2px solid #444", borderRadius: "8px", padding: 6 }}>
                        <SuitCard suit={{name: "Shield", symbol: suitsObj.Shield}} />
                        <div>&gt;</div>
                        <SuitCard suit={{name: "Bow", symbol: suitsObj.Bow}} />
                      </div>
                      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 4, border: "2px solid #444", borderRadius: "8px", padding: 6 }}>
                        <SuitCard suit={{name: "Bow", symbol: suitsObj.Bow}} />
                        <div>&gt;</div>
                        <SuitCard suit={{name: "Sword", symbol: suitsObj.Sword}} />
                      </div>
                      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 4, border: "2px solid #444", borderRadius: "8px", padding: 6 }}>
                        <SuitCard suit={{name: "Sword", symbol: suitsObj.Sword}} />
                        <div>&gt;</div>
                        <SuitCard suit={{name: "Spear", symbol: suitsObj.Spear}} />
                      </div>
                      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 4, border: "2px solid #444", borderRadius: "8px", padding: 6 }}>
                        <SuitCard suit={{name: "Spear", symbol: suitsObj.Spear}} />
                        <div>&gt;</div>
                        <SuitCard suit={{name: "Shield", symbol: suitsObj.Shield}} />
                      </div>
                      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 4, border: "2px solid #444", borderRadius: "8px", padding: 6 }}>
                        <SuitCard suit={{name: "Shield", symbol: suitsObj.Shield}} />
                        <div>=</div>
                        <SuitCard suit={{name: "Sword", symbol: suitsObj.Sword}} />
                      </div>
                      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 4, border: "2px solid #444", borderRadius: "8px", padding: 6 }}>
                        <SuitCard suit={{name: "Bow", symbol: suitsObj.Bow}} />
                        <div>=</div>
                        <SuitCard suit={{name: "Spear", symbol: suitsObj.Spear}} />
                      </div>
                    </div>
                    <div>Shield blocks arrow. Arrow has longer range than Sword. Sword cuts spear. Spear breaks Shield. Sword & Shield are equals. Arrow & Spear are equals</div>
                  </li>

                </ul>
              </li>
            </ul>
            <button
              style={{ marginTop: "15px" }}
              onClick={() => setShowInfo(false)}
            >
              Close
            </button>

          </div>
        </Modal>
      </div>


      <Modal show={showCreate} onClose={() => setShowCreate(false)}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h4>Create A New War</h4>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            style={{
              padding: "12px 12px",
              borderRadius: "6px",
              border: 'none'
            }}
            onChange={(e) => setName(e.target.value)}
          />
          <button
            onClick={handleCreateRoom}
            disabled={!name}
            style={{
              padding: "12px 12px",
              borderRadius: "6px",
              border: 'none'
            }}
          >
            Submit
          </button>
        </div>
      </Modal>
      <Modal show={showJoin} onClose={() => setShowJoin(false)}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h4>Join An Existing War</h4>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            style={{
              padding: "12px 12px",
              borderRadius: "6px",
              border: 'none'
            }}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Enter the War ID"
            value={roomId}
            style={{
              padding: "12px 12px",
              borderRadius: "6px",
              border: 'none'
            }}
            onChange={(e) => setRoomId(e.target.value)}
          />
          <button
            onClick={handleJoinRoom}
            disabled={!name || !roomId}
            style={{
              padding: "12px 12px",
              borderRadius: "6px",
              border: 'none'
            }}
          >
            Submit
          </button>
        </div>
      </Modal>
    </div>
  );
}