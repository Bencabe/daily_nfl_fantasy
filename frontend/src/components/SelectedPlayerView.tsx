import React, { useState } from 'react';
import styles from './SelectedPlayerView.module.css';
import { Player, LeagueTeams } from '../types/draft';
import { User } from './Login';

interface SelectedPlayersViewProps {
  leagueUsers: User[];
  leagueTeams: LeagueTeams;
  players: Player[];
}

const SelectedPlayersView: React.FC<SelectedPlayersViewProps> = ({ 
  leagueUsers, 
  leagueTeams, 
  players 
}) => {
  const [expandedTeams, setExpandedTeams] = useState<{[key: number]: boolean}>({});

  const toggleTeam = (userId: number) => {
    setExpandedTeams(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  return (
    <div className={styles.selectedPlayersView}>
      {leagueUsers.map(leagueUser => {
        const team = leagueTeams[leagueUser.id];
        if (!team) return null;
        
        return (
          <div key={leagueUser.id} className={styles.teamSection}>
            <div 
              className={styles.teamHeader}
              onClick={() => toggleTeam(leagueUser.id)}
            >
              <h3>{leagueUser.firstName}'s Team</h3>
              <span className={styles.expandIcon}>
                {expandedTeams[leagueUser.id] ? '▼' : '▶'}
              </span>
            </div>
            {expandedTeams[leagueUser.id] && (
              <div className={styles.positionGroups}>
                <div className={styles.positionGroup}>
                  <h4>Goalkeepers</h4>
                  {players.filter(p => team.goalkeepers.includes(p.id))
                    .map(p => <div key={p.id}>{p.displayName}</div>)}
                </div>
                <div className={styles.positionGroup}>
                  <h4>Defenders</h4>
                  {players.filter(p => team.defenders.includes(p.id))
                    .map(p => <div key={p.id}>{p.displayName}</div>)}
                </div>
                <div className={styles.positionGroup}>
                  <h4>Midfielders</h4>
                  {players.filter(p => team.midfielders.includes(p.id))
                    .map(p => <div key={p.id}>{p.displayName}</div>)}
                </div>
                <div className={styles.positionGroup}>
                  <h4>Forwards</h4>
                  {players.filter(p => team.forwards.includes(p.id))
                    .map(p => <div key={p.id}>{p.displayName}</div>)}
                </div>
                <div className={styles.positionGroup}>
                  <h4>Substitutes</h4>
                  {players.filter(p => team.subs.includes(p.id))
                    .map(p => <div key={p.id}>{p.displayName}</div>)}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SelectedPlayersView;
