import { useState, useEffect } from 'react' 
import { useGlobalContext } from '../utils/customHooks'
import { Gameweek } from '../api/openapi/models/Gameweek';
import { GameweekStats } from '../api/openapi/models/GameweekStats';
import PitchVisualization from './Pitch';
import styles from './Home.module.css';
import { Fixture, FootballTeam, TeamTactics } from '../api/openapi';
import { LeagueTeam } from '../api/openapi/models/LeagueTeam';
import getApi from '../api/main';
import { useSearchParams } from 'react-router-dom';
import TeamScoreBreakdown from './TeamScoreBreakdown';
import GameweekFixtures from './GameweekFixtures';
import { PlayerLimits } from '../types/team';


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
  const [gameweekFixtures, setGameweekFixtures] = useState<Fixture[]>([]);
  const [footballTeams, setFootballTeams] = useState<FootballTeam[]>([]);
  const [validationMessage, setValidationMessage] = useState("");
  const [teamValid, setTeamValid] = useState(true);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
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
      const gameweekFixtures = await api.getGameweekFixtures(gameweek.id);
      setCurrentGameweek(gameweek);
      setGameweekNumber(gameweek.number);
      setGameweeks(gameweeks);
      setGameweekFixtures(gameweekFixtures);
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

  useEffect(() => {
    const fetchFootballTeams = async () => {
      const teams = await api.getFootballTeams();
      setFootballTeams(teams);
    };
    fetchFootballTeams();
  }, []);

  useEffect(() => {
    isTeamValid();
  },[gameweekStats])

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

  const isTeamValid = () => {
    if (!gameweekStats) return { valid: false, message: "No team data available" };
    
    const goalkeepers = getPositionPlayerIds('Goalkeeper').filter(id => !gameweekStats.subs.includes(id));
    const defenders = getPositionPlayerIds('Defender').filter(id => !gameweekStats.subs.includes(id));
    const midfielders = getPositionPlayerIds('Midfielder').filter(id => !gameweekStats.subs.includes(id));
    const forwards = getPositionPlayerIds('Forward').filter(id => !gameweekStats.subs.includes(id));
    let teamValid = false
    const total_starting = goalkeepers.length + defenders.length + midfielders.length + forwards.length;
  
    if (goalkeepers.length !== PlayerLimits.MAX_GOALKEEPERS) {
      setValidationMessage("Must have exactly 1 goalkeeper");
    }
    else if (defenders.length < PlayerLimits.MIN_DEFENDERS) {
      setValidationMessage("Must have at least 3 defenders");
    }
    else if (midfielders.length < PlayerLimits.MIN_MIDFIELDERS) {
      setValidationMessage("Must have at least 2 midfielders");
    }
    else if (forwards.length < PlayerLimits.MIN_FORWARDS) {
      setValidationMessage("Must have at least 1 forward");
    }
  else if (total_starting != PlayerLimits.TOTAL_STARTERS ) {
      setValidationMessage("Must have 11 starting players");
    }
  else {
      setValidationMessage("");
      teamValid = true;
    }
    setTeamValid(teamValid);
  };

  const handleTacticChange = async (tactic: TeamTactics) => {
    if (!currentGameweek || !gameweekStats) return;
    
    try {
      setSelectedTactic(tactic);
      const stats = await api.getGameweekStats(user.activeLeague, user.id, currentGameweek.id, true);
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
      await api.updateTeam(leagueTeam);
      setSaveSuccessMessage("Team saved successfully!");
      setTimeout(() => setSaveSuccessMessage(""), 3000);
    } catch (error) {
      console.error('Failed to save team changes:', error);
      setErrorMessage("Team saved failed. This shouldn't happen, tell Ben about it if you see this please.");
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
    const fixtures = await api.getGameweekFixtures(newGameweek.id);
    setGameweekStats(stats);
    setGameweekFixtures(fixtures);
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

      <div className={styles.mainContent}>
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
              footballTeams={footballTeams}
            />
            <div className={styles.saveButtonContainer}>
              {validationMessage && (
                <div className={styles.validationMessage}>{validationMessage}</div>
              )}
              {saveSuccessMessage && (
                <div className={styles.successMessage}>{saveSuccessMessage}</div>
              )}
              {errorMessage && (
                <div className={styles.validationMessage}>{errorMessage}</div>
              )}
              <button
                className={`${styles.saveButton} ${teamEditable ? '' : styles.hidden}`}
                onClick={handleSaveTeamChanges}
                disabled={!teamValid}
              >
                Save Team Changes
              </button>
            </div>
          </div>
        )}

        <GameweekFixtures gameweekFixtures={gameweekFixtures} footballTeams={footballTeams} />
      </div>
    </div>
  );
}

export default Home;
