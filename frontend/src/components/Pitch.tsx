import { useState } from 'react';
import { GameweekStats } from "../api/openapi/models/GameweekStats";
import styles from "./Pitch.module.css";
import footballPitch from "../assets/football_pitch_2.jpeg";
import PlayerPointsCard from './PlayerPointsCard';
import { FootballTeam, Player } from '../api/openapi';

const PitchVisualization = ({ 
  gameweekStats, 
  handlePlayerMove,
  teamEditable,
  footballTeams
}: { 
  gameweekStats: GameweekStats,
  handlePlayerMove: (playerId: number, isBenched: boolean) => void 
  teamEditable: boolean,
  footballTeams: FootballTeam[]
}) => {
  const [swapMode, setSwapMode] = useState<Player | undefined>(undefined);

  const isOnBench = (player: Player) => {
    return gameweekStats.subs.includes(player.id);
  };

  const playersByPosition = {
    starting: {
      goalkeepers: gameweekStats.playerStats.filter(p => p.player.positionId === 1 && !isOnBench(p.player)),
      defenders: gameweekStats.playerStats.filter(p => p.player.positionId === 2 && !isOnBench(p.player)),
      midfielders: gameweekStats.playerStats.filter(p => p.player.positionId === 3 && !isOnBench(p.player)),
      forwards: gameweekStats.playerStats.filter(p => p.player.positionId === 4 && !isOnBench(p.player))
    },
    subs: gameweekStats.playerStats.filter(p => isOnBench(p.player))
  };

  const handleSwapInitiate = (player: Player) => {
    setSwapMode(player);
  };

  const handleSwapComplete = (targetPlayer: Player) => {
    if (swapMode) {
      // First remove original player from pitch
      handlePlayerMove(swapMode.id, true);
      // Then move bench player to pitch
      handlePlayerMove(targetPlayer.id, false);
      setSwapMode(undefined);
    }
};

  const cancelSwap = () => {
    setSwapMode(undefined);
  };

  return (
    <div className={styles.fullTeamView} onClick={() => swapMode && cancelSwap()}>
      <div 
        className={styles.pitchContainer} 
        style={{ backgroundImage: `url(${footballPitch})` }}
      >
        {Object.entries(playersByPosition.starting).map(([position, players]) => (
          <div 
            key={position} 
            className={`${styles.positionGroup} ${styles[position]}`}
          >
            {players.map(playerStat => (
              <PlayerPointsCard 
                key={playerStat.player.id}
                player={playerStat.player}
                stats={playerStat}
                isOnBench={false}
                onSwapInitiate={handleSwapInitiate}
                swapMode={swapMode}
                onSwapComplete={handleSwapComplete}
                cancelSwap={cancelSwap}
                teamEditable={teamEditable}
                gameweekStats={gameweekStats}
                footballTeams={footballTeams}
              />
            ))}
          </div>
        ))}
      </div>
      <div className={styles.benchContainer}>
        <div className={styles.benchPlayers}>
          {playersByPosition.subs.map(playerStat => (
            <PlayerPointsCard 
              key={playerStat.player.id}
              player={playerStat.player}
              stats={playerStat}
              isOnBench={true}
              swapMode={swapMode}
              onSwapComplete={handleSwapComplete}
              cancelSwap={cancelSwap}
              teamEditable={teamEditable}
              gameweekStats={gameweekStats}
              footballTeams={footballTeams}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PitchVisualization;
