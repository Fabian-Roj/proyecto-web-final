import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import logo from '../assets/logo.png'
import logo4 from '../assets/logo4.png'

const CARTA_DORSO = 'https://cards.scryfall.io/normal/front/0/0/0000579f-7b35-4ed3-b44c-db2a538066fe.jpg'

export default function Home({ setCurrentView }) {
  const [modoBusqueda, setModoBusqueda] = useState('card') // 'deck' | 'card' | 'advance'
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(false)
  const [errorBusqueda, setErrorBusqueda] = useState('')

  // Estados del autocompletado (solo texto)
  const [sugerencias, setSugerencias] = useState([])
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false)
  const [indiceActivo, setIndiceActivo] = useState(-1)
  const [bloquearAuto, setBloquearAuto] = useState(false)
  const contenedorBusquedaRef = useRef(null)

  // Resultados en modo Card / Advance
  const [resultadosCartas, setResultadosCartas] = useState([])

  // Resultados en modo Deck y vista de solo lectura
  const [resultadosMazos, setResultadosMazos] = useState([])
  const [mazoSeleccionado, setMazoSeleccionado] = useState(null)
  const [cartasMazoPublico, setCartasMazoPublico] = useState([])
  const [cartaHoverImg, setCartaHoverImg] = useState(CARTA_DORSO)

  // Cierra el desplegable si haces clic fuera de la barra
  useEffect(() => {
    const manejarClicFuera = (e) => {
      if (contenedorBusquedaRef.current && !contenedorBusquedaRef.current.contains(e.target)) {
        setMostrarSugerencias(false)
      }
    }
    document.addEventListener('mousedown', manejarClicFuera)
    return () => document.removeEventListener('mousedown', manejarClicFuera)
  }, [])

  const limpiarResultados = () => {
    setResultadosCartas([])
    setResultadosMazos([])
    setMazoSeleccionado(null)
    setCartasMazoPublico([])
    setErrorBusqueda('')
  }

  const cambiarModo = (nuevoModo) => {
    setModoBusqueda(nuevoModo)
    setSugerencias([])
    setMostrarSugerencias(false)
    setIndiceActivo(-1)
    limpiarResultados()
  }

  const manejarCambioBusqueda = (e) => {
    const valor = e.target.value
    setBusqueda(valor)
    setBloquearAuto(false)
    setIndiceActivo(-1)
    limpiarResultados()
  }

/* Autocompletado */

  useEffect(() => {
    const query = busqueda.trim()
    if (bloquearAuto || query.length < 2) {
      setSugerencias([])
      setMostrarSugerencias(false)
      return
    }

    const timer = setTimeout(async () => {
      try {
        if (modoBusqueda === 'deck') {
          const res = await axios.get(
            `http://localhost:8000/api/mazos-publicos/?comandante=${encodeURIComponent(query)}`
          )
          const nombresUnicos = []
          const vistos = new Set()
          for (const mazo of res.data) {
            const nombreCmd = (mazo.comandante || '').trim()
            if (nombreCmd && !vistos.has(nombreCmd.toLowerCase())) {
              vistos.add(nombreCmd.toLowerCase())
              nombresUnicos.push(nombreCmd)
            }
          }
          setSugerencias(nombresUnicos.slice(0, 7))
          setMostrarSugerencias(nombresUnicos.length > 0)
        } else if (modoBusqueda === 'card') {
          const res = await axios.get(
            `https://api.scryfall.com/cards/autocomplete?q=${encodeURIComponent(query)}`
          )
          const nombres = (res.data.data || []).slice(0, 7)
          setSugerencias(nombres)
          setMostrarSugerencias(nombres.length > 0)
        } else {
          const res = await axios.get(
            `https://api.scryfall.com/cards/search?q=${encodeURIComponent(query)}`
          )
          const nombres = (res.data.data || []).slice(0, 7).map((c) => c.name)
          setSugerencias(nombres)
          setMostrarSugerencias(nombres.length > 0)
        }
      } catch {
        setSugerencias([])
        setMostrarSugerencias(false)
      }
    }, 200)

    return () => clearTimeout(timer)
  }, [busqueda, modoBusqueda, bloquearAuto])

  // Ejecuta la búsqueda completa al elegir una sugerencia o presionar Enter
  const ejecutarBusquedaCompleta = async (texto, modo) => {
    const query = texto.trim()
    if (!query) {
      limpiarResultados()
      return
    }

    setMostrarSugerencias(false)
    setCargando(true)
    setErrorBusqueda('')

    try {
      if (modo === 'deck') {
        const res = await axios.get(
          `http://localhost:8000/api/mazos-publicos/?comandante=${encodeURIComponent(query)}`
        )
        setResultadosMazos(res.data)
        if (res.data.length === 0) {
          setErrorBusqueda('No se encontraron mazos con ese comandante.')
        }
      } else {
        const res = await axios.get(
          `https://api.scryfall.com/cards/search?q=${encodeURIComponent(query)}`
        )
        setResultadosCartas((res.data.data || []).slice(0, 20))
      }
    } catch (error) {
      if (modo !== 'deck' && error.response && error.response.status === 404) {
        setErrorBusqueda('No se encontraron cartas con esa búsqueda.')
      } else {
        setErrorBusqueda('Error al realizar la búsqueda.')
      }
    } finally {
      setCargando(false)
    }
  }

  const seleccionarSugerencia = (nombreElegido) => {
    setBloquearAuto(true)
    setBusqueda(nombreElegido)
    setMostrarSugerencias(false)
    setIndiceActivo(-1)
    ejecutarBusquedaCompleta(nombreElegido, modoBusqueda)
  }

  const manejarTeclado = (e) => {
    if (!mostrarSugerencias || sugerencias.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setIndiceActivo((prev) => (prev < sugerencias.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setIndiceActivo((prev) => (prev > 0 ? prev - 1 : sugerencias.length - 1))
    } else if (e.key === 'Enter' && indiceActivo >= 0) {
      e.preventDefault()
      seleccionarSugerencia(sugerencias[indiceActivo])
    } else if (e.key === 'Escape') {
      setMostrarSugerencias(false)
      setIndiceActivo(-1)
    }
  }

  const manejarSubmit = (e) => {
    e.preventDefault()
    setBloquearAuto(true)
    ejecutarBusquedaCompleta(busqueda, modoBusqueda)
  }

  const resaltarCoincidencia = (nombre, consulta) => {
    const limpio = consulta.trim()
    if (!limpio) return nombre
    const escapado = limpio.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const partes = nombre.split(new RegExp(`(${escapado})`, 'gi'))
    return partes.map((parte, i) =>
      parte.toLowerCase() === limpio.toLowerCase() ? (
        <strong key={i}>{parte}</strong>
      ) : (
        <span key={i}>{parte}</span>
      )
    )
  }

  const verListaMazoPublico = async (mazo) => {
    setMazoSeleccionado(mazo)
    setCartaHoverImg(mazo.imagen_comandante || CARTA_DORSO)
    setCargando(true)
    try {
      const res = await axios.get(
        `http://localhost:8000/api/cartas-mazo-publico/?mazo=${mazo.id}`
      )
      setCartasMazoPublico(res.data)
    } catch {
      setCartasMazoPublico([])
      setErrorBusqueda('No se pudo cargar la lista de cartas del mazo.')
    } finally {
      setCargando(false)
    }
  }

  const obtenerPlaceholder = () => {
    if (modoBusqueda === 'deck') return 'buscar por comandante del deck...'
    if (modoBusqueda === 'advance') return 'busqueda avanzada (ej. t:dragon c:red)...'
    return 'buscar por card'
  }

  return (
    <div>
      <nav className='navbar'>
        <div className='pos-logo'>
          <img src={logo} alt='Logo' className='nav-logo' />
        </div>
        <div className='pos-boton'>
          <button
            type='button'
            className='nav-boton'
            onClick={() => setCurrentView('login')}
          >
            Sign in
          </button>
          <button
            type='button'
            className='nav-boton'
            onClick={() => setCurrentView('register')}
          >
            Sign up
          </button>
        </div>
      </nav>

      <main className='main-content'>
        <img src={logo4} alt='The Dragon Grimoire' className='main-logo' />


        <div className='search-bar-wrapper' ref={contenedorBusquedaRef}>
          <form onSubmit={manejarSubmit}>
            <input
              type='text'
              className='search-bar'
              style={{ width: '100%' }}
              placeholder={obtenerPlaceholder()}
              value={busqueda}
              onChange={manejarCambioBusqueda}
              onKeyDown={manejarTeclado}
              onFocus={() => {
                if (sugerencias.length > 0 && !bloquearAuto) setMostrarSugerencias(true)
              }}
              autoComplete='off'
            />
          </form>

          {mostrarSugerencias && sugerencias.length > 0 && (
            <ul className='autocomplete-dropdown'>
              {sugerencias.map((nombre, idx) => (
                <li
                  key={`${nombre}-${idx}`}
                  className={`autocomplete-item ${idx === indiceActivo ? 'active' : ''}`}
                  onMouseEnter={() => setIndiceActivo(idx)}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    seleccionarSugerencia(nombre)
                  }}
                >
                  <span className='autocomplete-text'>
                    {resaltarCoincidencia(nombre, busqueda)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className='search-filters'>
          <button
            type='button'
            className={`filter-btn ${modoBusqueda === 'deck' ? 'active' : ''}`}
            onClick={() => cambiarModo('deck')}
          >
            Deck
          </button>
          <button
            type='button'
            className={`filter-btn ${modoBusqueda === 'card' ? 'active' : ''}`}
            onClick={() => cambiarModo('card')}
          >
            Card
          </button>
          <button
            type='button'
            className={`filter-btn ${modoBusqueda === 'advance' ? 'active' : ''}`}
            onClick={() => cambiarModo('advance')}
          >
            Advance
          </button>
        </div>

        {cargando && (
          <p style={{ color: 'var(--accent-gold)', marginTop: '1.5rem' }}>Buscando...</p>
        )}
        {errorBusqueda && !cargando && (
          <p className='mensaje-error' style={{ marginTop: '1.5rem' }}>{errorBusqueda}</p>
        )}


        {modoBusqueda !== 'deck' && resultadosCartas.length > 0 && (
          <section className='home-resultados-wrapper'>
            <div className='home-cartas-grid'>
              {resultadosCartas.map((carta) => {
                const imgUrl =
                  carta.image_uris?.normal ||
                  carta.card_faces?.[0]?.image_uris?.normal ||
                  CARTA_DORSO
                return (
                  <div key={carta.id} className='home-carta-card'>
                    <img src={imgUrl} alt={carta.name} />
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {modoBusqueda === 'deck' && !mazoSeleccionado && resultadosMazos.length > 0 && (
          <section className='home-resultados-wrapper'>
            <div className='p4-grid'>
              {resultadosMazos.map((mazo) => (
                <div
                  key={mazo.id}
                  className='p4-card'
                  onClick={() => verListaMazoPublico(mazo)}
                >
                  <h3>{mazo.nombre}</h3>
                  <img
                    src={mazo.imagen_comandante || CARTA_DORSO}
                    alt={mazo.nombre}
                  />
                  <p style={{ color: 'var(--accent-gold)', textAlign: 'center', marginTop: '0.5rem' }}>
                    Comandante: {mazo.comandante || 'Sin comandante'}
                  </p>
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.9rem' }}>
                    Creado por: {mazo.creador}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {modoBusqueda === 'deck' && mazoSeleccionado && (
          <section className='home-resultados-wrapper'>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ color: 'var(--accent-gold)', textAlign: 'left', marginBottom: '0.4rem' }}>
                  {mazoSeleccionado.nombre}
                </h2>
                <p style={{ color: 'var(--text-muted)' }}>
                  Comandante: {mazoSeleccionado.comandante} | Creado por: {mazoSeleccionado.creador}
                </p>
              </div>
              <button
                type='button'
                className='nav-boton'
                onClick={() => {
                  setMazoSeleccionado(null)
                  setCartasMazoPublico([])
                }}
              >
                Volver a mazos
              </button>
            </div>

            <div className='p5-container' style={{ padding: 0, width: '100%', margin: 0 }}>
              <div className='p5-izq'>
                <div className='p5-card-preview'>
                  <img src={cartaHoverImg} alt='Vista previa carta' />
                </div>
              </div>

              <div className='p5-centro'>
                <table className='p5-tabla'>
                  <thead>
                    <tr>
                      <th>Costo de maná</th>
                      <th>Nombre</th>
                      <th>Edición</th>
                      <th>Cantidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartasMazoPublico.map((fila) => (
                      <tr key={fila.id}>
                        <td>{fila.costo_mana}</td>
                        <td
                          className='p5-nombre-hover'
                          onMouseEnter={() => setCartaHoverImg(fila.imagen_final || CARTA_DORSO)}
                        >
                          {fila.nombre}
                        </td>
                        <td>{fila.edicion}</td>
                        <td>{fila.cantidad}</td>
                      </tr>
                    ))}
                    {cartasMazoPublico.length === 0 && (
                      <tr>
                        <td colSpan='4' style={{ color: 'var(--text-muted)', padding: '2rem' }}>
                          Este mazo aún no tiene cartas agregadas.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}