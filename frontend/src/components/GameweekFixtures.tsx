import { Fixture, FootballTeam } from '../api/openapi';
import styles from './GameweekFixtures.module.css';

interface GameweekFixturesProps {
  gameweekFixtures: Fixture[];
  footballTeams: FootballTeam[];
}

const GameweekFixtures = ({ gameweekFixtures, footballTeams }: GameweekFixturesProps) => {
  const groupFixturesByDateTime = (fixtures: Fixture[]) => {
    const grouped = fixtures.reduce((acc: { [key: string]: { [key: string]: Fixture[] } }, fixture) => {
      const date = new Date(fixture.startTime);
      const dateKey = date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
      const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      if (!acc[dateKey]) {
        acc[dateKey] = {};
      }
      if (!acc[dateKey][time]) {
        acc[dateKey][time] = [];
      }
      acc[dateKey][time].push(fixture);
      return acc;
    }, {});
  
    const sortedEntries = Object.entries(grouped).sort(([dateA], [dateB]) => {
      const [dayA, monthA, yearA] = dateA.split('/');
      const [dayB, monthB, yearB] = dateB.split('/');
      return new Date(+yearA, +monthA - 1, +dayA).getTime() - new Date(+yearB, +monthB - 1, +dayB).getTime();
    });
  
    return Object.fromEntries(sortedEntries);
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
                      <span className={styles.fullName}>
                        {footballTeams.find(team => team.id === fixture.localteamId)?.name}
                      </span>
                      <span className={styles.code}>
                        {footballTeams.find(team => team.id === fixture.localteamId)?.shortCode}
                      </span>
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
                        <span className={styles.fullName}>
                          {footballTeams.find(team => team.id === fixture.visitorteamId)?.name}
                        </span>
                        <span className={styles.code}>
                          {footballTeams.find(team => team.id === fixture.visitorteamId)?.shortCode}
                        </span>
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
