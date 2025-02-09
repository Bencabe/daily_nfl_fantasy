import styles from './InfoPage.module.css';

const InfoPage = () => {
  return (
    <div className={styles.infoContainer}>
      
      <section className={styles.basicPoints}>
        <h2>Base Points (All Positions)</h2>
        <ul>
          <li>Minutes played: 1 point ({'<'} 45 mins), 2 points ({'>='} 45 mins)</li>
          <li>Goals: 4-6 points (varies by position)</li>
          <li>Assists: 4 points</li>
          <li>Red card: -3 points</li>
          <li>Yellow card: -1 point</li>
          <li>Own goal: -4 points</li>
          <li>Penalty won: 2 points</li>
          <li>Penalty committed: -2 points</li>
        </ul>
      </section>

      <div className={styles.positionContainer}>
        <section className={styles.positionCard}>
          <h2>Goalkeeper</h2>
          <ul>
            <li>Goals: 6 points</li>
            <li>Clean sheet: 4 points</li>
            <li>2 Goals conceded: -1 point</li>
            <li>2 saves: 1 point</li>
            <li>Penalty saved: 5 points</li>
          </ul>
        </section>

        <section className={styles.positionCard}>
          <h2>Defender</h2>
          <ul>
            <li>Goals: 6 points</li>
            <li>Clean sheet: 4 points</li>
            <li>2 Goals conceded: -1 point</li>
            <li>4 tackles: 1 point</li>
            <li>4 blocks: 1 point</li>
            <li>4 interceptions: 1 point</li>
            <li>4 aerials won: 1 point</li>
            <li>4 duels won: 1 point</li>
            <li>10 fouls committed: -1 point</li>
          </ul>
        </section>

        <section className={styles.positionCard}>
          <h2>Midfielder</h2>
          <ul>
            <li>Goals: 5 points</li>
            <li>2 key passes: 1 point</li>
            <li>Pass accuracy {'>'} 75%: 1 point</li>
            <li>4 tackles: 1 point</li>
            <li>4 interceptions: 1 point</li>
            <li>4 duels won: 1 point</li>
            <li>4 successful dribbles: 1 point</li>
            <li>4 fouls won: 1 point</li>
            <li>10 fouls committed: -1 point</li>
            <li>Penalty committed: -3 points (overrides base -2)</li>
          </ul>
        </section>

        <section className={styles.positionCard}>
          <h2>Forward</h2>
          <ul>
            <li>Goals: 4 points</li>
            <li>2 shots on target: 1 point</li>
            <li>2 key passes: 1 point</li>
            <li>4 aerials won: 1 point</li>
            <li>Penalty won: 3 points</li>
          </ul>
        </section>
      </div>

      <section className={styles.teamTactics}>
        <h2>Team Tactic Points</h2>
        <div className={styles.tacticsInfo}>
        <p>Team points are calculated from the combined performance of your starting 11 players. Your selected team tactic determines which thresholds apply</p>
        </div>
        <div className={styles.tacticsGrid}>
          <div>
            <h3>Possession Thresholds</h3>
            <ul>
              <li>Pass accuracy {'>'} 80%</li>
              <li>Total passes {'>'} 350</li>
              <li>Dispossessed {'<'} 7</li>
            </ul>
          </div>
          <div>
            <h3>Defensive Thresholds</h3>
            <ul>
              <li>Tackles {'>'} 20</li>
              <li>Interceptions {'>'} 10</li>
              <li>Goals conceded {'<'} 10</li>
            </ul>
          </div>
          <div>
            <h3>Offensive Thresholds</h3>
            <ul>
              <li>Goals + Assists {'>'} 6</li>
              <li>Key passes {'>'} 10</li>
              <li>Goals + Assist {'>'} Goals conceded</li>
            </ul>
          </div>
        </div>
        <div className={styles.tacticsFooter}>
          <p>Maximum points per tactic: +30</p>
          <p>Minimum points per tactic: -15</p>
        </div>
      </section>
    </div>
  );
};

export default InfoPage;
