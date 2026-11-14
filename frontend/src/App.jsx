import { useState } from 'react'
import logo from './assets/logo.png'
import logo4 from './assets/logo4.png'
import './App.css'
import Registrar from './componentes/register'
import Login from './componentes/login'

function App() {
  const [currentView, setCurrentView] = useState('home')
  const [searchType, setSearchType] = useState('card')
  const [searchQuery, setSearchQuery] = useState('')

  const home=() => {
    setSearchQuery('')
    setSearchType('card')
  }

  return (
    <>
      <div className='app-container'>

        {/*Barra de navegacion*/}
        <nav className='navbar'>
          <div className='pos-logo'>
            <img src={logo} className="nav-logo" />
          </div>
          <div className='pos-boton'>
            <button className="nav-boton" onClick={() => setCurrentView('login')}>Sign in</button>
            <button className="nav-boton" onClick={() => setCurrentView('register')}>Register</button>
          </div>
        </nav>

        {/*Primera vista de la pagina (sin login)*/}
        {currentView === 'home' &&(
          <main className='main-content'>
            <img src={logo4} alt='Logo Principal' className='main-logo'/>
            <div className='search-content'>
              <input
              type='text'
              className='search-bar'
              placeholder={`buscar por ${searchType}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className='search-filters'>
                <button className={`filter-btn ${searchType === 'deck' ? 'active' : ''}`} onClick={() => setSearchType('deck')}>Deck</button>
                <button className={`filter-btn ${searchType === 'card' ? 'active' : ''}`} onClick={() => setSearchType('card')}>Card</button>
                <button className={`filter-btn ${searchType === 'advance' ? 'active' : ''}`} onClick={() => setSearchType('advance')}>Advance</button>
              </div>
            </div>
          </main>
        )}

        {/*Segunda vista de la pagina (registro)*/}
        {currentView === 'register' && <Registrar/>}

        {/*Tercera vista de la pagina (login)*/}
        {currentView === 'login' && <Login/>}

        {/*Footer*/}
        <footer className='footer'>
          <div>
            <p><strong>Proyecto Final - Desarrollo de aplicacion web | Universidad Autonoma de Chile</strong></p>
            <p>Desarrollada por Fabian Rojas &copy; 2026</p>
            <p>Los datos e imagenes son proporcionados por la API REST de scryfall</p>
            <p><a href="https://scryfall.com/" target="_blank" rel="noreferrer"></a></p>
          </div>
        </footer>
      </div>
    </>
  )
}

export default App

/*

      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>Get started</h1>
          <p>
            Edit <code>src/App.jsx</code> and save to test <code>HMR</code>
          </p>
        </div>
        <button
          type="button"
          className="counter"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>Documentation</h2>
          <p>Your questions, answered</p>
          <ul>
            <li>
              <a href="https://vite.dev/" target="_blank">
                <img className="logo" src={viteLogo} alt="" />
                Explore Vite
              </a>
            </li>
            <li>
              <a href="https://react.dev/" target="_blank">
                <img className="button-icon" src={reactLogo} alt="" />
                Learn more
              </a>
            </li>
          </ul>
        </div>


        <div id="social">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2>Connect with us</h2>
          <p>Join the Vite community</p>
          <ul>
            <li>
              <a href="https://github.com/vitejs/vite" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#github-icon"></use>
                </svg>
                GitHub
              </a>
            </li>
            <li>
              <a href="https://chat.vite.dev/" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#discord-icon"></use>
                </svg>
                Discord
              </a>
            </li>
            <li>
              <a href="https://x.com/vite_js" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#x-icon"></use>
                </svg>
                X.com
              </a>
            </li>
            <li>
              <a href="https://bsky.app/profile/vite.dev" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#bluesky-icon"></use>
                </svg>
                Bluesky
              </a>
            </li>
          </ul>
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>

*/