import { useState, useEffect } from 'react' 
import { useGlobalContext } from '../utils/customHooks'
import { Gameweek } from '../api/openapi/models/Gameweek';
import { GameweekStats } from '../api/openapi/models/GameweekStats';
import PitchVisualization from './Pitch';
import styles from './Home.module.css';
import { TeamTactics } from '../api/openapi';
import { LeagueTeam } from '../api/openapi/models/LeagueTeam';
import getApi from '../api/main';
import { useSearchParams } from 'react-router-dom';
import TeamScoreBreakdown from './TeamScoreBreakdown';

function Home() {
  const { user } = useGlobalContext();
  
  const [currentGameweek, setCurrentGameweek] = useState<Gameweek | null>(null);
  const [gameweekStats, setGameweekStats] = useState<GameweekStats | null>(null);
  const [gameweekNumber, setGameweekNumber] = useState<number>(1);
  const [gameweeks, setGameweeks] = useState<Gameweek[]>([]);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [selectedTactic, setSelectedTactic] = useState<TeamTactics>(gameweekStats?.teamTactic ||  TeamTactics.DEFAULT);
  const [teamEditable, setTeamEditable] = useState(false);
  const [searchParams] = useSearchParams();
  const viewUserId = searchParams.get('user') ? Number(searchParams.get('user')) : user.id;
  const viewGameweek = searchParams.get('gameweek') ? Number(searchParams.get('gameweek')) : null;
  const [isStrategyExpanded, setIsStrategyExpanded] = useState(false);
  const api = getApi();

  useEffect(() => {
    const fetchGameweek = async () => {
      const gameweeks = await api.getAllGameweeks();
      let gameweek;
      
      if (viewGameweek) {
        gameweek = gameweeks.find(gw => gw.number === viewGameweek);
      } else {
        gameweek = gameweeks.find(gw => gw.current === true);
      }
      
      if (!gameweek) {
        throw new Error("no gameweek found");
      }
      setCurrentGameweek(gameweek);
      setGameweekNumber(gameweek.number);
      setGameweeks(gameweeks);
    };
    fetchGameweek();
  }, [viewGameweek])

  useEffect(() => {
    if (currentGameweek) {
      const fetchGameweekTeam = async () => {
        const stats = await api.getGameweekStats(user.activeLeague, viewUserId, currentGameweek.id, currentGameweek.current);
        setGameweekStats(stats);
        setSelectedTactic(stats.teamTactic || TeamTactics.DEFAULT);
        setTeamEditable(canEditTeam());
      };
      fetchGameweekTeam();
    }
  }, [currentGameweek, viewUserId])

  useEffect(() => {
    setTeamEditable(canEditTeam());
  }, [gameweekNumber])


  const canEditTeam = () => {
    if (!currentGameweek) {
      return false;
    }
    const now = new Date()
    const currentGameweekActive = now >= new Date(currentGameweek.startDate);
    return currentGameweek 
          && currentGameweek.current 
          && user.id === viewUserId
          && !currentGameweekActive
          && gameweekNumber === currentGameweek.number;
  }

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

    setGameweekStats(prevStats => {
        if (!prevStats) return null;
        
        const updatedSubs = isBenched
            ? [...prevStats.subs, playerId]
            : prevStats.subs.filter(id => id !== playerId);

        return {
            ...prevStats,
            subs: updatedSubs
        };
    });
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
    const stats = await api.getGameweekStats(user.activeLeague, viewUserId, newGameweek.id, current);
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

      {!teamEditable ? (
        <TeamScoreBreakdown
          showScoreModal={showScoreModal}
          setShowScoreModal={setShowScoreModal}
          gameweekStats={gameweekStats}
        />
      ) : null }

      <div className={styles.tacticsSelector}>
        <div 
          className={styles.strategyHeader}
          onClick={() => setIsStrategyExpanded(!isStrategyExpanded)}
        >
          <h3>Team Strategy</h3>
          <span className={`${styles.arrow} ${isStrategyExpanded ? styles.expanded : ''}`}>▼</span>
        </div>
        <div className={`${styles.tacticOptions} ${isStrategyExpanded ? styles.expanded : ''}`}>
          <button
            disabled={!teamEditable}
            className={`${styles.tacticButton} ${selectedTactic === TeamTactics.OFFENSIVE ? styles.selected : ''}`}
            onClick={() => handleTacticChange(TeamTactics.OFFENSIVE)}
          >
            Offensive
          </button>
          <button 
            disabled={!teamEditable}
            className={`${styles.tacticButton} ${selectedTactic === TeamTactics.DEFENSIVE ? styles.selected : ''}`}
            onClick={() => handleTacticChange(TeamTactics.DEFENSIVE)}
          >
            Defensive
          </button>
          <button
            disabled={!teamEditable}
            className={`${styles.tacticButton} ${selectedTactic === TeamTactics.POSSESION ? styles.selected : ''}`}
            onClick={() => handleTacticChange(TeamTactics.POSSESION)}
          >
            Possession
          </button>
          <button
            disabled={!teamEditable}
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
            teamEditable={teamEditable}
          />
          <div className={styles.saveButtonContainer}>
            <button
              className={`${styles.saveButton} ${teamEditable ? '' : styles.hidden}`}
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
