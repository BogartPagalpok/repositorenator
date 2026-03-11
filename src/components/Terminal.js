import React, { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import 'xterm/css/xterm.css';
import { FitAddon } from 'xterm-addon-fit';
import { useParams } from 'react-router-dom';

const TerminalComponent = ({ onCommandRun }) => {
  const terminalRef = useRef(null);
  const xterm = useRef(null);
  const fitAddon = useRef(new FitAddon());
  const { projectName } = useParams();

  useEffect(() => {
    xterm.current = new Terminal({
      cursorBlink: true,
      rows: 20,
      cols: 80,
    });

    xterm.current.loadAddon(fitAddon.current);
    xterm.current.open(terminalRef.current);
    fitAddon.current.fit();

    xterm.current.onData(data => handleData(data));

    window.addEventListener('resize', () => {
      fitAddon.current.fit();
    });

    return () => {
      window.removeEventListener('resize', fitAddon.current.fit);
      xterm.current.dispose();
    };
  }, []);

  const handleData = (data) => {
    const command = data.trim();
    if (command) {
      onCommandRun(command)
        .then(output => {
          xterm.current.write(output);
        })
        .catch(error => {
          xterm.current.write(`\r\nError: ${error}\r\n`);
        });
    }
    xterm.current.write('\r\n$ ');
  };

  return (
    <div id="terminal-container" style={{ width: '100%', height: '300px', border: '1px solid #ccc', background: '#000' }}>
      <div ref={terminalRef} />
    </div>
  );
};

const TerminalWrapper = ({ repoId }) => {
  const runCommand = async (command) => {
    // Simulate command execution.
    const messages = {
      'npm install': 'Installing packages...\r\nnode_modules installed.\r\n',
      'npm run build': 'Building project...\r\nBuild complete.\r\n',
    };
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(messages[command] || 'Command not recognized.\r\n');
      }, 1000);
    });
  };

  return <TerminalComponent onCommandRun={runCommand} />;
};

export default TerminalWrapper;