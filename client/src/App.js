import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [player, setPlayer] = useState(null);
  const [attacker, setAttacker] = useState('Knight');
  const [defender, setDefender] = useState('Bishop');
  const [result, setResult] = useState('');
  const [attackerStats, setAttackerStats] = useState(null);
  const [defenderStats, setDefenderStats] = useState(null);
  const [xp, setXp] = useState(0);
  const [coins, setCoins] = useState(0);
  const [shop, setShop] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/player')
      .then(res => res.json())
      .then(data => {
        setPlayer(data);
      });
  }, []);

  const startBattle = async () => {
    try {
      const response = await fetch('http://localhost:3000/battle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attacker, defender }),
      });

      const data = await response.json();
      setResult(data.message);
      setAttackerStats(data.attackerStats);
      setDefenderStats(data.defenderStats);
      setXp(data.rewards?.xp || 0);
      setCoins(data.rewards?.coins || 0);

      if (data.rewards?.xp || data.rewards?.coins) {
        const newXp = player.xp + data.rewards.xp;
        const newCoins = player.coins + data.rewards.coins;
        const newLevel = Math.floor(newXp / 100) + 1;
        const leveledUp = newLevel > player.level;

        setPlayer({
          ...player,
          xp: newXp,
          coins: newCoins,
          level: newLevel
        });

        if (leveledUp) {
          alert(`🎉 You leveled up to level ${newLevel}!`);
        }
      }

    } catch (error) {
      console.error('Battle failed:', error);
      setResult('Something went wrong...');
    }
  };

  const loadShop = async () => {
    const res = await fetch('http://localhost:3000/shop');
    const items = await res.json();
    setShop(items);
  };

  const buyItem = async (item) => {
    const res = await fetch('http://localhost:3000/buy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId: item.id, coins: player.coins })
    });

    const data = await res.json();

    if (res.ok) {
      alert(data.message);
      setPlayer(prev => ({
        ...prev,
        coins: data.remainingCoins
      }));
    } else {
      alert(data.message);
    }
  };

  const renderHealthBar = (hp) => {
    const percent = Math.max(0, (hp / 40) * 100);
    return (
      <div style={{ background: '#ccc', width: '100%', height: '20px', borderRadius: '5px' }}>
        <div style={{
          width: `${percent}%`,
          height: '100%',
          backgroundColor: percent > 50 ? 'green' : percent > 20 ? 'orange' : 'red',
          transition: 'width 0.3s',
          borderRadius: '5px'
        }} />
      </div>
    );
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', maxWidth: '600px', margin: 'auto' }}>
      <h1>Chess RPG Battle</h1>

      {player ? (
        <div style={{ marginBottom: '20px' }}>
          <p>🧍 Name: {player.name}</p>
          <p>⭐ XP: {player.xp}</p>
          <p>🧪 Level: {player.level}</p>
          <p>💰 Coins: {player.coins}</p>
        </div>
      ) : (
        <p>Loading player stats...</p>
      )}

      <div>
        <label>Attacker: </label>
        <select value={attacker} onChange={(e) => setAttacker(e.target.value)}>
          <option>Knight</option>
          <option>Rook</option>
          <option>Bishop</option>
          <option>Queen</option>
          <option>Pawn</option>
        </select>
      </div>

      <div>
        <label>Defender: </label>
        <select value={defender} onChange={(e) => setDefender(e.target.value)}>
          <option>Knight</option>
          <option>Rook</option>
          <option>Bishop</option>
          <option>Queen</option>
          <option>Pawn</option>
        </select>
      </div>

      <button style={{ marginTop: '10px' }} onClick={startBattle}>Start Battle</button>

      <div style={{ marginTop: '30px' }}>
        {attackerStats && (
          <div>
            <h3>{attackerStats.name} HP: {attackerStats.hp}</h3>
            {renderHealthBar(attackerStats.hp)}
          </div>
        )}

        {defenderStats && (
          <div style={{ marginTop: '20px' }}>
            <h3>{defenderStats.name} HP: {defenderStats.hp}</h3>
            {renderHealthBar(defenderStats.hp)}
          </div>
        )}
      </div>

      {result && (
        <p style={{ marginTop: '30px', fontSize: '18px', whiteSpace: 'pre-line' }}>{result}</p>
      )}

      {(xp > 0 || coins > 0) && (
        <div style={{ marginTop: '20px', fontSize: '16px' }}>
          <p>🏅 You earned {xp} XP and 💰 {coins} coins!</p>
        </div>
      )}

      <hr style={{ margin: '40px 0' }} />
      <h2>🛒 Shop</h2>

      <button onClick={loadShop}>Load Shop</button>

      {shop.length > 0 && (
        <ul>
          {shop.map(item => (
            <li key={item.id} style={{ marginBottom: '15px' }}>
              <strong>{item.name}</strong> – {item.cost} coins<br />
              <em>{item.effect}</em><br />
              <button onClick={() => buyItem(item)}>Buy</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
