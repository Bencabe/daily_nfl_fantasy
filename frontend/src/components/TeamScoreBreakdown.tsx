import { GameweekStats } from "../api/openapi/models/GameweekStats";
import { TeamTactics } from "../api/openapi/models/TeamTactics";
import FantasyEPLModal from "./FantasyEPLModal"
import styles from "./TeamScoreBreakdown.module.css";

type TeamScoreBreakdownProps = {
  showScoreModal: boolean;
  setShowScoreModal: (showScoreModal: boolean) => void;
  gameweekStats: GameweekStats | null;
};

const TeamScoreBreakdown = ({showScoreModal, setShowScoreModal, gameweekStats}: TeamScoreBreakdownProps) => {
    // const { gameweekStats, selectedTactic } = useGameweekStats();
    // const { userTeam } = useUserTeam();
    return (
        <>
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
      </>
    )
}

export default TeamScoreBreakdown;