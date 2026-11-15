import { useState } from 'react'
import logo from '../assets/logo.png'
import logo4 from '../assets/logo4.png'

export default function Home({ setCurrentView }) {
    const [searchType, setSearchType] = useState('card')
    const [searchQuery, setSearchQuery] = useState('')

    const home=() => {
        setSearchQuery('')
        setSearchType('card')
    }

    return (
        <div>
            <nav className='navbar'>
                <div className='pos-logo'>
                    <img src={logo} className="nav-logo"/>
                </div>
                <div className='pos-boton'>
                    <button className="nav-boton" onClick={() => setCurrentView('login')}>Sign in</button>
                    <button className="nav-boton" onClick={() => setCurrentView('register')}>Register</button>
                </div>
            </nav>

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
        </div>            
    )
}