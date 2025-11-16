import React from 'react';

interface AsciiChartProps {
  data: number[];
  width: number;
  height: number;
}

const AsciiChart: React.FC<AsciiChartProps> = ({ data, width, height }) => {
  if (!data || data.length === 0) {
    return null;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;

  const chart = Array.from({ length: height }, () => Array(width).fill(' '));

  for (let i = 0; i < width; i++) {
    const dataIndex = Math.floor((i / (width - 1)) * (data.length - 1));
    const value = data[dataIndex];
    const y = Math.floor(((value - min) / range) * (height - 1));
    chart[height - 1 - y][i] = '*';
  }

  return (
    <pre>
      {chart.map((row, i) => row.join('')).join('\n')}
    </pre>
  );
};

export default AsciiChart;
