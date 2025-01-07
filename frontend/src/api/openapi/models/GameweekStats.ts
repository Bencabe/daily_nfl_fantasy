/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PlayerScores } from './PlayerScores';
import type { TeamStats } from './TeamStats';
import type { TeamTactics } from './TeamTactics';
export type GameweekStats = {
    playerStats: Array<PlayerScores>;
    teamStats: TeamStats;
    gameweekId: number;
    totalPlayerPoints: number;
    totalTeamPoints: number;
    teamTactic?: TeamTactics;
    subs: Array<number>;
};

