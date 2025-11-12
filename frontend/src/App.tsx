import React, { useState } from 'react';
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

  const handleCommand = (command: string) => {
    const newHistory = [...history, `> ${command}`];
    setHistory(newHistory);

    // For now, just echo the command and add a placeholder response
    let response = '';
    if (command.toLowerCase() === 'help') {
      response = `Available commands:
  predict <TICKER> <TIME_PERIOD> (e.g., predict GBPUSD 24h)
  data <TICKER> <PERIOD> (e.g., data AAPL 1y)
  clear (clears the terminal output)`;
    } else if (command.toLowerCase().startsWith('predict')) {
      response = `Processing prediction for: ${command.substring(8)}... (Placeholder)`;
    } else if (command.toLowerCase().startsWith('data')) {
      response = `Fetching data for: ${command.substring(5)}... (Placeholder)`;
    } else if (command.toLowerCase() === 'clear') {
      setHistory([]);
      setOutput([]);
      return;
    } else {
      response = `Unknown command: ${command}`;
    }

    setOutput((prevOutput) => [...prevOutput, response]);
  };

  return (
    <>
      <GlobalStyle />
      <TerminalContainer>
        <OutputContainer>
          <p>FX-TERMINAL v1.0.0</p>
          <p>&gt; Welcome to FX-Terminal. Loading data...</p>
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
