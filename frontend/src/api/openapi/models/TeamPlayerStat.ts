/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DefenderStats } from './DefenderStats';
import type { ForwardStats } from './ForwardStats';
import type { GoalkeepStats } from './GoalkeepStats';
import type { MidfielderStats } from './MidfielderStats';
import type { TeamStats } from './TeamStats';
export type TeamPlayerStat = {
    teamStats: TeamStats;
    playerStats: (GoalkeepStats | DefenderStats | MidfielderStats | ForwardStats);
};

