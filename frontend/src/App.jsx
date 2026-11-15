import './App.css'
import Registrar from './componentes/register'
import Login from './componentes/login'
import Home from './componentes/home'
import Principal from './componentes/principal'
import { useEffect, useState } from 'react'

function App() {

  const [currentView, setCurrentView] = useState('home')
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() =>{
    const token = localStorage.getItem('token')
    if (token) {
      setIsAuthenticated(true)
      setCurrentView('principal')
    }
  }, [])

  const Logout = () => {
    localStorage.removeItem('token')
    setIsAuthenticated(false)
    setCurrentView('home')
  }

  return (
    <>
      <div className='app-container'>

        {/*Primera vusta de la pagina (publica)*/}
        {currentView === 'home' && !isAuthenticated && (
          <Home setCurrentView={setCurrentView} />
        )}

        {/*Segunda vista de la pagina (registro)*/}
        {currentView === 'register' && !isAuthenticated && <Registrar/>}

        {/*Tercera vista de la pagina (login)*/}
        {currentView === 'login' && !isAuthenticated && (
          <Login
            setIsAuthenticated={setIsAuthenticated}
            setCurrentView={setCurrentView}
          />
        )}

        {/*Cuarta vista de la pagina (logeado)*/}
        {currentView === 'principal' && isAuthenticated && (
          <Principal Logout={Logout} />
        )}

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