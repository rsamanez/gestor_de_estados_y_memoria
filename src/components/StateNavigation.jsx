import React from 'react';
import './StateNavigation.css';

const StateNavigation = ({ currentState, onStateChange }) => {
  const states = [
    { id: 1, name: 'Estado 1', color: '#ff6b6b', icon: '🔴' },
    { id: 2, name: 'Estado 2', color: '#4ecdc4', icon: '🟢' },
    { id: 3, name: 'Estado 3', color: '#45b7d1', icon: '🔵' },
    { id: 4, name: 'Estado 4', color: '#f39c12', icon: '🟡' }
  ];

  return (
    <div className="state-navigation">
      <h2>Navegación de Estados</h2>
      <div className="state-buttons">
        {states.map(state => (
          <button
            key={state.id}
            className={`state-button ${currentState === state.id ? 'active' : ''}`}
            onClick={() => onStateChange(state.id)}
            style={{
              '--state-color': state.color,
              '--state-color-light': state.color + '20'
            }}
          >
            <span className="state-icon">{state.icon}</span>
            <span className="state-text">{state.name}</span>
            {currentState === state.id && (
              <span className="current-indicator">✓</span>
            )}
          </button>
        ))}
      </div>
      <div className="current-state-info">
        <p>Estado actual: <strong>{states.find(s => s.id === currentState)?.name}</strong></p>
      </div>
    </div>
  );
};

export default StateNavigation;
