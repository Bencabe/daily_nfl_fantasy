import { useState } from 'react';
import styles from './PlayerPointsCard.module.css';
import { BaseStat, Player, PlayerScores } from '../api/openapi';
import FantasyEPLModal from './FantasyEPLModal';
import { convertStatName } from '../utils/helperFunctions';

const PlayerPointsCard = ({ player, stats }: { player: Player; stats: PlayerScores }) => {
  const [showModal, setShowModal] = useState(false);
  const [showPlayerStats, setShowPlayerStats] = useState(true);

  return (
    <>
      <div className={styles.playerCard} onClick={() => setShowModal(true)}>
        <div>{player.displayName.split(' ').slice(1).join(' ')}</div>
        <div>{Object.values(stats.fixtureStats || {})?.at(0)?.playerStats?.totalScore || 0} pts</div>
      </div>
      
      <FantasyEPLModal isOpen={showModal} onClose={() => setShowModal(false)}>
        <div className={styles.modalHeader}>
          <h2>{player.displayName}</h2>
          <div className={styles.toggleContainer}>
            <button 
              className={`${styles.toggleButton} ${showPlayerStats ? styles.active : ''}`}
              onClick={() => setShowPlayerStats(true)}
            >
              Player Stats
            </button>
            <button 
              className={`${styles.toggleButton} ${!showPlayerStats ? styles.active : ''}`}
              onClick={() => setShowPlayerStats(false)}
            >
              Team Stats
            </button>
          </div>
        </div>

        <table className={styles.statsTable}>
          <thead>
            <tr>
              <th>Stat</th>
              <th>Value</th>
              {showPlayerStats && <th>Points</th>}
            </tr>
          </thead>
          <tbody>
            {Object.entries(stats.fixtureStats || {}).map(([fixtureId, fixture]) => {
              if (showPlayerStats) {
                const playerStats = Object.entries(fixture.playerStats)
                  .filter(([key, stat]) => 
                    typeof stat === 'object' && 
                    'points' in stat && 
                    stat.points !== 0 && 
                    key !== 'totalScore'
                  );

                return playerStats.map(([statName, stat]) => (
                  <tr key={`${fixtureId}-${statName}`}>
                    <td>{convertStatName(statName)}</td>
                    <td>{(stat as BaseStat).value}</td>
                    <td>{(stat as BaseStat).points}</td>
                  </tr>
                ));
              } else {
                const teamStats = Object.entries(fixture.teamStats)
                  .filter(([_, value]) => value !== 0);

                return teamStats.map(([statName, value]) => (
                  <tr key={`${fixtureId}-${statName}`}>
                    <td>{convertStatName(statName)}</td>
                    <td>{value}</td>
                  </tr>
                ));
              }
            })}
          </tbody>
          <tfoot>
            {showPlayerStats && (
              <tr>
                <td colSpan={2}>Total Score</td>
                <td>
                  {Object.values(stats.fixtureStats || {})?.at(0)?.playerStats?.totalScore || 0}
                </td>
              </tr>
            )}
          </tfoot>
        </table>
      </FantasyEPLModal>
    </>
  );
};

export default PlayerPointsCard;
