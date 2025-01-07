import { useState, useEffect } from 'react' 
import { useGlobalContext } from '../utils/customHooks'
import { EplFantasy } from '../api/openapi/EplFantasy'
import { Gameweek } from '../api/openapi/models/Gameweek';
import { GameweekStats } from '../api/openapi/models/GameweekStats';
import PitchVisualization from './Pitch';
import styles from './Home.module.css';
import FantasyEPLModal from './FantasyEPLModal';
import { TeamTactics } from '../api/openapi';

function Home() {
  const { user } = useGlobalContext();
  const api = new EplFantasy({
    BASE: 'http://localhost:5001',
    HEADERS: {
      'Authorization': `Bearer ${document.cookie.split('jwt_token=')[1]}`,
      'Cookie': document.cookie,
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    CREDENTIALS: 'include',
    WITH_CREDENTIALS: true
  }).default;
  
  const [currentGameweek, setCurrentGameweek] = useState<Gameweek | null>(null);
  const [gameweekStats, setGameweekStats] = useState<GameweekStats | null>(null);
  const [gameweekNumber, setGameweekNumber] = useState<number>(1);
  const [gameweeks, setGameweeks] = useState<Gameweek[]>([]);
  const [showScoreModal, setShowScoreModal] = useState(false);

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
        console.log(stats);
      };
      fetchGameweekTeam();
    }
  }, [currentGameweek])

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
        {gameweekStats?.teamTactic === 'Possesion' && (
            <div>
              <h3>Possession Tactic</h3>
              <p>Pass Accuracy: {Math.round(gameweekStats.teamStats.passAccuracy)}% (Target: 75%) [{gameweekStats.teamStats.passAccuracy > 75 ? '+15' : '-10'}]</p>
              <p>Total Passes: {gameweekStats.teamStats.totalPasses} (Target: 400) [{gameweekStats.teamStats.totalPasses > 400 ? '+30' : '-20'}]</p>
            </div>
          )}
          {gameweekStats?.teamTactic === 'Defensive' && (
            <div>
              <h3>Defensive Tactic</h3>
              <p>Tackles: {gameweekStats.teamStats.tackles} (Target: 20) [{gameweekStats.teamStats.tackles > 20 ? '+15' : '-10'}]</p>
              <p>Interceptions: {gameweekStats.teamStats.interceptions} (Target: 10) [{gameweekStats.teamStats.interceptions > 10 ? '+15' : '-10'}]</p>
              <p>Goals Conceded: {gameweekStats.teamStats.goalsConceded} (Target: under 10) [{gameweekStats.teamStats.goalsConceded < 10 ? '+15' : '-10'}]</p>
            </div>
          )}
          {gameweekStats?.teamTactic === 'Offensive' && (
            <div>
              <h3>Offensive Tactic</h3>
              <p>Goals: {gameweekStats.teamStats.goals} (Target: 4) [{gameweekStats.teamStats.goals > 4 ? '+15' : '-10'}]</p>
              <p>Assists: {gameweekStats.teamStats.assists} (Target: 4) [{gameweekStats.teamStats.assists > 4 ? '+15' : '-10'}]</p>
              <p>Goals vs Conceded: {gameweekStats.teamStats.goals + gameweekStats.teamStats.assists} vs {gameweekStats.teamStats.goalsConceded} [{gameweekStats.teamStats.goalsConceded < (gameweekStats.teamStats.goals + gameweekStats.teamStats.assists) ? '+10' : '-10'}]</p>
            </div>
          )}
          <div className={styles.totalTeamPoints}>
            Total Team Points: {gameweekStats?.totalTeamPoints || 0}
          </div>
      </FantasyEPLModal>

      {gameweekStats && (
        <div className={styles.pitchWrapper}>
          <PitchVisualization 
            gameweekStats={gameweekStats}
            handlePlayerMove={handlePlayerMove}
          />
        </div>
      )}
    </div>
  );
}

export default Home;
