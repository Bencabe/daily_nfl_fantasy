import React, { useState, useEffect, useCallback } from 'react';
import useWebSocket from 'react-use-websocket';
import styles from './PlayerDraft.module.css';
import { User } from './Login.tsx';
import { useGlobalContext } from '../utils/customHooks.ts';
import SelectedPlayersView from './SelectedPlayerView';
import { Player, LeagueTeams, WebSocketMessage } from '../types/draft';

const PlayerDraft: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [nameFilter, setNameFilter] = useState('');
  const [teamFilter, setTeamFilter] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [leagueUsers, setLeagueUsers] = useState<User[]>([]);
  const [currentTurn, setCurrentTurn] = useState<number>();
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [draftStarted, setDraftStarted] = useState(false);
  const [leagueTeams, setLeagueTeams] = useState<LeagueTeams>({});
  const [viewMode, setViewMode] = useState<'players' | 'selected'>('players');
  const { user } = useGlobalContext();

  const updateSelectedPlayers = () => {
    const allSelectedPlayers: Player[] = [];
    Object.values(leagueTeams).forEach(team => {
      const positionArrays = [
        team.goalkeepers,
        team.defenders,
        team.midfielders,
        team.forwards,
        team.subs
      ];
      
      positionArrays.forEach(positionArray => {
        const playersInPosition = players.filter(player => 
          positionArray.includes(player.id)
        );
        allSelectedPlayers.push(...playersInPosition);
      });
    });
    setSelectedPlayers(allSelectedPlayers);
  };

  const canPickPlayer = (player: Player) => {
    if (selectedPlayers.some(selectedPlayer => selectedPlayer.id === player.id)) {
      return false;
    }
  
    if (currentTurn !== user.id) {
      return false;
    }
  
    const userTeam = leagueTeams[user.id];
    if (!userTeam) {
      return false;
    }
  
    switch (player.positionCategory) {
      case 'Goalkeeper':
        return userTeam.goalkeepers.length < 2;
      case 'Defender':
        return userTeam.defenders.length < 5;
      case 'Midfielder':
        return userTeam.midfielders.length < 5;
      case 'Forward':
        return userTeam.forwards.length < 3;
      default:
        return false;
    }
  };

  useEffect(() => {
    const filtered = players.filter(player => {
      const matchesName = player.displayName.toLowerCase().includes(nameFilter.toLowerCase());
      const matchesTeam = teamFilter === '' || player.teamId.toString() === teamFilter;
      const matchesPosition = positionFilter === '' || player.positionCategory === positionFilter;
      return matchesName && matchesTeam && matchesPosition;
    });
    setFilteredPlayers(filtered);
  }, [players, nameFilter, teamFilter, positionFilter, currentTurn]);

  const { sendMessage, lastMessage } = useWebSocket<WebSocketMessage>(
    `ws://0.0.0.0:5001/player_draft/${user.activeLeague}`,
    {shouldReconnect: () => draftStarted}
  );

  const getUserFromId = (userId: number | undefined) => {
    const user = leagueUsers.find(user => user.id === userId); 
    return user;
  }

  useEffect(() => {
    if (lastMessage === null) {
      sendMessage(JSON.stringify({messageType: 'playerConnect', 'playerId': user.id}));
    }
    else {
      const data = JSON.parse(lastMessage.data) as WebSocketMessage;
      switch (data.messageType) {
        case 'draftStatus':
          setPlayers(data.playerList || []);
          setLeagueUsers(data.leagueUsers || []);
          setDraftStarted(data.draftState || false);
          if (data.userTurn) {
            setCurrentTurn(data.userTurn.id);
          }
          setLeagueTeams(data.leagueTeams || {});
          updateSelectedPlayers()
          break;
        case 'turnChange':
          setCurrentTurn(data.nextUserId);
          setTimeLeft(60);
          setLeagueTeams(data.leagueTeams || {});
          updateSelectedPlayers()
          break;
      }
    }
  }, [lastMessage, draftStarted]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (timeLeft > 0) {
        setTimeLeft(prev => prev - 1);
      } else {
        console.log('Time expired!');
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, sendMessage]);

  const selectPlayer = useCallback((player: Player) => {
    sendMessage(JSON.stringify({ 
      messageType: 'playerSelected', 
      playerId: player.id,  
      userId: user.id,
      playerPosition: player.positionCategory
    }));
  }, [sendMessage]);

  const startDraft = useCallback(() => {
    setDraftStarted(true);
    sendMessage(JSON.stringify({ messageType: 'startDraft'}));
  }, [sendMessage]);

  return (
    draftStarted ? (
      <div className={styles.draftContainer}>
        <h2>Player Draft</h2>
        <p>Current Turn: {getUserFromId(currentTurn)?.firstName}</p>
        <p>Time Left: {timeLeft} seconds</p>
        
        <div className={styles.viewToggle}>
          <button 
            onClick={() => setViewMode('players')}
            className={viewMode === 'players' ? styles.activeView : ''}
          >
            Available Players
          </button>
          <button 
            onClick={() => setViewMode('selected')}
            className={viewMode === 'selected' ? styles.activeView : ''}
          >
            Selected Players
          </button>
        </div>

        {viewMode === 'players' ? (
          <div>
            <div className={styles.filters}>
              <input
                type="text"
                placeholder="Filter by name..."
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
              />
              <select value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)}>
                <option value="">All Teams</option>
              </select>
              <select value={positionFilter} onChange={(e) => setPositionFilter(e.target.value)}>
                <option value="">All Positions</option>
                <option value="Goalkeeper">Goalkeeper</option>
                <option value="Defender">Defender</option>
                <option value="Midfielder">Midfielder</option>
                <option value="Forward">Forward</option>
              </select>
            </div>

            <table className={styles.playerTable}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Position</th>
                  <th>Team</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlayers.map(player => (
                  <tr key={player.id}>
                    <td>{player.displayName}</td>
                    <td>{player.positionCategory}</td>
                    <td>{player.teamId}</td>
                    <td>
                      <button
                        onClick={() => selectPlayer(player)}
                        className={styles.selectButton}
                        disabled={!canPickPlayer(player)}
                      >
                        Select
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <SelectedPlayersView 
            leagueUsers={leagueUsers}
            leagueTeams={leagueTeams}
            players={players}
          />
        )}
      </div>
    ) : (
      <div className={styles.draftContainer}>
        <h2>Begin Draft</h2>
        <button onClick={() => startDraft()}>Start Draft</button>
      </div>
    )
  );
};

export default PlayerDraft;
