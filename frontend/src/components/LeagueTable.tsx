import api from "../api/main";
import { LeagueFixtureResults } from "../api/openapi/models/LeagueFixtureResults";
import { useGlobalContext } from "../utils/customHooks";
import { useEffect, useState } from 'react'
import styles from './LeagueTable.module.css';

interface Standing {
  userId: number;
  points: number;
  wins: number;
  draws: number;
  losses: number;
  name: string;
  totalScore: number;
}

const LeagueTable = () => {
  const { user } = useGlobalContext();
  const [standings, setStandings] = useState<Standing[]>([]);

  const calculateStandings = (fixtureResults: LeagueFixtureResults) => {
    const standingsMap = new Map<number, Standing>();

    fixtureResults.gameweekFixtures.forEach(fixture => {
      const user1 = standingsMap.get(fixture.user1.id) || {
        userId: fixture.user1.id,
        points: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        name: fixture.user1.firstName,
        totalScore: 0
      };

      const user2 = standingsMap.get(fixture.user2.id) || {
        userId: fixture.user2.id,
        points: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        name: fixture.user2.firstName,
        totalScore: 0
      };

      user1.totalScore += fixture.user1Score;
      if (!fixture.oddPlayer) {
        user2.totalScore += fixture.user2Score;
      }

      if (fixture.user1Score > fixture.user2Score) {
        user1.points += 3;
        user1.wins += 1;
        if (!fixture.oddPlayer) {
          user2.losses += 1;
        }
      } else if (fixture.user1Score === fixture.user2Score) {
        user1.points += 1;
        user1.draws += 1;
        if (!fixture.oddPlayer) {
          user2.points += 1;
          user2.draws += 1;
        }
      } else {
        user1.losses += 1;
        if (!fixture.oddPlayer) {
          user2.points += 3;
          user2.wins += 1;
        }
      }

      standingsMap.set(fixture.user1.id, user1);
      if (fixture.user1.id !== fixture.user2.id) {
        standingsMap.set(fixture.user2.id, user2);
      }
    });

    return Array.from(standingsMap.values())
    .sort((a, b) => {
        if (b.points === a.points) {
        return b.totalScore - a.totalScore;
        }
        return b.points - a.points;
    });
  };

  useEffect(() => {
    const fetchFixtures = async () => {
      const fixtures = await api.getLeagueFixtureResults(user.activeLeague);
      setStandings(calculateStandings(fixtures));
    };
    fetchFixtures();
  }, []);

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Position</th>
            <th>Name</th>
            <th>Wins</th>
            <th>Draws</th>
            <th>Losses</th>
            <th>Total Score</th>
            <th>Points</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((standing, index) => (
            <tr key={standing.userId}>
              <td>{index + 1}</td>
              <td>{standing.name}</td>
              <td>{standing.wins}</td>
              <td>{standing.draws}</td>
              <td>{standing.losses}</td>
              <td>{standing.totalScore}</td>
              <td>{standing.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeagueTable;
