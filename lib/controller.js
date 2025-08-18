const valuesInOrder = [
  "Wheel",
  "Elephant",
  "Horse",
  "Knight",
  "9",
  "8",
  "7",
  "6",
  "5",
  "4",
  "3",
  "2",
  "1",
];

const suits = ["Shield", "Bow", "Sword", "Spear"];

const wildCards = [
  { value: "King", suit: "Crown" },
  { value: "Queen", suit: "Crown" }
]

const allCards = [...suits.flatMap((suit) =>
  valuesInOrder.map((value) => ({ value, suit }))
), ...wildCards];

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export const createDeck = () => shuffle([...allCards]);

export const decideWinner = (pit) => {
  if (!pit || pit.length === 0) return "";

  const isCrown = (card) => ["King", "Queen"].includes(card.value);

  // Rule 1: Crowns
  const crownPlayers = pit.filter(c => isCrown(c.card));
  if (crownPlayers.length === 1) return crownPlayers[0].playerId;
  if (crownPlayers.length > 1) return ""; // multiple crowns → draw

  const beats = {
    Shield: "Bow",
    Bow: "Sword",
    Sword: "Spear",
    Spear: "Shield",
  };

  const drawPairs = [
    ["Sword", "Shield"],
    ["Spear", "Bow"],
  ];

  const valueOrder = [
    "Wheel",
    "Elephant",
    "Horse",
    "Knight",
    "9",
    "8",
    "7",
    "6",
    "5",
    "4",
    "3",
    "2",
    "1",
  ];

  
  const firstCard = pit[0].card;
  const firstSuit = firstCard.suit;
  let highestValue = pit[0];
  for (const c of pit) {
    if(c.card.suit === firstSuit) {
      if (valueOrder.indexOf(c.card.value) < valueOrder.indexOf(highestValue.card.value)) {
        highestValue = c;
      } 
    } else if (beats[c.card.suit] === firstSuit) {
      if(highestValue.card.suit === firstSuit) {
        highestValue = c;
      } else {
        if (valueOrder.indexOf(c.card.value) < valueOrder.indexOf(highestValue.card.value)) {
         highestValue = c;
       } 
      }
    } else if (drawPairs.some(pair => pair.includes(c.card.suit) && pair.includes(firstSuit))) {
      highestValue = null; // draw
      break;
    }
  }

  if (!highestValue) {
    return ""
  } else {
    //check if there are duplicates for highest value card in the pit
    const winners = pit.filter(c => c.card.value === highestValue.card.value && c.card.suit === highestValue.card.suit);
    if (winners.length === 1) {
      return winners[0].playerId;
    }
    return ""; // multiple players with same highest card → draw
  }
};
