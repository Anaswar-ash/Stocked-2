import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styled from 'styled-components';

const ChartWrapper = styled.div`
  height: 100%;
  width: 100%;
`;

interface ChartProps {
  data: any[];
}

const Chart: React.FC<ChartProps> = ({ data }) => {
  return (
    <ChartWrapper>
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="name" stroke="#00ff00" />
          <YAxis stroke="#00ff00" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0a0a0a',
              borderColor: '#00ff00',
            }}
          />
          <Legend wrapperStyle={{ color: '#00ff00' }} />
          <Line type="monotone" dataKey="value" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};

export default Chart;
