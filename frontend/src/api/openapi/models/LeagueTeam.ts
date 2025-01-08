/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TeamTactics } from './TeamTactics';
export type LeagueTeam = {
    goalkeepers: Array<number>;
    defenders: Array<number>;
    midfielders: Array<number>;
    forwards: Array<number>;
    subs: Array<number>;
    tactic?: TeamTactics;
    teamId: number;
    leagueId: number;
    userId: number;
    teamName: string;
};

