import React, {useState, useRef, useEffect, useCallback} from 'react';
import {CurvePoint} from "@/types/items";

interface BallisticCurveChartProps {
    title: string;
    curves: {
        name: string;
        data: CurvePoint[];
        color: string;
    }[];
    xLabel?: string;
    xLabelModifier?: number;
    yLabel?: string;
    yLabelModifier?: number;
    height?: number;
    maxWidth?: number;
}

interface TooltipData {
    x: number;
    y: number;
    time: number;
    value: number;
    color: string;
}

export default function BallisticCurveChart({
                                                title,
                                                curves,
                                                xLabel = 'Distance',
                                                xLabelModifier = 1,
                                                yLabel = 'Value',
                                                yLabelModifier = 1,
                                                height = 300,
                                                maxWidth = 1200,
                                            }: BallisticCurveChartProps) {
    const [tooltip, setTooltip] = useState<TooltipData | null>(null);
    const [containerWidth, setContainerWidth] = useState(600);
    const containerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);


    // Responsive resize handling
    const handleResize = useCallback(() => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const newWidth = Math.max(300, Math.min(maxWidth, rect.width - 32)); // Min 300px, max 800px, with padding
            setContainerWidth(newWidth);
        }
    }, [maxWidth]);

    useEffect(() => {
        // Initial size calculation
        handleResize();

        // Set up resize observer
        const resizeObserver = new ResizeObserver(handleResize);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        // Fallback for window resize
        window.addEventListener('resize', handleResize);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener('resize', handleResize);
        };
    }, [handleResize]);

    // Find the min/max values for scaling
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    curves.forEach(curve => {
        curve.data.forEach(point => {
            minX = Math.min(minX, point.time);
            maxX = Math.max(maxX, point.time);
            minY = Math.min(minY, point.value);
            maxY = Math.max(maxY, point.value);
        });
    });

    // Add some padding
    const xPadding = (maxX - minX) * 0.1 || 1;
    const yPadding = (maxY - minY) * 0.1 || 0.1;
    minX -= xPadding;
    maxX += xPadding;
    minY -= yPadding;
    maxY += yPadding;

    // SVG dimensions
    const responsivePadding = {
        top: 20,
        right: containerWidth < 400 ? 10 : 20,
        bottom: containerWidth < 400 ? 40 : 50,
        left: containerWidth < 400 ? 40 : 60
    };

    const chartWidth = containerWidth - responsivePadding.left - responsivePadding.right;
    const chartHeight = height - responsivePadding.top - responsivePadding.bottom;

    // Scale functions
    const scaleX = (x: number) => ((x - minX) / (maxX - minX)) * chartWidth;
    const scaleY = (y: number) => chartHeight - ((y - minY) / (maxY - minY)) * chartHeight;

    // Find closest point to mouse position
    const findClosestPoint = (mouseX: number, mouseY: number) => {
        let closestPoint: TooltipData | null = null;
        let minDistance = Infinity;

        curves.forEach(curve => {
            curve.data.forEach(point => {
                const scaledX = scaleX(point.time);
                const scaledY = scaleY(point.value);
                const distance = Math.sqrt(
                    Math.pow(scaledX - mouseX, 2) + Math.pow(scaledY - mouseY, 2)
                );

                if (distance < minDistance && distance < 25) { // 25px threshold
                    minDistance = distance;
                    closestPoint = {
                        x: scaledX,
                        y: scaledY,
                        time: point.time * xLabelModifier,
                        value: point.value * yLabelModifier,
                        color: curve.color
                    };
                }
            });
        });

        return closestPoint;
    };

    // Handle mouse movement
    const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
        if (!svgRef.current) return;

        const rect = svgRef.current.getBoundingClientRect();
        const mouseX = event.clientX - rect.left - responsivePadding.left;
        const mouseY = event.clientY - rect.top - responsivePadding.top;

        // Check if mouse is within chart area
        if (mouseX < 0 || mouseX > chartWidth || mouseY < 0 || mouseY > chartHeight) {
            setTooltip(null);
            return;
        }

        const closestPoint = findClosestPoint(mouseX, mouseY);
        setTooltip(closestPoint);
    };

    const handleMouseLeave = () => {
        setTooltip(null);
    };

    // Generate path for cubic interpolation
    const generatePath = (points: CurvePoint[]) => {
        if (points.length === 0) return '';

        let path = `M ${scaleX(points[0].time)} ${scaleY(points[0].value)}`;

        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i];
            const p1 = points[i + 1];

            if (p0.interpMode === 'linear') {
                path += ` L ${scaleX(p1.time)} ${scaleY(p1.value)}`;
            } else {
                // Cubic bezier approximation
                const dx = (p1.time - p0.time) / 3;
                const c1x = scaleX(p0.time + dx);
                const c1y = scaleY(p0.value + p0.leaveTangent * dx);
                const c2x = scaleX(p1.time - dx);
                const c2y = scaleY(p1.value - p1.arriveTangent * dx);

                path += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${scaleX(p1.time)} ${scaleY(p1.value)}`;
            }
        }

        return path;
    };

    // Generate grid lines
    const xGridLines = [];
    const yGridLines = [];
    const xTicks = 5;
    const yTicks = 5;

    for (let i = 0; i <= xTicks; i++) {
        const x = (i / xTicks) * chartWidth;
        const value = minX + (i / xTicks) * (maxX - minX);
        xGridLines.push({x, value});
    }

    for (let i = 0; i <= yTicks; i++) {
        const y = (i / yTicks) * chartHeight;
        const value = minY + ((yTicks - i) / yTicks) * (maxY - minY);
        yGridLines.push({y, value});
    }

    return (
        <div className="military-card p-4 rounded-sm relative">
            <h4 className="text-lg font-bold text-olive-400 mb-4">{title}</h4>
            <div ref={containerRef} className="w-full">
                <div className="overflow-x-auto">
                    <svg
                        ref={svgRef}
                        width={containerWidth}
                        height={height}
                        className="bg-military-900 rounded cursor-crosshair"
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                    >
                        <g transform={`translate(${responsivePadding.left}, ${responsivePadding.top})`}>
                            {/* Grid lines */}
                            {xGridLines.map((line, i) => (
                                <g key={`x-${i}`}>
                                    <line
                                        x1={line.x}
                                        y1={0}
                                        x2={line.x}
                                        y2={chartHeight}
                                        stroke="#454d28"
                                        strokeOpacity="0.3"
                                    />
                                    <text
                                        x={line.x}
                                        y={chartHeight + 20}
                                        textAnchor="middle"
                                        fill="#e7d1a9"
                                        fontSize="12"
                                    >
                                        {(line.value * xLabelModifier).toFixed(2)}
                                    </text>
                                </g>
                            ))}

                            {yGridLines.map((line, i) => (
                                <g key={`y-${i}`}>
                                    <line
                                        x1={0}
                                        y1={line.y}
                                        x2={chartWidth}
                                        y2={line.y}
                                        stroke="#454d28"
                                        strokeOpacity="0.3"
                                    />
                                    <text
                                        x={-10}
                                        y={line.y + 4}
                                        textAnchor="end"
                                        fill="#e7d1a9"
                                        fontSize="12"
                                    >
                                        {(line.value * yLabelModifier).toFixed(2)}
                                    </text>
                                </g>
                            ))}

                            {/* Axes */}
                            <line x1={0} y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="#9ba85e"
                                  strokeWidth="2"/>
                            <line x1={0} y1={0} x2={0} y2={chartHeight} stroke="#9ba85e" strokeWidth="2"/>

                            {/* Curves */}
                            {curves.map((curve, i) => (
                                <g key={i}>
                                    <path
                                        d={generatePath(curve.data)}
                                        fill="none"
                                        stroke={curve.color}
                                        strokeWidth="2"
                                    />
                                    {/* Data points */}
                                    {curve.data.map((point, j) => (
                                        <circle
                                            key={j}
                                            cx={scaleX(point.time)}
                                            cy={scaleY(point.value)}
                                            r="4"
                                            fill={curve.color}
                                            stroke="#1a1c18"
                                            strokeWidth="1"
                                            className="hover:r-6 transition-all cursor-pointer"
                                        />
                                    ))}
                                </g>
                            ))}

                            {/* Highlight hovered point */}
                            {tooltip && (
                                <circle
                                    cx={tooltip.x}
                                    cy={tooltip.y}
                                    r="7"
                                    fill={tooltip.color}
                                    stroke="#ffffff"
                                    strokeWidth="2"
                                    className="animate-pulse"
                                />
                            )}

                            {/* Labels */}
                            <text
                                x={chartWidth / 2}
                                y={chartHeight + 40}
                                textAnchor="middle"
                                fill="#e7d1a9"
                                fontSize="14"
                            >
                                {xLabel}
                            </text>
                            <text
                                x={-chartHeight / 2}
                                y={-40}
                                textAnchor="middle"
                                fill="#e7d1a9"
                                fontSize="14"
                                transform="rotate(-90)"
                            >
                                {yLabel}
                            </text>
                        </g>

                        {/* Legend */}
                        {curves.length > 1 && (
                            <g transform={`translate(${containerWidth - 150}, 20)`}>
                                {curves.map((curve, i) => (
                                    <g key={i} transform={`translate(0, ${i * 20})`}>
                                        <line x1={0} y1={0} x2={20} y2={0} stroke={curve.color} strokeWidth="2"/>
                                        <text x={25} y={4} fill="#e7d1a9" fontSize="12">
                                            {curve.name}
                                        </text>
                                    </g>
                                ))}
                            </g>
                        )}
                    </svg>
                </div>
            </div>
            {/* Tooltip */}
            {tooltip && (
                <div
                    className="absolute pointer-events-none z-20 bg-military-800 border border-military-600 rounded-sm p-3 shadow-lg min-w-32"
                    style={{
                        left: responsivePadding.left + tooltip.x,
                        top: responsivePadding.top + tooltip.y - 20,
                        transform: tooltip.x > chartWidth - 120 ? 'translateX(-100%) translateX(-20px)' : 'none'
                    }}
                >
                    <div className="text-sm space-y-1">
                        <div className="flex justify-between gap-4">
                            <span className="text-tan-400">{xLabel}:</span>
                            <span className="text-tan-100 font-mono">{tooltip.time.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                            <span className="text-tan-400">{yLabel}:</span>
                            <span
                                className="font-mono font-semibold"
                                style={{color: tooltip.color}}
                            >
                                        {tooltip.value.toFixed(2)}
                                    </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}