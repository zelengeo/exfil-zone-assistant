import React from 'react';
import { LANE_STEP, LANE_X, MAX_LANE, ROW_H, laneX } from '../utils/chain';

/**
 * The connectors between chain rows.
 *
 * One SVG per chain rather than a border per row, because a prerequisite and its dependant are not
 * always adjacent: a branch rejoins the spine several rows further down, and only a drawn line says
 * which task it came back from.
 *
 * It is painted over the rows, not behind them — a selected row has a background, and a line that
 * disappeared under it would break the chain exactly where the eye is. Nothing here takes a click;
 * every target is a row underneath.
 *
 * Geometry comes from `chain.ts` so the lines and the markers cannot drift apart.
 */

/** Clearance around a node, so a line stops short of the marker instead of striking through it. */
const NODE_GAP = 8;
/** Where the elbow of a lane change sits: just above the row it lands on. */
const ELBOW_RISE = 13;

export const SPINE_W = LANE_X + MAX_LANE * LANE_STEP + 12;

export interface SpineEdge {
    fromRow: number;
    toRow: number;
    fromLane: number;
    toLane: number;
    /** Whether the prerequisite is done — a travelled edge is drawn brighter than one ahead of you. */
    travelled: boolean;
}

export interface ChainSpineProps {
    edges: SpineEdge[];
    rowCount: number;
}

const rowY = (row: number): number => row * ROW_H + ROW_H / 2;

function pathFor(edge: SpineEdge): string {
    const x1 = laneX(edge.fromLane);
    const x2 = laneX(edge.toLane);
    const y1 = rowY(edge.fromRow) + NODE_GAP;
    const y2 = rowY(edge.toRow) - NODE_GAP;

    // Square corners rather than curves: the rest of the route has no rounded anything.
    if (x1 === x2) return `M ${x1} ${y1} V ${y2}`;
    return `M ${x1} ${y1} V ${rowY(edge.toRow) - ELBOW_RISE} H ${x2} V ${y2}`;
}

export default function ChainSpine({ edges, rowCount }: ChainSpineProps) {
    const height = rowCount * ROW_H;

    return (
        <svg
            width={SPINE_W}
            height={height}
            viewBox={`0 0 ${SPINE_W} ${height}`}
            className="absolute left-0 top-0 pointer-events-none"
            aria-hidden="true"
        >
            {edges.map((edge) => (
                <path
                    key={`${edge.fromRow}-${edge.toRow}`}
                    d={pathFor(edge)}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1}
                    className={edge.travelled ? 'text-line-400' : 'text-line-800'}
                />
            ))}
        </svg>
    );
}
