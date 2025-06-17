const mysql = require('mysql2');
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Northwest101$',
  database: 'chess_rpg'
});

db.connect((err) => {
  if (err) {
    console.error('❌ MySQL connection failed:', err);
  } else {
    console.log('✅ Connected to MySQL!');
  }
});

const express = require('express');
const app = express();
const bodyParser = require('body-parser');

// This allows the server to read JSON data from the frontend
app.use(bodyParser.json());

// Start the server
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server is live at http://localhost:${PORT}`);
});



// Homepage route
app.get('/', (req, res) => {
  res.send('Chess RPG server is running!');
});


// Sample battle route (GET)
app.get('/battle', (req, res) => {
  res.send('⚔️ A battle has started between two pieces!');
});

// POST route to simulate a battle between two pieces
app.post('/battle', (req, res) => {
  const { attacker, defender } = req.body;

  // Define basic HP and attack stats
  const pieceStats = {
    Knight: { hp: 30, atk: 10 },
    Bishop: { hp: 25, atk: 8 },
    Rook:   { hp: 35, atk: 7 },
    Queen:  { hp: 40, atk: 12 },
    Pawn:   { hp: 20, atk: 5 }
  };

  // Clone stats so we don't mutate the original
  let attackerStats = { ...pieceStats[attacker] };
  let defenderStats = { ...pieceStats[defender] };

  // Randomly choose who goes first
  const firstTurn = Math.random() < 0.5 ? 'attacker' : 'defender';

  if (firstTurn === 'attacker') {
    defenderStats.hp -= attackerStats.atk;
    if (defenderStats.hp > 0) {
      attackerStats.hp -= defenderStats.atk;
    }
  } else {
    attackerStats.hp -= defenderStats.atk;
    if (attackerStats.hp > 0) {
      defenderStats.hp -= attackerStats.atk;
    }
  }

  // Determine winner
  let winner = '';
  if (attackerStats.hp > defenderStats.hp) {
    winner = attacker;
  } else if (defenderStats.hp > attackerStats.hp) {
    winner = defender;
  } else {
    winner = 'Draw';
  }

  // Add XP and coin rewards (attacker gains them only if they win)
let xpReward = 0;
let coinReward = 0;

if (winner === attacker) {
  xpReward = 20;
  coinReward = 50;
}


  // Build the message to send back
  const message = `⚔️ ${attacker} vs ${defender}
First move: ${firstTurn === 'attacker' ? attacker : defender}
${attacker} HP: ${attackerStats.hp}
${defender} HP: ${defenderStats.hp}
Winner: ${winner}`;

res.json({
  message,
  result: winner,
  attackerStats: {
    name: attacker,
    hp: attackerStats.hp
  },
  defenderStats: {
    name: defender,
    hp: defenderStats.hp
  },
  rewards: {
    xp: xpReward,
    coins: coinReward
  }
});

});

// Sample shop items
const shopItems = [
  { id: 1, name: 'Health Potion', cost: 50, effect: '+10 HP in battle' },
  { id: 2, name: 'XP Booster', cost: 100, effect: '+10 XP after win' },
  { id: 3, name: 'Attack Chip', cost: 75, effect: '+2 ATK for battles' }
];

// Route to show shop items
app.get('/shop', (req, res) => {
  res.json(shopItems);
});

// Route to buy an item
app.post('/buy', (req, res) => {
  const { itemId, coins } = req.body;

  const item = shopItems.find(i => i.id === itemId);
  if (!item) {
    return res.status(404).json({ message: 'Item not found' });
  }

  if (coins < item.cost) {
    return res.status(400).json({ message: 'Not enough coins!' });
  }

  const remainingCoins = coins - item.cost;
  res.json({
    message: `✅ You bought: ${item.name}`,
    remainingCoins
  });
});





app.get('/player', (req, res) => {
  const fakePlayer = {
    name: 'Player1',
    xp: 120,
    coins: 200,
    level: Math.floor(120 / 100) + 1 // Level formula: 100 XP per level
  };

  res.json(fakePlayer);
});







