import React, { useState, useEffect, useCallback } from 'react';
import useWebSocket from 'react-use-websocket';
import styles from './PlayerDraft.module.css';
import {User} from './Login.tsx';

interface Player {
  id: string;
  name: string;
}

// interface User {
//   id: string;
//   name: string;
// }

interface WebSocketMessage {
  type: 'playerList' | 'turnUpdate' | 'playerSelected' | 'playerConnect' | 'startDraft';
  players?: Player[];
  user?: string;
  player?: Player;
  users?: User[]
  usersConnected?: User[]
}

const PlayerDraft: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentTurn, setCurrentTurn] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [draftStarted, setDraftStarted] = useState(false);

  // TODO: get league id instead of harcoding
  const { sendMessage, lastMessage } = useWebSocket<WebSocketMessage>('ws://0.0.0.0:5001/player_draft/8',
    {shouldReconnect: () => draftStarted}
  );

  useEffect(() => {
    if (lastMessage === null) {
      sendMessage(JSON.stringify({type: 'playerConnect'}));
    }
    else {
      const data = JSON.parse(lastMessage.data) as WebSocketMessage;
      console.log(data)
      switch (data.type) {
        case 'playerList':
          setPlayers(data.players || []);
          break;
        case 'turnUpdate':
          setCurrentTurn(data.user || '');
          setTimeLeft(60);
          break;
        case 'playerSelected':
          if (data.player) {
            setSelectedPlayers(prev => [...prev, data.player!]);
            setPlayers(prev => prev.filter(p => p.id !== data.player!.id));
          }
          break;
      }
    }
  }, [lastMessage, draftStarted]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (timeLeft > 0) {
        setTimeLeft(prev => prev - 1);
      } else {
        sendMessage(JSON.stringify({ type: 'timeUp' }));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, sendMessage]);

  const selectPlayer = useCallback((player: Player) => {
    sendMessage(JSON.stringify({ type: 'selectPlayer', player }));
  }, [sendMessage]);

  return (
    draftStarted ? (
      <div className={styles.draftContainer}>
        <h2>Player Draft</h2>
        <p>Current Turn: {currentTurn}</p>
        <p>Time Left: {timeLeft} seconds</p>
        <div className={styles.playerList}>
          {players.map(player => (
            <button
              key={player.id}
              onClick={() => selectPlayer(player)}
              className={styles.playerButton}
            >
              {player.name}
            </button>
          ))}
        </div>
        <div className={styles.selectedPlayers}>
          <h3>Selected Players:</h3>
          <ul>
            {selectedPlayers.map(player => (
              <li key={player.id}>{player.name}</li>
            ))}
          </ul>
        </div>
      </div>
    ) : (
      <div className={styles.draftContainer}>
        <h2>Begin Draft</h2>
        <button onClick={() => setDraftStarted(true)}>Start Draft</button>
      </div>
    )
  )
};

export default PlayerDraft;
