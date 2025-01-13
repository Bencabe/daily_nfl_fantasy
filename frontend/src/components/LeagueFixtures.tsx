import { useEffect, useState } from "react";
import { LeagueFixtureResults, GameweekFixtureResult } from "../api/openapi";
import { useGlobalContext } from "../utils/customHooks";
import api from "../api/main";
import styles from "./LeagueFixtures.module.css";

const LeagueFixtures = () => {
  const { user } = useGlobalContext();
  const [fixtures, setFixtures] = useState<LeagueFixtureResults>({
    gameweekFixtures: [], 
    leagueId: user.activeLeague
  });

  const groupedFixtures = fixtures.gameweekFixtures.reduce((acc, fixture) => {
    const gameweekNumber = fixture.gameweekNumber;
    if (!acc[gameweekNumber]) {
      acc[gameweekNumber] = [];
    }
    acc[gameweekNumber].push(fixture);
    return acc;
  }, {} as Record<number, GameweekFixtureResult[]>);

  useEffect(() => {
    const fetchFixtures = async () => {
      const fixtures = await api.getLeagueFixtureResults(user.activeLeague);
      setFixtures(fixtures);
    };
    fetchFixtures();
  }, []);

  return (
    <div className={styles.fixturesContainer}>
      <div className={styles.gameweekList}>
        {Object.entries(groupedFixtures)
          .sort((a, b) => Number(b[0]) - Number(a[0]))
          .map(([gameweekNumber, fixtureGroup]) => (
          <div key={gameweekNumber} className={styles.gameweekSection}>
            <h2 className={styles.gameweekTitle}>
              Gameweek {gameweekNumber}
            </h2>
            <div className={styles.fixturesList}>
              {fixtureGroup.map((fixture, index) => (
                <div key={index} className={styles.fixtureCard}>
                  <div className={styles.matchup}>
                    <div className={styles.team}>
                      <span className={styles.playerName}>{fixture.user1.firstName}</span>
                      <span className={styles.score}>{fixture.user1Score}</span>
                    </div>
                    <span className={styles.vs}>vs</span>
                    <div className={styles.team}>
                      <span className={styles.playerName}>
                        {fixture.oddPlayer ? 'League Average' : fixture.user2.firstName}
                      </span>
                      <span className={styles.score}>{fixture.user2Score}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeagueFixtures;
