import { useState } from 'react';
import styles from './PlayerPointsCard.module.css';
import { BaseStat, Player, PlayerScores } from '../api/openapi';
import  FantasyEPLModal  from './FantasyEPLModal';

const PlayerPointsCard = ({ player, stats }: { player: Player; stats: PlayerScores }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className={styles.playerCard} onClick={() => setShowModal(true)}>
        <div>{player.displayName}</div>
        <div>{Object.values(stats.fixtureStats)[0]?.totalScore || 0} pts</div>
      </div>
      
      <FantasyEPLModal isOpen={showModal} onClose={() => setShowModal(false)}>
        <h2>{player.displayName}</h2>
        {Object.entries(stats.fixtureStats).map(([fixtureId, fixtureStats]) => {
          const scoringStats = Object.entries(fixtureStats)
            .filter(([key, stat]) => 
              typeof stat === 'object' && 
              'points' in stat && 
              stat.points !== 0 && 
              key !== 'totalScore'
            );

          return scoringStats.length > 0 ? (
            <div key={`${player.id}-${fixtureId}`}>
              {scoringStats.map(([statName, stat]) => (
                <div key={statName} className={styles.statLine}>
                  <span>{statName}: {(stat as BaseStat).value} </span>
                  <span>(Points: {(stat as BaseStat).points})</span>
                </div>
              ))}
              <div className={styles.totalScore}>
                Total: {fixtureStats.totalScore || 0} points
              </div>
            </div>
          ) : null;
        })}
      </FantasyEPLModal>
    </>
  );
};

export default PlayerPointsCard;
