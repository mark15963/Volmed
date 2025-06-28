import { Upload, Form, Collapse } from "antd"
import { DeleteOutlined, UploadOutlined } from '@ant-design/icons'
import styles from '../searchResults.module.css';
import { useState, useEffect, useRef, memo } from 'react';
import axios from 'axios';

const { Dragger } = Upload;

const Graph = memo(({ data }) => {
    const containerRef = useRef(null);
    const [containerWidth, setContainerWidth] = useState(200);
    const height = 100;
    const paddingTop = 20;
    const paddingBottom = 40;
    const paddingLeft = 30;
    const paddingRight = 30;
    const padding = 30;
    const [hover, setHover] = useState(null);

    useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                const width = containerRef.current.offsetWidth;
                setContainerWidth(width);
            }
        };

        updateWidth(); // initial measurement

        const resizeObserver = new ResizeObserver(() => {
            updateWidth();
        });

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => resizeObserver.disconnect();
    }, []);

    if (!data || data.length === 0) {
        return (
            <div ref={containerRef} style={{ width: '100%' }}>
                <svg
                    width="100%"
                    height={height}
                    style={{ background: 'aliceblue', border: '1px solid #ccc' }}
                />
            </div>
        );
    }

    const maxVal = Math.max(100, ...data.map(item => Number(item.val) || 0));
    const points = data.map((item, idx) => {
        const val = Number(item.val) || 0
        const x = padding + ((containerWidth - 2 * padding) / Math.max(1, data.length - 1)) * idx;
        const y = height - padding - ((val / maxVal) * (height - 2 * padding));
        return { x, y, val, created_at: item.created_at };
    });

    const createSmoothPath = (pts) => {
        if (pts.length < 2) return '';
        let d = `M${pts[0].x},${pts[0].y}`;
        for (let i = 1; i < pts.length; i++) {
            const prev = pts[i - 1];
            const curr = pts[i];
            const midX = (prev.x + curr.x) / 2;
            d += ` C${midX},${prev.y} ${midX},${curr.y} ${curr.x},${curr.y}`;
        }
        return d;
    };

    const linePath = createSmoothPath(points);
    const areaPath = points.length >= 2
        ? `${linePath} L${points[points.length - 1].x},${height - paddingTop} L${points[0].x},${height - paddingTop} Z`
        : '';

    return (
        <div ref={containerRef} style={{ position: 'relative', width: '100%', height }}>
            {hover && (
                <div
                    style={{
                        position: 'absolute',
                        top: hover.y - 30,
                        left: hover.x + 5,
                        background: '#333',
                        color: '#fff',
                        padding: '2px 6px',
                        borderRadius: 4,
                        fontSize: 12,
                        pointerEvents: 'none',
                        whiteSpace: 'nowrap',
                    }}
                >
                    <div>ЧСС: {hover.val}</div>
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
                style={{ background: 'aliceblue', border: '1px solid #ccc' }}
            >
                {/* X-axis */}
                <line
                    x1={padding}
                    y1={height - paddingTop}
                    x2={containerWidth - padding}
                    y2={height - paddingTop}
                    stroke="#999"
                />
                {/* Y-axis */}
                <line
                    x1={padding}
                    y1={paddingTop}
                    x2={padding}
                    y2={height - paddingTop}
                    stroke="#999"
                />
                <text
                    x={padding - 5}  // little left of the y-axis line
                    y={padding + 4}  // a bit below the top padding for alignment
                    fontSize={12}
                    fill="#666"
                    textAnchor="end"
                >
                    {maxVal}
                </text>

                {/* Horizontal grid lines */}
                {[0, 0.25, 0.5, 0.75, 1, 1.25].map(frac => (
                    <line
                        key={frac}
                        x1={padding}
                        y1={height - padding - frac * (height - 2 * padding)}
                        x2={containerWidth - padding}
                        y2={height - padding - frac * (height - 2 * padding)}
                        stroke="#dadada"
                        strokeDasharray="2,2"
                    />
                ))}

                {points.length >= 2 && (
                    <>
                        <path d={areaPath} fill="#ff0f0f" opacity={0.3} />
                        <path d={linePath} stroke="#ff0f0f" strokeWidth={2} fill="none" />
                    </>
                )}

                {points.map((point, idx) => (
                    <circle
                        key={idx}
                        cx={point.x}
                        cy={point.y}
                        r={3}
                        fill="#ff0f0f"
                        onMouseEnter={() => setHover(point)}
                        onMouseLeave={() => setHover(null)}
                    />
                ))}
            </svg>
        </div>
    );
});

export const Tab2 = ({
    files,
    fileList,
    setFileList,
    isEditingFiles,
    handleRemoveFile,
    setUploadStatus,
    id,
}) => {
    const [pulseValue, setPulseValue] = useState('');
    const [pulseValues, setPulseValues] = useState([]);

    const openFile = (filePath) => {
        window.open(`https://volmed-backend.onrender.com${filePath}`, '_blank');
    };

    const uploadProps = {
        name: 'file',
        multiple: true,
        fileList,
        action: `https://volmed-backend.onrender.com/api/patients/${id || 'temp'}/upload`,
        headers: {
            'X-Requested-With': null,
        },
        withCredentials: false,
        onChange(info) {
            setFileList([...info.fileList])
            const { status } = info.file
            if (status !== 'uploading') {
                setFileList(info.fileList)
            }
            if (status === 'done' || status === 'error') {
                setUploadStatus({
                    status,
                    fileName: info.file.name
                });
            } else if (status === 'removed') {

            }
        },
        onDrop(e) {
            console.log('Dropped files', e.dataTransfer.files);
        },
        onRemove: handleRemoveFile,
        showUploadList: {
            extra: ({ size = 0 }) => (
                <span style={{ marginLeft: '5px', color: '#cccccc' }}>({(size / 1024 / 1024).toFixed(2)}MB)</span>
            ),
            showPreventIcon: true,
            showRemoveIcon: true,
            removeIcon: (
                <DeleteOutlined
                    onClick={e => console.log('Удаление файла', e)}
                />
            )
        }
    }

    useEffect(() => {
        const fetchPulseData = async () => {
            try {
                const response = await axios.get(`https://volmed-backend.onrender.com/api/patients/${id}/pulse`);
                const values = response.data.map(item => ({
                    val: item.value,
                    created_at: item.timestamp,
                }));
                setPulseValues(values);
            } catch (error) {
                console.error('Error fetching pulse data:', error);
            }
        };

        if (id) {
            fetchPulseData();
        }
    }, [id]);

    const handlePulseKeyPress = async (e) => {
        if (e.key === 'Enter' && pulseValue.trim() !== '') {
            const num = Number(pulseValue);
            if (!isNaN(num)) {
                try {
                    await axios.post(`https://volmed-backend.onrender.com/api/patients/${id}/pulse`, {
                        pulseValue: num
                    });

                    const newEntry = {
                        val: num,
                        created_at: new Date().toISOString()
                    };

                    // Update local state
                    setPulseValues([...pulseValues, newEntry]);
                    setPulseValue('');
                } catch (error) {
                    console.error('Error saving pulse:', error);
                }
            }
        }
    };

    const items = [
        {
            key: '1',
            label: 'ЧСС',
            children: (
                <>
                    <div className={styles.graphContainer}>
                        <div style={{ flexGrow: 1, maxWidth: '500px', minWidth: '120px' }}>
                            <Graph data={pulseValues} />
                        </div>
                        <input
                            type="number"
                            value={pulseValue}
                            onChange={(e) => setPulseValue(e.target.value)}
                            onKeyDown={handlePulseKeyPress}
                            placeholder="ЧСС"
                            style={{ width: '80px', padding: '5px', fontSize: '1rem' }}
                        />
                    </div>
                    <div style={{ marginTop: '20px' }}>
                        <h4>История изменений ЧСС</h4>
                        <table className={styles.itemsTable}>
                            <thead>
                                <tr style={{ backgroundColor: '#f0f0f0', color: 'black' }}>
                                    <th style={{ padding: '8px', border: '1px solid #ddd' }}>Дата</th>
                                    <th style={{ padding: '8px', border: '1px solid #ddd' }}>ЧСС</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pulseValues
                                    .slice()
                                    .reverse()
                                    .map((item, index) => (
                                        <tr key={index}>
                                            <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                                                {new Date(item.created_at).toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}
                                            </td>
                                            <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.val}</td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </>
            ),
            showArrow: false
        },
    ]

    return (
        <div className={styles.info}>
            <div className={styles.bg}>
                <Collapse items={items} headerBg={'#ffffff'} className={styles.items} />
                <div className={styles.fileSection}>
                    <h3>Документы</h3>
                    <div className={styles.fileList}>
                        {files.length === 0 && !isEditingFiles && (
                            <p style={{ cursor: 'default' }}>Нет загруженных документов</p>
                        )}
                        {!isEditingFiles && (
                            <ul style={{ paddingLeft: 10 }}>
                                {files.map((file, index) => (
                                    <li key={index} className={styles.fileItem}>
                                        <span onClick={() => openFile(file.path)}>
                                            {file.originalname || file.filename}
                                        </span>
                                        <span className={styles.fileSize}>
                                            {' '}{(file.size / 1024).toFixed(2)} KB
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                        {isEditingFiles && (
                            <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                <Form.Item>
                                    <Dragger {...uploadProps} >
                                        <p className="ant-upload-drag-icon">
                                            <UploadOutlined />
                                        </p>
                                        <p className="ant-upload-text">Нажмите или перетащите файлы в эту область</p>

                                    </Dragger>
                                </Form.Item>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}