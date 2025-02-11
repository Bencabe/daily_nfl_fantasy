import React, { useState, useEffect, useCallback } from 'react';
import useWebSocket from 'react-use-websocket';
import styles from './PlayerDraft.module.css';
import { User } from './Login.tsx';
import { useGlobalContext } from '../utils/customHooks.ts';
import SelectedPlayersView from './SelectedPlayerView';
import { Player, LeagueTeams, WebSocketMessage } from '../types/draft';
import config from '../../config'
import { FootballTeam, LeagueTeam } from '../api/openapi/index.ts';
import getApi from '../api/main';
import { PlayerLimits } from '../types/team.ts';

const PlayerDraft: React.FC = () => {
  const TURN_TIME = 120;
  const [players, setPlayers] = useState<Player[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [nameFilter, setNameFilter] = useState('');
  const [teamFilter, setTeamFilter] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [leagueUsers, setLeagueUsers] = useState<User[]>([]);
  const [currentTurn, setCurrentTurn] = useState<number>();
  const [timeLeft, setTimeLeft] = useState<number>(TURN_TIME);
  const [draftStarted, setDraftStarted] = useState(false);
  const [isDraftComplete, setIsDraftComplete] = useState<boolean>(false);
  const [leagueTeams, setLeagueTeams] = useState<LeagueTeams>({});
  const [leagueArray, setLeagueArray] = useState<LeagueTeam[]>([]);
  const [viewMode, setViewMode] = useState<'players' | 'selected'>('players');
  const [footballTeams, setFootballTeams] = useState<FootballTeam[]>([]);
  const { user } = useGlobalContext();
  const api = getApi();


  useEffect(() => {
    const fetchInitialData = async () => {
      const teams = await api.getFootballTeams();
      const leagueArray = await api.getLeagueTeams(user.activeLeague);
      setFootballTeams(teams);
      setLeagueArray(leagueArray);
    };
    fetchInitialData()
  },[])

  const canPickPlayer = (player: Player) => {
    const isPlayerSelected = Object.values(leagueTeams).some(team => {
      return [...team.goalkeepers, ...team.defenders, ...team.midfielders, ...team.forwards, ...team.subs].includes(player.id)
    });
    
    if (isPlayerSelected || currentTurn !== user.id) {
      return false;
    }
  
    const userTeam = leagueTeams[user.id];
    if (!userTeam) {
      return false;
    }
  
    switch (player.positionCategory) {
      case 'Goalkeeper':
        return userTeam.goalkeepers.length < PlayerLimits.TOTAL_GOALKEEPERS;
      case 'Defender':
        return userTeam.defenders.length < PlayerLimits.TOTAL_DEFENDERS;
      case 'Midfielder':
        return userTeam.midfielders.length < PlayerLimits.TOTAL_MIDFIELDERS;
      case 'Forward':
        return userTeam.forwards.length < PlayerLimits.TOTAL_FORWARDS;
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

  const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  const { sendMessage, lastMessage } = useWebSocket<WebSocketMessage>(
    `${wsProtocol}://${config.host.split("//")[1]}:${config.port}/player_draft/${user.activeLeague}?user_id=${user.id}`,
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
          break;
        case 'turnChange':
          setCurrentTurn(data.nextUserId);
          setTimeLeft(TURN_TIME);
          setLeagueTeams(data.leagueTeams || {});
          break;
        case 'draftCompleted':
          setLeagueTeams(data.leagueTeams || {});
          setIsDraftComplete(true);
      }
    }
  }, [lastMessage, draftStarted]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (timeLeft > 0) {
        setTimeLeft(prev => prev - 1);
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
    <div className={styles.draftContainer}>
      {isDraftComplete ? (
        <div className={styles.completionMessage}>
          <h2>Draft Complete! 🎉</h2>
          <p>Congratulations! Your team is ready for the season.</p>
          <SelectedPlayersView 
            leagueUsers={leagueUsers}
            leagueTeams={leagueTeams}
            players={players}
          />
        </div>
      ) : draftStarted ? (
        <>
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
                  {footballTeams.map(team => (
                    <option key={team.id} value={team.id.toString()}>
                      {team.name}
                    </option>
                  ))}
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
                      <td>
                        {footballTeams.find(team => team.id === player.teamId)?.name || player.teamId}
                      </td>
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
        </>
      ) : (
        <div className={styles.startDraftContainer}>
          <div className={styles.startDraftCard}>
            <h2>Welcome to the Draft Zone</h2>
            <p>Get ready to build your dream team!</p>
            <div className={styles.draftInfo}>
              <h3>Participating Teams</h3>
              <div className={styles.teamsList}>
                {Object.entries(leagueArray).map(([userId, team]) => {
                  // const teamUser = leagueUsers.find(user => user.id === Number(userId));
                  return (
                    <div key={userId} className={styles.teamItem}>
                      {team.teamName}
                    </div>
                  );
                })}
              </div>
            </div>
            <button 
              className={styles.startDraftButton} 
              onClick={() => startDraft()}
            >
              Start Draft
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerDraft;
