import { Fixture, FootballTeam } from '../api/openapi';
import styles from './GameweekFixtures.module.css';

interface GameweekFixturesProps {
  gameweekFixtures: Fixture[];
  footballTeams: FootballTeam[];
}

const GameweekFixtures = ({ gameweekFixtures, footballTeams }: GameweekFixturesProps) => {
  const groupFixturesByDateTime = (fixtures: Fixture[]) => {
    const grouped = fixtures.reduce((acc: { [key: string]: { [key: string]: Fixture[] } }, fixture) => {
      const date = new Date(fixture.startTime).toLocaleDateString();
      const time = new Date(fixture.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      if (!acc[date]) {
        acc[date] = {};
      }
      if (!acc[date][time]) {
        acc[date][time] = [];
      }
      acc[date][time].push(fixture);
      return acc;
    }, {});
    return grouped;
  };

  const getTeamLogo = (teamId: number) => {
    const team = footballTeams.find(team => team.id === teamId);
    return team?.logoPath || '';
  };

  const formatDate = (dateString: string) => {
    const parts = dateString.split('/');
    const date = new Date(+parts[2], +parts[1] - 1, +parts[0]);
    return date.toLocaleDateString('en-GB', { 
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const groupedFixtures = groupFixturesByDateTime(gameweekFixtures);

  return (
    <div className={styles.fixturesContainer}>
      {Object.entries(groupedFixtures).map(([date, timeGroups]) => (
        <div key={date} className={styles.dateGroup}>
          <h3 className={styles.dateHeader}>{formatDate(date)}</h3>
          {Object.entries(timeGroups).map(([time, fixtures]) => (
            <div key={`${date}-${time}`} className={styles.timeGroup}>
              <div className={styles.fixturesList}>
                {fixtures.map((fixture) => (
                  <div key={fixture.id} className={styles.fixtureCard}>
                    <div className={`${styles.teamInfo} ${styles.homeTeam}`}>
                      <span className={styles.teamName}>
                        {footballTeams.find(team => team.id === fixture.localteamId)?.name}
                      </span>
                      <img 
                        src={getTeamLogo(fixture.localteamId)} 
                        alt="Home Team"
                        className={styles.teamLogo}
                      />
                    </div>
                    <div className={styles.scoreTime}>
                      {new Date(fixture.startTime) < new Date() ? (
                        <div className={styles.score}>
                          {fixture.localteamScore} - {fixture.visitorteamScore}
                        </div>
                      ) : (
                        <div className={styles.time}>
                          {new Date(fixture.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </div>
                    <div className={`${styles.teamInfo} ${styles.awayTeam}`}>
                      <img 
                        src={getTeamLogo(fixture.visitorteamId)} 
                        alt="Away Team"
                        className={styles.teamLogo}
                      />
                      <span className={styles.teamName}>
                        {footballTeams.find(team => team.id === fixture.visitorteamId)?.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default GameweekFixtures;
