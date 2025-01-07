/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DefenderStats } from './DefenderStats';
import type { ForwardStats } from './ForwardStats';
import type { GoalkeepStats } from './GoalkeepStats';
import type { MidfielderStats } from './MidfielderStats';
import type { Player } from './Player';
/**
 * Model containing all info the frontend needs to display player stats for a gameweek
 */
export type PlayerScores = {
    player: Player;
    fixtureStats: Record<string, (GoalkeepStats | DefenderStats | MidfielderStats | ForwardStats)>;
};

