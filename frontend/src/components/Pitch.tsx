import { DragEvent, TouchEvent, useState } from 'react';
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
  const [touchedPlayerId, setTouchedPlayerId] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [touchPosition, setTouchPosition] = useState<{ x: number; y: number } | null>(null);
  const [draggedElement, setDraggedElement] = useState<HTMLElement | null>(null);

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

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>, playerId: number) => {
    if (!teamEditable) return;
    const touch = e.touches[0];
    const element = e.currentTarget.cloneNode(true) as HTMLElement;
    
    element.className = styles.draggedElement;
    element.style.left = `${touch.clientX}px`;
    element.style.top = `${touch.clientY}px`;
    
    document.body.appendChild(element);
    setDraggedElement(element);
    setTouchPosition({ x: touch.clientX, y: touch.clientY });
    setTouchedPlayerId(playerId);
    setIsDragging(true);
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (!isDragging || !draggedElement) return;
    const touch = e.touches[0];
    
    draggedElement.style.left = `${touch.clientX}px`;
    draggedElement.style.top = `${touch.clientY}px`;
    
    setTouchPosition({ x: touch.clientX, y: touch.clientY });
    e.preventDefault();
  };

  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    if (!touchedPlayerId || !isDragging || !touchPosition) return;
    
    const touch = e.changedTouches[0];
    const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);
    
    // Check if dropped on bench or pitch
    const isBench = dropTarget?.closest(`.${styles.benchContainer}`) !== null;
    const isPitch = dropTarget?.closest(`.${styles.pitchContainer}`) !== null;
    
    if (draggedElement) {
      document.body.removeChild(draggedElement);
      setDraggedElement(null);
    }
    
    // Only trigger move if dropped on valid target
    if (isBench || isPitch) {
      handlePlayerMove(touchedPlayerId, isBench);
    }
    
    setTouchedPlayerId(null);
    setIsDragging(false);
    setTouchPosition(null);
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
                onTouchStart={(e) => handleTouchStart(e, playerStat.player.id)}
                onTouchMove={handleTouchMove}
                onTouchEnd={(e) => handleTouchEnd(e)}
                className={isDragging && touchedPlayerId === playerStat.player.id ? styles.dragging : ''}
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
              draggable={teamEditable}
              onDragStart={(e) => handleDragStart(e, playerStat.player.id)}
              onTouchStart={(e) => handleTouchStart(e, playerStat.player.id)}
              onTouchMove={handleTouchMove}
              onTouchEnd={(e) => handleTouchEnd(e)}
              className={isDragging && touchedPlayerId === playerStat.player.id ? styles.dragging : ''}
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
