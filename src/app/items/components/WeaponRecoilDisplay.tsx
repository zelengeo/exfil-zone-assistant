import React from 'react';
import { Crosshair, TrendingUp } from 'lucide-react';
import {RecoilParameters} from "@/types/items";

interface WeaponRecoilDisplayProps {
    recoilParameters: RecoilParameters;
    className?: string;
}

export default function WeaponRecoilDisplay({ recoilParameters, className = '' }: WeaponRecoilDisplayProps) {
    // Calculate recoil scores (lower is better)
    const verticalScore = recoilParameters.verticalRecoilControl * 100;
    const horizontalScore = recoilParameters.horizontalRecoilControl * 100;
    const overallScore = (verticalScore + horizontalScore) / 2;

    // Get color based on score
    const getScoreColor = (score: number) => {
        if (score <= 25) return 'text-green-400';
        if (score <= 35) return 'text-lime-400';
        if (score <= 45) return 'text-yellow-400';
        if (score <= 55) return 'text-orange-400';
        return 'text-red-400';
    };

    // Visual recoil pattern size (inverted - lower control = larger pattern)
    const patternWidth = 200;
    const patternHeight = 200;
    const horizontalSpread = (1 - recoilParameters.horizontalRecoilControl) * 80;
    const verticalRise = (1 - recoilParameters.verticalRecoilControl) * 120;

    // Generate recoil pattern points
    const generateRecoilPattern = () => {
        const points = [];
        const shots = 10;
        //FIXME this is just a prototype - not affiliated with in game recoil

        for (let i = 0; i < shots; i++) {
            const progress = i / (shots - 1);

            // Vertical climb with some randomness
            const y = -verticalRise * progress * (1 + Math.random() * 0.2);

            // Horizontal spread increases with shots
            const maxSpread = horizontalSpread * progress;
            const x = (Math.random() - 0.5) * maxSpread;

            points.push({ x, y });
        }

        return points;
    };

    const recoilPoints = generateRecoilPattern();

    return (
        <div className={`military-box p-6 rounded-sm ${className}`}>
            <h3 className="text-xl font-bold text-olive-400 mb-4 flex items-center gap-2">
                <Crosshair size={20} />
                Recoil Analysis
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recoil Pattern Visualization */}
                <div className="military-card p-4 rounded-sm">
                    <h4 className="text-tan-300 font-medium mb-3 text-center">Recoil Pattern (10 shots)</h4>
                    <div className="flex justify-center">
                        <svg width={patternWidth} height={patternHeight} className="bg-military-900 rounded-sm border border-military-700">
                            {/* Grid */}
                            <defs>
                                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#454d28" strokeWidth="0.5" opacity="0.3" />
                                </pattern>
                            </defs>
                            <rect width={patternWidth} height={patternHeight} fill="url(#grid)" />

                            {/* Center crosshair */}
                            <line x1={patternWidth/2} y1={0} x2={patternWidth/2} y2={patternHeight} stroke="#9ba85e" strokeWidth="1" opacity="0.5" />
                            <line x1={0} y1={patternHeight/2} x2={patternWidth} y2={patternHeight/2} stroke="#9ba85e" strokeWidth="1" opacity="0.5" />

                            {/* Recoil pattern */}
                            <g transform={`translate(${patternWidth/2}, ${patternHeight * 0.8})`}>
                                {/* Connection lines */}
                                <path
                                    d={`M 0 0 ${recoilPoints.map(p => `L ${p.x} ${p.y}`).join(' ')}`}
                                    stroke="#ef4444"
                                    strokeWidth="1"
                                    fill="none"
                                    opacity="0.5"
                                />

                                {/* First shot (center) */}
                                <circle cx={0} cy={0} r="4" fill="#10b981" />

                                {/* Subsequent shots */}
                                {recoilPoints.slice(1).map((point, i) => (
                                    <circle
                                        key={i}
                                        cx={point.x}
                                        cy={point.y}
                                        r="3"
                                        fill="#ef4444"
                                        opacity={0.8 - (i * 0.05)}
                                    />
                                ))}
                            </g>
                        </svg>
                    </div>
                    <div className="mt-3 text-center text-sm text-tan-400">
                        Pattern shows typical spray with sustained fire
                    </div>
                </div>

                {/* Recoil Stats */}
                <div className="space-y-4">
                    <h4 className="text-tan-300 font-medium mb-3">Control Ratings</h4>

                    {/* Overall Score */}
                    <div className="military-card p-4 rounded-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-tan-100 font-medium">Overall Control</span>
                            <span className={`text-2xl font-bold ${getScoreColor(overallScore)}`}>
                {overallScore.toFixed(0)}%
              </span>
                        </div>
                        <div className="w-full bg-military-700 rounded-full h-3">
                            <div
                                className={`h-3 rounded-full transition-all ${
                                    overallScore <= 25 ? 'bg-green-500' :
                                        overallScore <= 35 ? 'bg-lime-500' :
                                            overallScore <= 45 ? 'bg-yellow-500' :
                                                overallScore <= 55 ? 'bg-orange-500' :
                                                    'bg-red-500'
                                }`}
                                style={{ width: `${overallScore}%` }}
                            />
                        </div>
                    </div>

                    {/* Vertical Control */}
                    <div className="military-card p-3 rounded-sm">
                        <div className="flex items-center justify-between mb-2">
              <span className="text-tan-400 text-sm flex items-center gap-1">
                <TrendingUp size={14} className="rotate-180" />
                Vertical Control
              </span>
                            <span className={`font-bold ${getScoreColor(verticalScore)}`}>
                {verticalScore.toFixed(0)}%
              </span>
                        </div>
                        <div className="w-full bg-military-700 rounded-full h-2">
                            <div
                                className="h-2 rounded-full bg-olive-500 transition-all"
                                style={{ width: `${verticalScore}%` }}
                            />
                        </div>
                    </div>

                    {/* Horizontal Control */}
                    <div className="military-card p-3 rounded-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-tan-400 text-sm">↔ Horizontal Control</span>
                            <span className={`font-bold ${getScoreColor(horizontalScore)}`}>
                {horizontalScore.toFixed(0)}%
              </span>
                        </div>
                        <div className="w-full bg-military-700 rounded-full h-2">
                            <div
                                className="h-2 rounded-full bg-olive-500 transition-all"
                                style={{ width: `${horizontalScore}%` }}
                            />
                        </div>
                    </div>

                    {/* Advanced Parameters */}
                    <details className="military-card p-3 rounded-sm">
                        <summary className="cursor-pointer text-tan-300 font-medium">
                            Advanced Parameters
                        </summary>
                        <div className="mt-3 space-y-2 text-sm">
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <span className="text-tan-400">Pitch Momentum:</span>
                                    <span className="text-tan-100 ml-2">{recoilParameters.pitchBaseMomentum}</span>
                                </div>
                                <div>
                                    <span className="text-tan-400">Yaw Momentum:</span>
                                    <span className="text-tan-100 ml-2">{recoilParameters.yawBaseMomentum}</span>
                                </div>
                                <div>
                                    <span className="text-tan-400">Pitch Damping:</span>
                                    <span className="text-tan-100 ml-2">{recoilParameters.pitchDamping.toFixed(2)}</span>
                                </div>
                                <div>
                                    <span className="text-tan-400">Yaw Damping:</span>
                                    <span className="text-tan-100 ml-2">{recoilParameters.yawDamping.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </details>
                </div>
            </div>

            {/* Recoil Tips */}
            <div className="mt-6 p-4 bg-military-800 rounded-sm border-l-4 border-olive-600">
                <h4 className="text-olive-400 font-medium mb-2">Recoil Management Tips</h4>
                <div className="text-sm text-tan-300 space-y-1">
                    {verticalScore > 40 && (
                        <p>• High vertical recoil - pull down consistently while firing</p>
                    )}
                    {horizontalScore > 40 && (
                        <p>• Significant horizontal spread - use short bursts for accuracy</p>
                    )}
                    {overallScore <= 30 && (
                        <p>• Excellent recoil control - suitable for sustained fire</p>
                    )}
                    {overallScore > 50 && (
                        <p>• Challenging recoil - recommended for experienced players</p>
                    )}
                </div>
            </div>
        </div>
    );
}