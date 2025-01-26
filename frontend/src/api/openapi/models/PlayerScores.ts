/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Player } from './Player';
import type { TeamPlayerStat } from './TeamPlayerStat';
/**
 * Model containing all info the frontend needs to display player stats for a gameweek
 */
export type PlayerScores = {
    player: Player;
    fixtureStats: Record<string, TeamPlayerStat>;
};

