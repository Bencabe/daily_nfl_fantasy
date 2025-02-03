import { useState } from 'react';
import styles from './PlayerPointsCard.module.css';
import { BaseStat, Player, PlayerScores } from '../api/openapi';
import FantasyEPLModal from './FantasyEPLModal';
import { IoSwapHorizontal } from "react-icons/io5";

const PlayerPointsCard = ({ 
  player, 
  stats, 
  isOnBench, 
  onSwapInitiate, 
  swapMode, 
  onSwapComplete,
  cancelSwap,
  teamEditable 
}: { 
  player: Player; 
  stats: PlayerScores;
  isOnBench: boolean;
  onSwapInitiate?: (player: Player) => void;
  swapMode?: Player;
  onSwapComplete?: (player: Player) => void;
  cancelSwap: () => void;
  teamEditable: boolean;
}) => {
  const [showModal, setShowModal] = useState(false);
  const [showPlayerStats, setShowPlayerStats] = useState(true);

  const handleSwapClick = () => {
    if (onSwapInitiate) {
      onSwapInitiate(player);
      setShowModal(false);
    }
  };

  const isBaseStat = (stat: number | BaseStat): stat is BaseStat => {
    return typeof stat === 'object' && 'points' in stat;
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (swapMode) {
      if (isSwapTarget) {
        onSwapComplete?.(player);
      } else {
        cancelSwap();
      }
    } else {
      setShowModal(true);
    }
  };

  const isSwapTarget = swapMode && isOnBench

  return (
    <>
      <div 
        className={`${styles.playerCard} ${isSwapTarget ? styles.swapTarget : ''}`} 
        onClick={handleCardClick}
      >
        <div>{player.displayName.split(' ').slice(1).join(' ')}</div>
        <div>{Object.values(stats.fixtureStats || {})?.at(0)?.playerStats?.totalScore || 0} pts</div>
      </div>
      
      <FantasyEPLModal isOpen={showModal} onClose={() => setShowModal(false)}>
      <div className={styles.modalHeader}>
        <div className={styles.titleRow}>
          <h2>{player.displayName}</h2>
          {teamEditable && !isOnBench && (
            <button 
              className={styles.swapButton}
              onClick={handleSwapClick}
              title="Swap Player"
            >
              <IoSwapHorizontal />
            </button>
          )}
        </div>
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
                return Object.entries(fixture.playerStats)
                    .filter(([key, stat]) => 
                      isBaseStat(stat) && 
                      stat.points !== 0 && 
                      key !== 'totalScore'
                  )
                  .map(([statName, stat]) => (
                    <tr key={`${fixtureId}-${statName}`}>
                      <td>{statName}</td>
                      <td>{(stat as BaseStat).value}</td>
                      <td>{(stat as BaseStat).points}</td>
                    </tr>
                  ));
              } else {
                return Object.entries(fixture.teamStats)
                  .filter(([_, value]) => value !== 0)
                  .map(([statName, value]) => (
                    <tr key={`${fixtureId}-${statName}`}>
                      <td>{statName}</td>
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
