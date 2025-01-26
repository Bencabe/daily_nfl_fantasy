import { DragEvent } from 'react';
import { GameweekStats } from "../api/openapi/models/GameweekStats";
import { Player } from "../api/openapi/models/Player";
import { PlayerScores } from "../api/openapi/models/PlayerScores";
import styles from "./Pitch.module.css";
import footballPitch from "../assets/football_pitch_2.jpeg";
import PlayerPointsCard from './PlayerPointsCard';

type PositionGroups = {
  starting: {
    goalkeepers: PlayerScores[];
    defenders: PlayerScores[];
    midfielders: PlayerScores[];
    forwards: PlayerScores[];
  };
  subs: PlayerScores[];
};
  
const isOnBench = (gameweekStats: GameweekStats, player: Player) => {
  return gameweekStats.subs.includes(player.id);
}

const PitchVisualization = ({ 
  gameweekStats, 
  handlePlayerMove,
  teamEditable
}: { 
  gameweekStats: GameweekStats,
  handlePlayerMove: (playerId: number, isBenched: boolean) => void 
  teamEditable: boolean
}) => {
  const playersByPosition: PositionGroups = {
    starting: {
      goalkeepers: gameweekStats.playerStats.filter(p => p.player.positionId === 1 && !isOnBench(gameweekStats, p.player)),
      defenders: gameweekStats.playerStats.filter(p => p.player.positionId === 2 && !isOnBench(gameweekStats, p.player)),
      midfielders: gameweekStats.playerStats.filter(p => p.player.positionId === 3 && !isOnBench(gameweekStats, p.player)),
      forwards: gameweekStats.playerStats.filter(p => p.player.positionId === 4 && !isOnBench(gameweekStats, p.player))
    },
    subs: gameweekStats.playerStats.filter(p => isOnBench(gameweekStats, p.player))
  };

  const handleDragStart = (e: DragEvent, playerId: number) => {
    if (!teamEditable) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('playerId', playerId.toString());
  };

  const handleDrop = (e: DragEvent, targetArea: 'pitch' | 'bench') => {
    e.preventDefault();
    const playerId = parseInt(e.dataTransfer.getData('playerId'));
    handlePlayerMove(playerId, targetArea === 'bench');
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className={styles.fullTeamView}>
      <div 
        className={styles.pitchContainer} 
        style={{ backgroundImage: `url(${footballPitch})` }}
        onDrop={(e) => handleDrop(e, 'pitch')}
        onDragOver={handleDragOver}
      >
        {Object.entries(playersByPosition.starting).map(([position, players]) => (
          <div 
            key={position} 
            className={`${styles.positionGroup} ${styles[position]}`}
          >
            {players.map(playerStat => (
              <div 
                key={playerStat.player.id}
                draggable={teamEditable}
                onDragStart={(e) => handleDragStart(e, playerStat.player.id)}
              >
                <PlayerPointsCard 
                  player={playerStat.player}
                  stats={playerStat}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
      <div 
        className={styles.benchContainer}
        onDrop={(e) => handleDrop(e, 'bench')}
        onDragOver={handleDragOver}
      >
        <div className={styles.benchPlayers}>
          {playersByPosition.subs.map(playerStat => (
            <div
              key={playerStat.player.id}
              draggable
              onDragStart={(e) => handleDragStart(e, playerStat.player.id)}
            >
              <PlayerPointsCard 
                player={playerStat.player}
                stats={playerStat}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PitchVisualization;
