import React from 'react';
import logo from './logo.svg';
import './App.css';
import Login from './components/Login/Login';
import Window from './components/Window/Window';

function App() {
	return (
		<div className="App">
			<Login></Login>
			{/*<header className="App-header">
				<img src={logo} className="App-logo" alt="logo" />
				<p>
					Edit <code>src/App.tsx</code> and save.
				</p>
				<a
					className="App-link"
					href="https://reactjs.org"
					target="_blank"
					rel="noopener noreferrer"
				>
					Learn React
				</a>
			</header> */}
		</div>
	);
}

export default App;
