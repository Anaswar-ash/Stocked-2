import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { GlobalStyle } from './styles/GlobalStyle';
import CommandLine from './components/CommandLine';
import AsciiChart from './components/AsciiChart';

const TerminalContainer = styled.div`
  background-color: #000000;
  color: #ffffff;
  font-family: 'Roboto Mono', monospace;
  font-size: 14px;
  padding: 20px;
  border: 1px solid #ffffff;
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
  width: 80%;
  max-width: 1000px;
  min-height: 600px;
  box-sizing: border-box;
  overflow: hidden; /* Hide the main scrollbar */
  display: flex;
  flex-direction: column;
`;

const OutputContainer = styled.div`
  flex-grow: 1;
  margin-bottom: 10px;
  overflow-y: auto; /* Add scrollbar to this container */
  white-space: pre-wrap;
`;

interface Line {
  text?: string;
  type: 'command' | 'response' | 'chart';
  data?: number[];
}

const App: React.FC = () => {
  const [lines, setLines] = useState<Line[]>([
    { type: 'response', text: 'Stocked-Terminal v1.0.0' },
    { type: 'response', text: '> Welcome to Stocked-Terminal. Loading data...' },
    { type: 'response', text: "> Type 'help' for commands." },
  ]);
  const outputEndRef = useRef<HTMLDivElement>(null);

  // Effect to scroll to the bottom of the output
  useEffect(() => {
    outputEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const handleCommand = async (command: string) => {
    const newLines: Line[] = [...lines, { type: 'command', text: `> ${command}` }];

    const parts = command.trim().split(' ');
    const cmd = parts[0].toLowerCase();
    let response = '';

    switch (cmd) {
      case 'help':
        response = `Available commands:
  predict <TICKER> <MODEL> <STEPS>
  data <TICKER> <PERIOD>
  info
  clear

Available Models:
  lstm, linear_regression, arima

Example Currency Pairs:
  GBPUSD, EURUSD, USDJPY, GBPINR

Example Stocks:
  AAPL, GOOGL, MSFT`;
        newLines.push({ type: 'response', text: response });
        setLines(newLines);
        break;
      case 'info':
        response = `Stocked-Terminal v1.0.0
Created by Anaswar Ash
This is a Bloomberg-style, minimalist, terminal-font web application for real-time currency and stock exchange data.`;
        newLines.push({ type: 'response', text: response });
        setLines(newLines);
        break;
      case 'predict':
        if (parts.length < 4) {
          response = 'Usage: predict <TICKER> <MODEL> <STEPS>';
        } else {
          const predictTicker = parts[1].toUpperCase();
          const modelName = parts[2].toLowerCase();
          const steps = parseInt(parts[3]);

          if (isNaN(steps)) {
            response = 'Error: STEPS must be a number.';
          } else {
            setLines([...newLines, { type: 'response', text: `Processing prediction for ${predictTicker} using ${modelName} for ${steps} steps...` }]);
            try {
              const res = await fetch(`/api/predict/${predictTicker}?model_name=${modelName}&steps=${steps}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
              });
              const data = await res.json();
              if (res.ok) {
                const prediction = data.prediction;
                let table = `Prediction for ${predictTicker} (next ${steps} days):\n`;
                prediction.forEach((price: number, index: number) => {
                  table += `Day ${index + 1}: ${price.toFixed(2)}\n`;
                });
                response = table;
                setLines(prevLines => [...prevLines, { type: 'response', text: response }, { type: 'chart', data: prediction }]);
                return;
              } else {
                response = `Error predicting for ${predictTicker}: ${JSON.stringify(data.detail) || res.statusText}`;
              }
            } catch (error) {
              response = `Network error: ${error instanceof Error ? error.message : String(error)}`;
            }
          }
        }
        setLines(prevLines => [...prevLines, { type: 'response', text: response }]);
        break;
      case 'data':
        if (parts.length < 2) {
          response = 'Usage: data <TICKER> [PERIOD]';
        } else {
          const dataTicker = parts[1].toUpperCase();
          let period = parts.length > 2 ? parts[2].toLowerCase() : '1y'; // Default period to 1y
          // Append 'd' if period is a number
          if (!isNaN(parseInt(period))) {
            period = `${period}d`;
          }
          setLines([...newLines, { type: 'response', text: `Fetching data for ${dataTicker} for period ${period}...` }]);
          try {
            const res = await fetch(`/api/data/${dataTicker}?period=${period}`);
            const data = await res.json();
            if (res.ok) {
              const parsedData = JSON.parse(data);
              let table = `Historical data for ${dataTicker}:\n`;
              table += "Date\t\tOpen\tHigh\tLow\tClose\tVolume\n";
              parsedData.index.forEach((timestamp: number, i: number) => {
                const date = new Date(timestamp).toISOString().split('T')[0];
                table += `${date}\t${parsedData.data[i][0].toFixed(2)}\t${parsedData.data[i][1].toFixed(2)}\t${parsedData.data[i][2].toFixed(2)}\t${parsedData.data[i][3].toFixed(2)}\t${parsedData.data[i][4]}\n`;
              });
              response = table;
              const closePrices = parsedData.data.map((row: number[]) => row[3]);
              setLines(prevLines => [...prevLines, { type: 'response', text: response }, { type: 'chart', data: closePrices }]);
              return;
            } else {
              response = `Error fetching data for ${dataTicker}: ${JSON.stringify(data.detail) || res.statusText}`;
            }
          } catch (error) {
            response = `Network error: ${error instanceof Error ? error.message : String(error)}`;
          }
        }
        setLines(prevLines => [...prevLines, { type: 'response', text: response }]);
        break;
      case 'clear':
        setLines([]);
        return;
      default:
        response = `Unknown command: ${command}`;
        newLines.push({ type: 'response', text: response });
        setLines(newLines);
    }
  };

  return (
    <>
      <GlobalStyle />
      <TerminalContainer>
        <OutputContainer>
          {lines.map((line, index) => {
            if (line.type === 'chart' && line.data) {
              return <AsciiChart key={index} data={line.data} width={80} height={15} />;
            }
            return <p key={index}>{line.text}</p>;
          })}
          <div ref={outputEndRef} />
        </OutputContainer>
        <CommandLine onCommand={handleCommand} />
      </TerminalContainer>
    </>
  );
}

export default App;
