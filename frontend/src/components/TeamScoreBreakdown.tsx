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
                        <table className={styles.scoreTable}>
                            <thead>
                                <tr>
                                    <th>Metric</th>
                                    <th>Value</th>
                                    <th>Target</th>
                                    <th>Points</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Pass Accuracy</td>
                                    <td>{Math.round(gameweekStats.teamStats.passAccuracy)}%</td>
                                    <td>&gt; 80%</td>
                                    <td>{gameweekStats.teamStats.passAccuracy > 80 ? '+5' : '0'}</td>
                                </tr>
                                <tr>
                                    <td>Total Passes</td>
                                    <td>{gameweekStats.teamStats.totalPasses}</td>
                                    <td>&gt; 350</td>
                                    <td>{gameweekStats.teamStats.totalPasses > 350 ? '+5' : '-5'}</td>
                                </tr>
                                <tr>
                                    <td>Times Dispossessed</td>
                                    <td>{gameweekStats.teamStats.dispossesed}</td>
                                    <td>&lt; 7</td>
                                    <td>{gameweekStats.teamStats.dispossesed < 7 ? '+5' : '0'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
                {gameweekStats?.teamTactic === TeamTactics.DEFENSIVE && (
                    <div>
                        <h3>Defensive Tactic</h3>
                        <table className={styles.scoreTable}>
                            <thead>
                                <tr>
                                    <th>Metric</th>
                                    <th>Value</th>
                                    <th>Target</th>
                                    <th>Points</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Tackles</td>
                                    <td>{gameweekStats.teamStats.tackles}</td>
                                    <td>&gt; 20</td>
                                    <td>{gameweekStats.teamStats.tackles > 20 ? '+5' : '0'}</td>
                                </tr>
                                <tr>
                                    <td>Interceptions</td>
                                    <td>{gameweekStats.teamStats.interceptions}</td>
                                    <td>&gt; 10</td>
                                    <td>{gameweekStats.teamStats.interceptions > 10 ? '+5' : '0'}</td>
                                </tr>
                                <tr>
                                    <td>Goals Conceded</td>
                                    <td>{gameweekStats.teamStats.goalsConceded}</td>
                                    <td>&lt; 10</td>
                                    <td>{gameweekStats.teamStats.goalsConceded < 10 ? '+5' : '-5'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
                {gameweekStats?.teamTactic === TeamTactics.OFFENSIVE && (
                    <div>
                        <h3>Offensive Tactic</h3>
                        <table className={styles.scoreTable}>
                            <thead>
                                <tr>
                                    <th>Metric</th>
                                    <th>Value</th>
                                    <th>Target</th>
                                    <th>Points</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Goals + Assists</td>
                                    <td>{gameweekStats.teamStats.goals + gameweekStats.teamStats.assists}</td>
                                    <td>&gt; 6</td>
                                    <td>{(gameweekStats.teamStats.goals + gameweekStats.teamStats.assists) > 6 ? '+5' : '0'}</td>
                                </tr>
                                <tr>
                                    <td>Key Passes</td>
                                    <td>{gameweekStats.teamStats.keyPasses}</td>
                                    <td>&gt; 10</td>
                                    <td>{gameweekStats.teamStats.keyPasses > 10 ? '+5' : '0'}</td>
                                </tr>
                                <tr>
                                    <td>Goals Difference</td>
                                    <td>GC: {gameweekStats.teamStats.goalsConceded} vs G+A: {gameweekStats.teamStats.goals + gameweekStats.teamStats.assists}</td>
                                    <td>GC &lt; G+A</td>
                                    <td>{gameweekStats.teamStats.goalsConceded < (gameweekStats.teamStats.goals + gameweekStats.teamStats.assists) ? '+5' : '-5'}</td>
                                </tr>
                            </tbody>
                        </table>
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