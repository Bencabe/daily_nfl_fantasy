import { useEffect, useState } from 'react'
import { useGlobalContext } from '../utils/customHooks'
import api from '../api/main'
import { Player } from '../api/openapi/models/Player'
import { LeagueTeam } from '../api/openapi/models/LeagueTeam'
import styles from './PlayerSelection.module.css'
import { FootballTeam } from '../api/openapi/models/FootballTeam'
import { SeasonPlayerStats } from '../api/openapi'
import { convertStatName } from '../utils/helperFunctions'

const PlayerSelection = () => {
    const { user } = useGlobalContext()
    const [leagueTeams, setLeagueTeams] = useState<LeagueTeam[]>([])
    const [userTeam, setUserTeam] = useState<LeagueTeam>()
    const [selectedAvailablePlayer, setSelectedAvailablePlayer] = useState<SeasonPlayerStats | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [footballTeams, setFootballTeams] = useState<FootballTeam[]>([])
    const [positionFilter, setPositionFilter] = useState<string>('All')
    const [teamFilter, setTeamFilter] = useState<string>('All')
    const [searchName, setSearchName] = useState<string>('')
    const [seasonPlayerStats, setSeasonPlayerStats] = useState<SeasonPlayerStats[]>([])
    const [selectedStat, setSelectedStat] = useState<string>('goals')
    const [sortConfig, setSortConfig] = useState<{
        key: string;
        direction: 'ascending' | 'descending';
    } | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            const allSeasonPlayerStats = await api.getSeasonPlayerStats()
            const teams = await api.getLeagueTeams(user.activeLeague)
            const footballTeams = await api.getFootballTeams()
            setLeagueTeams(teams)
            setFootballTeams(footballTeams)
            setSeasonPlayerStats(allSeasonPlayerStats)

            
            const currentUserTeam = teams.find(team => team.userId === user.id)
            if (currentUserTeam) {
                setUserTeam(currentUserTeam)
            }
        }
        fetchData()
    }, [user])

    const getFootballTeamName = (teamId: number): string => {
        const footballTeam = footballTeams.find(team => team.id === teamId)
        return footballTeam ? footballTeam.name : 'Unknown'
    }

    const isPlayerTaken = (playerId: number): boolean => {
        if (!leagueTeams) return false
        return leagueTeams.some(team => 
            [...team.goalkeepers, ...team.defenders, ...team.midfielders, ...team.forwards, ...team.subs]
            .includes(playerId)
        )
    }

    const getPlayerById = (id: number): Player | undefined => {
        const playerStat = seasonPlayerStats.find(ps => ps.player.id === id)
        return playerStat?.player
    }

    const getCurrentTeamPlayers = (position: string): Player[] => {
        if (!userTeam) return []
        
        let playerIds: number[] = []
        switch(position) {
            case 'Goalkeeper':
                playerIds = userTeam.goalkeepers
                break
            case 'Defender':
                playerIds = userTeam.defenders
                break
            case 'Midfielder':
                playerIds = userTeam.midfielders
                break
            case 'Forward':
                playerIds = userTeam.forwards
                break
        }
        
        return playerIds.map(id => getPlayerById(id)).filter((p): p is Player => p !== undefined)
    }

    const handleSwapSelection = (seasonPlayerStats: SeasonPlayerStats) => {
        if (!isPlayerTaken(seasonPlayerStats.player.id)) {
            setSelectedAvailablePlayer(seasonPlayerStats)
            setIsModalOpen(true)
        }
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setSelectedAvailablePlayer(null)
    }

    const handlePlayerSwap = async (oldPlayerId: number) => {
        if (!selectedAvailablePlayer || !userTeam) return
    
        const updatedTeam: LeagueTeam = {
            ...userTeam,
            goalkeepers: userTeam.goalkeepers.map(id => 
                id === oldPlayerId ? selectedAvailablePlayer.player.id : id
            ),
            defenders: userTeam.defenders.map(id => 
                id === oldPlayerId ? selectedAvailablePlayer.player.id : id
            ),
            midfielders: userTeam.midfielders.map(id => 
                id === oldPlayerId ? selectedAvailablePlayer.player.id : id
            ),
            forwards: userTeam.forwards.map(id => 
                id === oldPlayerId ? selectedAvailablePlayer.player.id : id
            ),
            subs: userTeam.subs.map(id => 
                id === oldPlayerId ? selectedAvailablePlayer.player.id : id
            )
        }
        try {
            await api.updateTeam(updatedTeam)
            const updatedTeams = await api.getLeagueTeams(user.activeLeague)
            setLeagueTeams(updatedTeams)
            setUserTeam(updatedTeam)
            setSelectedAvailablePlayer(null)
            setIsModalOpen(false)
            setPositionFilter('All')
            setTeamFilter('All')
            setSearchName('')
        } catch (error) {
            console.error('Failed to update team:', error)
        }
    }

    const handleSort = (key: string) => {
        setSortConfig(prevConfig => {
            if (!prevConfig || prevConfig.key !== key) {
                return { key, direction: 'ascending' };
            }
            if (prevConfig.direction === 'ascending') {
                return { key, direction: 'descending' };
            }
            return null;
        });
    }

    const sortPlayers = (players: SeasonPlayerStats[]) => {
        if (!sortConfig) return players;
        
        return [...players].sort((a, b) => {
            if (sortConfig.key === 'name') {
                return sortConfig.direction === 'ascending' 
                    ? a.player.displayName.localeCompare(b.player.displayName)
                    : b.player.displayName.localeCompare(a.player.displayName);
            }
            if (sortConfig.key === 'team') {
                return sortConfig.direction === 'ascending'
                    ? getFootballTeamName(a.player.teamId).localeCompare(getFootballTeamName(b.player.teamId))
                    : getFootballTeamName(b.player.teamId).localeCompare(getFootballTeamName(a.player.teamId));
            }
            if (sortConfig.key === 'gamesPlayed') {
                return sortConfig.direction === 'ascending'
                    ? (a.gamesPlayed || 0) - (b.gamesPlayed || 0)
                    : (b.gamesPlayed || 0) - (a.gamesPlayed || 0);
            }
            return sortConfig.direction === 'ascending'
                ? (a.stats[sortConfig.key as keyof typeof a.stats] || 0) - (b.stats[sortConfig.key as keyof typeof b.stats] || 0)
                : (b.stats[sortConfig.key as keyof typeof b.stats] || 0) - (a.stats[sortConfig.key as keyof typeof a.stats] || 0);
        });
    }

    const filteredPlayers = seasonPlayerStats.filter(seasonPlayerStats => {
        const matchesPosition = positionFilter === 'All' || seasonPlayerStats.player.positionCategory === positionFilter
        const matchesTeam = teamFilter === 'All' || getFootballTeamName(seasonPlayerStats.player.teamId) === teamFilter
        const matchesSearch = seasonPlayerStats.player.displayName.toLowerCase().includes(searchName.toLowerCase())
        return matchesPosition && matchesTeam && matchesSearch
    })

    const sampleStats = seasonPlayerStats[0]?.stats || {}
    const statKeys = Object.keys(sampleStats)

    return (
        <div className={styles.container}>
            <div className={styles.filters}>
                <input
                    type="text"
                    placeholder="Search by name..."
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    className={styles.searchInput}
                />
                
                <select 
                    value={positionFilter} 
                    onChange={(e) => setPositionFilter(e.target.value)}
                    className={styles.filterSelect}
                >
                    <option value="All">All Positions</option>
                    <option value="Goalkeeper">Goalkeeper</option>
                    <option value="Defender">Defender</option>
                    <option value="Midfielder">Midfielder</option>
                    <option value="Forward">Forward</option>
                </select>

                <select 
                    value={teamFilter} 
                    onChange={(e) => setTeamFilter(e.target.value)}
                    className={styles.filterSelect}
                >
                    <option value="All">All Teams</option>
                    {footballTeams.map(team => (
                        <option key={team.id} value={team.name}>
                            {team.name}
                        </option>
                    ))}
                </select>
            </div>
                    
            <div className={styles.playersTable}>
                <table>
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('name')}>
                                Name {sortConfig?.key === 'name' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                            </th>
                            <th>Position</th>
                            <th onClick={() => handleSort('team')}>
                                Team {sortConfig?.key === 'team' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('gamesPlayed')}>
                                Games Played {sortConfig?.key === 'gamesPlayed' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort(selectedStat)}>
                                <select
                                    value={selectedStat}
                                    onChange={(e) => setSelectedStat(e.target.value)}
                                    className={styles.filterSelect}
                                >
                                    {statKeys.map(statKey => (
                                        <option key={statKey} value={statKey}>
                                            {convertStatName(statKey)}
                                        </option>
                                    ))}
                                </select>
                                {sortConfig?.key === selectedStat && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortPlayers(filteredPlayers).map(seasonPlayerStats => (
                            <tr 
                                key={seasonPlayerStats.player.id}
                                className={`
                                    ${styles.playerRow}
                                    ${isPlayerTaken(seasonPlayerStats.player.id) ? styles.disabled : styles.available}
                                    ${selectedAvailablePlayer?.player.id === seasonPlayerStats.player.id ? styles.selected : ''}
                                `}
                                onClick={() => handleSwapSelection(seasonPlayerStats)}
                            >
                                <td>{seasonPlayerStats.player.displayName}</td>
                                <td>{seasonPlayerStats.player.positionCategory}</td>
                                <td>{getFootballTeamName(seasonPlayerStats.player.teamId)}</td>
                                <td>{seasonPlayerStats.gamesPlayed || 0}</td>
                                <td>{seasonPlayerStats.stats[selectedStat as keyof typeof seasonPlayerStats.stats] || 0}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && selectedAvailablePlayer && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h2>Select player to swap with {selectedAvailablePlayer.player.displayName}</h2>
                            <button 
                                className={styles.closeButton}
                                onClick={handleCloseModal}
                            >
                                ×
                            </button>
                        </div>
                        <div className={styles.modalContent}>
                            <table className={styles.modalTable}>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Position</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {getCurrentTeamPlayers(selectedAvailablePlayer.player.positionCategory).map(player => (
                                        <tr 
                                            key={player.id}
                                            className={styles.modalTableRow}
                                            onClick={() => handlePlayerSwap(player.id)}
                                        >
                                            <td>{player.displayName}</td>
                                            <td>{player.positionCategory}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default PlayerSelection
