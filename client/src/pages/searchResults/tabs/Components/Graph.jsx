//#region ===== USAGE =====
// CORRECT
//
// <Graph data={yourData} />
//
// OR
//
// if (loading) return <Loader />;
// return <Graph data={loadedData} />;
//
//---------------------------------------------------------
// WRONG
//
// <Graph />  // Error!
// <Graph data={null} />  // Error!
//
//---------------------------------------------------------
// DATA ENTER EXAMPLE:
// const num = Number(pulseValue);
//
// if (!isNaN(num)) {
//     try {
//         await api.savePulse(id, num)
//
//         const newEntry = {
//             val: num,
//             created_at: new Date().toISOString()
//         };
//         // Update local state
//         setPulseValues([...pulseValues, newEntry]);
//         setPulseValue('');
//     } catch (error) {
//         console.error('Error saving pulse:', error);
//     }
// }
//#endregion

import { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types"

export const Graph = ({
    data = [],
    minVal: propMinVal = 0,
    MaxVal: propMaxVal,
    height = 100,
    padding = 30,
    lineColor = "#ff0f0f",
    areaOpacity = 0.2,
    backgroundColor = "aliceblue",
    borderColor = "#ccc",
}) => {
    const containerRef = useRef(null);
    const [containerWidth, setContainerWidth] = useState(200);
    const [hover, setHover] = useState(null);

    // Calculate dynamic padding values
    const paddingTop = 20;
    const paddingBottom = 20;
    const paddingLeft = 30;
    const paddingRight = 20;

    // Handle container resizing
    useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                const width = containerRef.current.offsetWidth;
            }
        };

        updateWidth();

        const resizeObserver = new ResizeObserver(updateWidth);
        if (containerRef.current)
            resizeObserver.observe(containerRef.current);

        return () => resizeObserver.disconnect();
    }, []);

    // Early return for invalid data
    if (!Array.isArray(data)) {
        return (
            <div style={{ color: 'red' }}>
                Invalid data format - expected array
            </div>
        );
    }

    // Empty state handling
    if (!data || data.length === 0) {
        return (
            <div ref={containerRef} style={{ width: '100%' }}>
                <svg
                    width="100%"
                    height={height}
                    style={{
                        background: 'aliceblue',
                        border: `1px solid #ccc`
                    }}
                    aria-label="No data available"
                />
            </div>
        );
    }

    // Calculate min and max values
    const minVal = propMinVal ?? 0
    const maxVal = propMaxVal ?? Math.max(100, ...data.map(item => Number(item.val) || 0));

    // Calculate data points
    const points = useMemo(() => {
        return data?.map((item, idx) => {
            const val = Number(item?.val) || minVal
            const scaledVal = ((val - minVal) / (maxVal - minVal)) * 100;
            const x = paddingLeft + ((containerWidth - paddingLeft - paddingRight) / Math.max(1, data.length - 1)) * idx;
            const y = height - paddingBottom - ((scaledVal / 100) * (height - paddingTop - paddingBottom));
            return { x, y, val, created_at: item.created_at };
        }) || []
    }, [data, containerWidth, minVal, maxVal, height, paddingLeft, paddingRight, paddingTop, paddingBottom])

    // Create smooth SVG path
    const createSmoothPath = useMemo(() => {
        return (pts) => {
            if (pts.length < 2) return '';
            let d = `M${pts[0].x},${pts[0].y}`;
            for (let i = 1; i < pts.length; i++) {
                const prev = pts[i - 1];
                const curr = pts[i];
                const midX = (prev.x + curr.x) / 2;
                d += ` C${midX},${prev.y} ${midX},${curr.y} ${curr.x},${curr.y}`;
            }
            return d;
        }
    }, [])

    const linePath = useMemo(() => createSmoothPath(points), [points, createSmoothPath])
    const areaPath = useMemo(() => {
        return points.length >= 2
            ? `${linePath} L${points[points.length - 1].x},${height - paddingBottom} L${points[0].x},${height - paddingBottom} Z`
            : ''
    }, [linePath, points, height, paddingBottom])

    return (
        <div
            ref={containerRef}
            style={{
                position: 'relative',
                width: '100%',
                height: `${height}px`
            }}
        >
            {/* Hover tooltip */}
            {hover && (
                <div
                    style={{
                        position: 'absolute',
                        top: `${hover.y - 30}px`,
                        left: `${hover.x + 5}px`,
                        background: '#333',
                        color: '#fff',
                        padding: '2px 6px',
                        borderRadius: 4,
                        fontSize: 12,
                        pointerEvents: 'none',
                        whiteSpace: 'nowrap',
                        zIndex: 10,
                    }}
                >
                    <div>{hover.val}</div>
                    {hover.created_at && (
                        <div style={{ fontSize: 10, color: '#ccc' }}>
                            {new Date(hover.created_at).toLocaleString()}
                        </div>
                    )}
                </div>
            )}

            <svg
                width={containerWidth}
                height={height}
                style={{
                    background: 'aliceblue',
                    border: '1px solid #ccc'
                }}
            >
                {/* X-axis */}
                <line
                    x1={paddingLeft}
                    y1={height - paddingBottom}
                    x2={containerWidth - paddingRight}
                    y2={height - paddingBottom}
                    stroke="#999"
                />

                {/* Y-axis */}
                <line
                    x1={paddingLeft}
                    y1={paddingTop}
                    x2={paddingLeft}
                    y2={height - paddingBottom}
                    stroke="#999"
                />

                {/* Y-axis labels */}
                {/* maxVal */}
                <text
                    x={paddingLeft - 5}
                    y={paddingTop + 5}
                    fontSize={12}
                    fill="#666"
                    textAnchor="end"
                >
                    {maxVal}
                </text>
                {/* minVal */}
                <text
                    x={paddingLeft - 5}  // little left of the y-axis line
                    y={height - paddingBottom + 3} // a bit below the top padding for alignment
                    fontSize={12}
                    fill="#666"
                    textAnchor="end"
                >
                    {minVal}
                </text>

                {/* Horizontal grid lines */}
                {[0.25, 0.5, 0.75, 1].map(frac => (
                    <line
                        key={frac}
                        x1={paddingLeft}
                        y1={height - paddingBottom - frac * (height - paddingTop - paddingBottom)}
                        x2={containerWidth - paddingRight}
                        y2={height - paddingBottom - frac * (height - paddingTop - paddingBottom)}
                        stroke="#dadada"
                        strokeDasharray="2,2"
                    />
                ))}

                {/* Area and line paths */}
                {points.length >= 2 && (
                    <>
                        <path
                            d={areaPath}
                            fill={lineColor}
                            opacity={areaOpacity}
                        />
                        <path
                            d={linePath}
                            stroke={lineColor}
                            strokeWidth={2}
                            fill="none"
                        />
                    </>
                )}

                {/* Data points */}
                {points.map((point, idx) => (
                    <circle
                        key={idx}
                        cx={point.x}
                        cy={point.y}
                        r={3}
                        fill={lineColor}
                        onMouseEnter={() => setHover(point)}
                        onMouseLeave={() => setHover(null)}
                    />
                ))}
            </svg>
        </div>
    );
}

Graph.propTypes = {
    data: PropTypes.arrayOf(
        PropTypes.shape({
            val: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            created_at: PropTypes.string,
        })
    ).isRequired,
    minVal: PropTypes.number,
    maxVal: PropTypes.number,
    height: PropTypes.number,
    padding: PropTypes.number,
    lineColor: PropTypes.string,
    areaOpacity: PropTypes.number,
    backgroundColor: PropTypes.string,
    borderColor: PropTypes.string,
}

export default Graph