import React from 'react';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

function App() {
  const [health, setHealth] = React.useState(null);

  React.useEffect(() => {
    fetch(`${API_URL}/health`)
      .then(res => res.json())
      .then(data => setHealth(data))
      .catch(err => setHealth({ error: err.message }));
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>КупиПодариДай</h1>
        <p>Сервис для покупки и дарения подарков</p>
        {health && (
          <div>
            <h2>Статус бэкенда:</h2>
            <pre>{JSON.stringify(health, null, 2)}</pre>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
