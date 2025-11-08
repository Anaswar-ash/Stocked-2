import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Chart from './Chart';
import { connect, disconnect } from '../websocket';

const DashboardWrapper = styled.div`
  display: flex;
  height: 100vh;
`;

const Sidebar = styled.div`
  width: 250px;
  background-color: #0a0a0a;
  border-right: 1px solid #00ff00;
  padding: 20px;
`;

const MainContent = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #00ff00;
  text-transform: uppercase;
`;

const ChartArea = styled.div`
  height: 400px;
  background-color: #0a0a0a;
  border: 1px solid #00ff00;
`;

const Dashboard: React.FC = () => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    connect((newData) => {
      setData((prevData) => [...prevData, newData]);
    });

    return () => {
      disconnect();
    };
  }, []);

  return (
    <DashboardWrapper>
      <Sidebar>
        <h2>Stocked-2</h2>
        <nav>
          <ul>
            <li>Dashboard</li>
            <li>Prediction</li>
          </ul>
        </nav>
      </Sidebar>
      <MainContent>
        <Header>
          <Title>Dashboard</Title>
        </Header>
        <ChartArea>
          <Chart data={data} />
        </ChartArea>
      </MainContent>
    </DashboardWrapper>
  );
};

export default Dashboard;
