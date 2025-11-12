import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { GlobalStyle } from './styles/GlobalStyle';
import CommandLine from './components/CommandLine'; // Import the CommandLine component

const TerminalContainer = styled.div`
  background-color: #000000; /* Pure Black for the terminal window itself */
  color: #ffffff; /* Snow White text */
  font-family: 'Roboto Mono', monospace;
  font-size: 14px;
  padding: 20px;
  border: 1px solid #ffffff; /* White border to define the terminal window */
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.5); /* Subtle white glow */
  width: 80%;
  max-width: 1000px;
  min-height: 600px;
  box-sizing: border-box;
  overflow: auto;
  display: flex;
  flex-direction: column;
`;

const OutputContainer = styled.div`
  flex-grow: 1;
  margin-bottom: 10px;
  white-space: pre-wrap; /* Preserve whitespace and line breaks */
`;

const App: React.FC = () => {
  const [output, setOutput] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);

  const appendOutput = (newOutput: string) => {
    setOutput((prevOutput) => [...prevOutput, newOutput]);
  };

  const handleCommand = async (command: string) => {
    const newHistory = [...history, `> ${command}`];
    setHistory(newHistory);

    const parts = command.toLowerCase().split(' ');
    const cmd = parts[0];

    let response = '';

    switch (cmd) {
      case 'help':
        response = `Available commands:
  predict <TICKER> <MODEL> <STEPS> (e.g., predict GBPUSD lstm 30)
  data <TICKER> <PERIOD> (e.g., data AAPL 1y)
  clear (clears the terminal output)`;
        break;
      case 'predict':
        if (parts.length < 4) {
          response = 'Usage: predict <TICKER> <MODEL> <STEPS>';
          break;
        }
        const predictTicker = parts[1].toUpperCase();
        const modelName = parts[2];
        const steps = parseInt(parts[3]);

        if (isNaN(steps)) {
          response = 'Error: STEPS must be a number.';
          break;
        }

        appendOutput(`Processing prediction for ${predictTicker} using ${modelName} for ${steps} steps...`);
        try {
          const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
          const res = await fetch(`${backendUrl}/predict/${predictTicker}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ model_name: modelName, steps: steps }),
          });
          const data = await res.json();
          if (res.ok) {
            response = `Prediction for ${predictTicker}: ${JSON.stringify(data.prediction, null, 2)}`;
          } else {
            response = `Error predicting for ${predictTicker}: ${data.detail || res.statusText}`;
          }
        } catch (error) {
          response = `Network error: ${error instanceof Error ? error.message : String(error)}`;
        }
        break;
      case 'data':
        if (parts.length < 3) {
          response = 'Usage: data <TICKER> <PERIOD>';
          break;
        }
        const dataTicker = parts[1].toUpperCase();
        const period = parts[2];

        appendOutput(`Fetching data for ${dataTicker} for period ${period}...`);
        try {
          const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
          const res = await fetch(`${backendUrl}/data/${dataTicker}?period=${period}`);
          const data = await res.json();
          if (res.ok) {
            response = `Historical data for ${dataTicker}:
${JSON.stringify(data, null, 2)}`;
          } else {
            response = `Error fetching data for ${dataTicker}: ${data.detail || res.statusText}`;
          }
        } catch (error) {
          response = `Network error: ${error instanceof Error ? error.message : String(error)}`;
        }
        break;
      case 'clear':
        setHistory([]);
        setOutput([]);
        return;
      default:
        response = `Unknown command: ${command}`;
    }

    appendOutput(response);
  };

  return (
    <>
      <GlobalStyle />
      <TerminalContainer>
        <OutputContainer>
          <p>Stocked-Terminal v1.0.0</p> {/* Changed name here */}
          <p>&gt; Welcome to Stocked-Terminal. Loading data...</p>
          <p>&gt; Type 'help' for commands.</p>
          {history.map((entry, index) => (
            <p key={index}>{entry}</p>
          ))}
          {output.map((entry, index) => (
            <p key={index}>{entry}</p>
          ))}
        </OutputContainer>
        <CommandLine onCommand={handleCommand} />
      </TerminalContainer>
    </>
  );
}

export default App;