import React, { useState } from 'react';
import styled from 'styled-components';

interface CommandLineProps {
  onCommand: (command: string) => void;
}

const CommandLineContainer = styled.div`
  display: flex;
  align-items: center;
  margin-top: 10px;
`;

const Prompt = styled.span`
  color: #ffffff; /* Snow White */
  margin-right: 5px;
`;

const Input = styled.input`
  background-color: transparent;
  border: none;
  color: #ffffff; /* Snow White */
  font-family: 'Roboto Mono', monospace;
  font-size: 14px;
  flex-grow: 1;
  outline: none; /* Remove focus outline */
`;

const CommandLine: React.FC<CommandLineProps> = ({ onCommand }) => {
  const [command, setCommand] = useState('');

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onCommand(command);
      setCommand(''); // Clear the input after command is sent
    }
  };

  return (
    <CommandLineContainer>
      <Prompt>&gt;</Prompt>
      <Input
        type="text"
        value={command}
        onChange={(e) => setCommand(e.target.value)}
        onKeyPress={handleKeyPress}
        autoFocus // Automatically focus the input field
      />
    </CommandLineContainer>
  );
};

export default CommandLine;
