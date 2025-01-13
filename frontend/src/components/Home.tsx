import { useState, useEffect } from 'react' 
import { useGlobalContext } from '../utils/customHooks'
import { Gameweek } from '../api/openapi/models/Gameweek';
import { GameweekStats } from '../api/openapi/models/GameweekStats';
import PitchVisualization from './Pitch';
import styles from './Home.module.css';
import FantasyEPLModal from './FantasyEPLModal';
import { TeamTactics } from '../api/openapi';
import { LeagueTeam } from '../api/openapi/models/LeagueTeam';
import api from '../api/main';

function Home() {
  const { user } = useGlobalContext();
  
  const [currentGameweek, setCurrentGameweek] = useState<Gameweek | null>(null);
  const [gameweekStats, setGameweekStats] = useState<GameweekStats | null>(null);
  const [gameweekNumber, setGameweekNumber] = useState<number>(1);
  const [gameweeks, setGameweeks] = useState<Gameweek[]>([]);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [selectedTactic, setSelectedTactic] = useState<TeamTactics>(gameweekStats?.teamTactic ||  TeamTactics.DEFAULT);

  useEffect(() => {
    const fetchGameweek = async () => {
      const gameweeks = await api.getAllGameweeks();
      const gameweek = gameweeks.find(gw => gw.current === true);
      if (!gameweek) {
        throw new Error("no current gameweek found");
      }
      setCurrentGameweek(gameweek);
      setGameweekNumber(gameweek.number);
      setGameweeks(gameweeks);
    };
    fetchGameweek();
  }, [])

  useEffect(() => {
    if (currentGameweek) {
      const fetchGameweekTeam = async () => {
        const stats = await api.getGameweekStats(user.activeLeague, user.id, currentGameweek.id, true);
        setGameweekStats(stats);
        setSelectedTactic(stats.teamTactic || TeamTactics.DEFAULT);
      };
      fetchGameweekTeam();
    }
  }, [currentGameweek])

  const handleTacticChange = async (tactic: TeamTactics) => {
    if (!currentGameweek || !gameweekStats) return;
    
    try {
      // await api.updateTeamTactics(user.activeLeague, user.id, currentGameweek.id, tactic);
      setSelectedTactic(tactic);
      
      // Refresh gameweek stats to show updated tactic
      const stats = await api.getGameweekStats(user.activeLeague, user.id, currentGameweek.id, true);
      setGameweekStats(stats);
      setGameweekStats(stats);
    } catch (error) {
      console.error('Failed to update team tactics:', error);
    }
  };

  const getPositionPlayerIds = (position: string): number[] => {
    if (!gameweekStats) return [];
    return gameweekStats.playerStats.filter(p => p.player.positionCategory === position).map(p => p.player.id);
  }

  const handleSaveTeamChanges = async () => {
    if (!gameweekStats || !currentGameweek) return;
    
    try {
      const leagueTeam: LeagueTeam = {
        goalkeepers: getPositionPlayerIds('Goalkeeper'),
        defenders: getPositionPlayerIds('Defender'),
        midfielders: getPositionPlayerIds('Midfielder'),
        forwards: getPositionPlayerIds('Forward'),
        subs: gameweekStats.subs,
        tactic: selectedTactic,
        teamId: gameweekStats.teamId,
        leagueId: user.activeLeague,
        userId: user.id,
        teamName: gameweekStats.teamName
      }
      await api.updateTeam(leagueTeam)
    } catch (error) {
      console.error('Failed to save team changes:', error);
    }
  };

  const handlePlayerMove = async (playerId: number, isBenched: boolean) => {
    if (!gameweekStats || !currentGameweek) return;

    const updatedStats = {
      ...gameweekStats,
      subs: isBenched 
        ? [...gameweekStats.subs, playerId]
        : gameweekStats.subs.filter(id => id !== playerId)
    };

    setGameweekStats(updatedStats);
  };

  const handleGameweekChange = async (direction: 'prev' | 'next') => {
    const newNumber = direction === 'next' ? gameweekNumber + 1 : gameweekNumber - 1;
    if (newNumber < 1 || newNumber > 38) return;
    
    setGameweekNumber(newNumber);
    const newGameweek = gameweeks.find(gw => gw.number == newNumber);
    if (!newGameweek) {
      throw new Error(`no gameweek found for number ${newNumber}`);
    }
    const current = newGameweek.id == currentGameweek!.id;
    const stats = await api.getGameweekStats(user.activeLeague, user.id, newGameweek.id, current);
    setGameweekStats(stats);
    setSelectedTactic(stats.teamTactic || TeamTactics.DEFAULT);
  };

  return (
    <div className={styles.container}>
      <div className={styles.gameweekNavigation}>
        <button 
          onClick={() => handleGameweekChange('prev')}
          disabled={gameweekNumber <= 1}
        >
          Previous
        </button>
        <span>Gameweek {gameweekNumber}</span>
        <button 
          onClick={() => handleGameweekChange('next')}
          disabled={gameweekNumber >= (currentGameweek?.number || 38)}
        >
          Next
        </button>
      </div>

      <div className={styles.scoresContainer}>
        <div className={styles.scoreCard}>
          <div>Player Points</div>
          <div>{gameweekStats?.totalPlayerPoints || 0}</div>
        </div>
        
        <div className={styles.scoreCard} onClick={() => setShowScoreModal(true)}>
          <div>Team Points</div>
          <div>{gameweekStats?.totalTeamPoints || 0}</div>
        </div>
        
        <div className={styles.scoreCard}>
          <div className={styles.totalPoints}> Total Points</div>
          <div>{(gameweekStats?.totalTeamPoints || 0) + (gameweekStats?.totalPlayerPoints || 0)}</div>
        </div>
      </div>

      <FantasyEPLModal isOpen={showScoreModal} onClose={() => setShowScoreModal(false)}>
        <h2>Team Score Breakdown</h2>
        {gameweekStats?.teamTactic === TeamTactics.POSSESION && (
          <div>
            <h3>Possession Tactic</h3>
            <p>Pass Accuracy: {Math.round(gameweekStats.teamStats.passAccuracy)}% (Target: 80%) [{gameweekStats.teamStats.passAccuracy > 80 ? '+15' : '-10'}]</p>
            <p>Total Passes: {gameweekStats.teamStats.totalPasses} (Target: 350) [{gameweekStats.teamStats.totalPasses > 350 ? '+15' : '-10'}]</p>
            <p>Times Dispossessed: {gameweekStats.teamStats.dispossesed} (Target: under 7) [{gameweekStats.teamStats.dispossesed < 7 ? '+15' : '-10'}]</p>
          </div>
        )}
        {gameweekStats?.teamTactic === TeamTactics.DEFENSIVE && (
          <div>
            <h3>Defensive Tactic</h3>
            <p>Tackles: {gameweekStats.teamStats.tackles} (Target: 20) [{gameweekStats.teamStats.tackles > 20 ? '+15' : '-10'}]</p>
            <p>Interceptions: {gameweekStats.teamStats.interceptions} (Target: 10) [{gameweekStats.teamStats.interceptions > 10 ? '+15' : '-10'}]</p>
            <p>Goals Conceded: {gameweekStats.teamStats.goalsConceded} (Target: under 10) [{gameweekStats.teamStats.goalsConceded < 10 ? '+20' : '-10'}]</p>
          </div>
        )}
        {gameweekStats?.teamTactic === TeamTactics.OFFENSIVE && (
          <div>
            <h3>Offensive Tactic</h3>
            <p>Goals + Assists: {gameweekStats.teamStats.goals + gameweekStats.teamStats.assists} (Target: over 6) [{(gameweekStats.teamStats.goals + gameweekStats.teamStats.assists) > 6 ? '+15' : '-10'}]</p>
            <p>Key Passes: {gameweekStats.teamStats.keyPasses} (Target: 10) [{gameweekStats.teamStats.keyPasses > 10 ? '+15' : '-10'}]</p>
            <p>Goals & Assists vs Goals Conceded: {gameweekStats.teamStats.goals + gameweekStats.teamStats.assists} vs {gameweekStats.teamStats.goalsConceded} [{gameweekStats.teamStats.goalsConceded < (gameweekStats.teamStats.goals + gameweekStats.teamStats.assists) ? '+15' : '-5'}]</p>
          </div>
        )}
        <div className={styles.totalTeamPoints}>
          Total Team Points: {gameweekStats?.totalTeamPoints || 0}
        </div>
      </FantasyEPLModal>

      <div className={styles.tacticsSelector}>
      <h3>Team Strategy</h3>
      <div className={styles.tacticOptions}>
        <button 
          className={`${styles.tacticButton} ${selectedTactic === TeamTactics.OFFENSIVE ? styles.selected : ''}`}
          onClick={() => handleTacticChange(TeamTactics.OFFENSIVE)}
        >
          Offensive
        </button>
        <button 
          className={`${styles.tacticButton} ${selectedTactic === TeamTactics.DEFENSIVE ? styles.selected : ''}`}
          onClick={() => handleTacticChange(TeamTactics.DEFENSIVE)}
        >
          Defensive
        </button>
        <button 
          className={`${styles.tacticButton} ${selectedTactic === TeamTactics.POSSESION ? styles.selected : ''}`}
          onClick={() => handleTacticChange(TeamTactics.POSSESION)}
        >
          Possession
        </button>
        <button 
          className={`${styles.tacticButton} ${selectedTactic === TeamTactics.DEFAULT ? styles.selected : ''}`}
          onClick={() => handleTacticChange(TeamTactics.DEFAULT)}
        >
          Default
        </button>
      </div>
    </div>

      {gameweekStats && (
        <div className={styles.pitchWrapper}>
          <PitchVisualization 
            gameweekStats={gameweekStats}
            handlePlayerMove={handlePlayerMove}
          />
          <div className={styles.saveButtonContainer}>
            <button 
              className={styles.saveButton}
              onClick={handleSaveTeamChanges}
            >
              Save Team Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
