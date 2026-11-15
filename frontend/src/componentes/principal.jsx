import { useState, useEffect } from 'react'
import axios from 'axios'
import api from '../api'
import logo from '../assets/logo.png'

const CARTA_DORSO = 'https://cards.scryfall.io/normal/front/0/0/0000579f-7b35-4ed3-b44c-db2a538066fe.jpg'

export default function Principal({ Logout }) {
  // Navegación interna entre Prototipo 4 (lista) y Prototipo 5 (detalle)
  const [itemActivo, setItemActivo] = useState(null) // { tipo: 'mazo' | 'coleccion', data: obj }

  // --- ESTADOS PROTOTIPO 4 ---
  const [mazos, setMazos] = useState([])
  const [colecciones, setColecciones] = useState([])
  const [formTipo, setFormTipo] = useState(null) // 'mazo' | 'coleccion' | null
  const [editandoId, setEditandoId] = useState(null)
  const [nombreForm, setNombreForm] = useState('')
  const [cartaRefForm, setCartaRefForm] = useState('')
  const [errorForm, setErrorForm] = useState('')

  // --- ESTADOS PROTOTIPO 5 ---
  const [cartasLista, setCartasLista] = useState([])
  const [cartaHoverImg, setCartaHoverImg] = useState(CARTA_DORSO)
  const [busquedaCarta, setBusquedaCarta] = useState('')
  const [errorCarta, setErrorCarta] = useState('')
  const [mensajeP5, setMensajeP5] = useState('')
  const [seleccionadas, setSeleccionadas] = useState([]) // IDs de filas marcadas
  const [edicionesDisponibles, setEdicionesDisponibles] = useState([])
  const [edicionElegida, setEdicionElegida] = useState('')
  const [cantidadEditada, setCantidadEditada] = useState(1)

  useEffect(() => {
    cargarMazosYColecciones()
  }, [])

  const cargarMazosYColecciones = async () => {
    try {
      const [resMazos, resCol] = await Promise.all([
        api.get('mazos/'),
        api.get('colecciones/')
      ])
      setMazos(resMazos.data)
      setColecciones(resCol.data)
    } catch (error) {
      if (error.response && error.response.status === 401) {
        Logout()
      }
    }
  }

  const buscarImagenScryfall = async (nombreCarta) => {
    if (!nombreCarta || !nombreCarta.trim()) return CARTA_DORSO
    try {
      const res = await axios.get(
        `https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(nombreCarta.trim())}`
      )
      return (
        res.data.image_uris?.art_crop ||
        res.data.image_uris?.normal ||
        res.data.card_faces?.[0]?.image_uris?.art_crop ||
        CARTA_DORSO
      )
    } catch {
      return CARTA_DORSO
    }
  }

  const formatearFecha = (fechaIso) => {
    if (!fechaIso) return ''
    return new Date(fechaIso).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  // --- ACCIONES PROTOTIPO 4 ---
  const abrirFormulario = (tipo, item = null) => {
    setFormTipo(tipo)
    setErrorForm('')
    if (item) {
      setEditandoId(item.id)
      setNombreForm(item.nombre || '')
      setCartaRefForm((tipo === 'mazo' ? item.comandante : item.carta_portada) || '')
    } else {
      setEditandoId(null)
      setNombreForm('')
      setCartaRefForm('')
    }
  }

  const guardarItemP4 = async (e) => {
    e.preventDefault()
    setErrorForm('')
    try {
      const imgUrl = await buscarImagenScryfall(cartaRefForm)
      if (formTipo === 'mazo') {
        const payload = {
          nombre: nombreForm,
          categoria: '100',
          comandante: cartaRefForm,
          imagen_comandante: imgUrl,
          es_public: true
        }
        if (editandoId) {
          const res = await api.put(`mazos/${editandoId}/`, payload)
          setMazos(mazos.map((m) => (m.id === editandoId ? res.data : m)))
        } else {
          const res = await api.post('mazos/', payload)
          setMazos([res.data, ...mazos])
        }
      } else {
        const payload = {
          nombre: nombreForm,
          carta_portada: cartaRefForm,
          imagen_portada: imgUrl
        }
        if (editandoId) {
          const res = await api.put(`colecciones/${editandoId}/`, payload)
          setColecciones(colecciones.map((c) => (c.id === editandoId ? res.data : c)))
        } else {
          const res = await api.post('colecciones/', payload)
          setColecciones([res.data, ...colecciones])
        }
      }
      setFormTipo(null)
    } catch (error) {
      if (error.response && typeof error.response.data === 'object' && error.response.data !== null) {
        setErrorForm(Object.values(error.response.data).flat().join(' | '))
      } else {
        setErrorForm(`Error al guardar en el servidor (${error.response?.status || 'sin conexión'}).`)
      }
    }
  }

  const eliminarItemP4 = async (e, tipo, id) => {
    e.stopPropagation()
    try {
      const endpoint = tipo === 'mazo' ? `mazos/${id}/` : `colecciones/${id}/`
      await api.delete(endpoint)
      if (tipo === 'mazo') setMazos(mazos.filter((m) => m.id !== id))
      else setColecciones(colecciones.filter((c) => c.id !== id))
    } catch (error) {
      console.error('Error al eliminar:', error)
    }
  }

  // --- TRANSICIÓN A PROTOTIPO 5 ---
  const abrirDetalleP5 = async (tipo, item) => {
    setItemActivo({ tipo, data: item })
    setSeleccionadas([])
    setEdicionesDisponibles([])
    setBusquedaCarta('')
    setErrorCarta('')
    setMensajeP5('')
    setCartaHoverImg(
      (tipo === 'mazo' ? item.imagen_comandante : item.imagen_portada) || CARTA_DORSO
    )

    try {
      const url = tipo === 'mazo'
        ? `cartas-mazo/?mazo=${item.id}`
        : `cartas-coleccion/?coleccion=${item.id}`
      const res = await api.get(url)
      setCartasLista(res.data)
    } catch {
      setCartasLista([])
      setErrorCarta('No se pudieron cargar las cartas de este elemento.')
    }
  }

  // --- ACCIONES PROTOTIPO 5 ---
  const anadirCartaScryfall = async (e) => {
    e.preventDefault()
    if (!busquedaCarta.trim()) return
    setErrorCarta('')
    setMensajeP5('')

    try {
      const scryRes = await axios.get(
        `https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(busquedaCarta.trim())}`
      )
      const c = scryRes.data
      const imgNormal =
        c.image_uris?.normal ||
        c.card_faces?.[0]?.image_uris?.normal ||
        CARTA_DORSO

      const esMazo = itemActivo.tipo === 'mazo'
      const baseEndpoint = esMazo ? 'cartas-mazo' : 'cartas-coleccion'

      const yaEnLista = cartasLista.find(
        (fila) => fila.nombre.toLowerCase() === c.name.toLowerCase()
      )

      if (yaEnLista) {
        const resPatch = await api.patch(`${baseEndpoint}/${yaEnLista.id}/`, {
          cantidad: yaEnLista.cantidad + 1
        })
        setCartasLista(cartasLista.map((f) => (f.id === yaEnLista.id ? resPatch.data : f)))
        setCartaHoverImg(imgNormal)
        setBusquedaCarta('')
        return
      }

      const cartaRes = await api.post('cartas/', {
        nombre: c.name,
        tipo: c.type_line || 'Card',
        costo_mana: Math.round(c.cmc || 0),
        es_legal_commander: c.legalities?.commander === 'legal',
        imagen_url: imgNormal
      })

      const payload = esMazo
        ? { mazo: itemActivo.data.id, carta: cartaRes.data.id, cantidad: 1, edicion: c.set_name, imagen_carta: imgNormal }
        : { coleccion: itemActivo.data.id, carta: cartaRes.data.id, cantidad: 1, edicion: c.set_name, imagen_carta: imgNormal }

      await api.post(`${baseEndpoint}/`, payload)

      const listUrl = esMazo
        ? `cartas-mazo/?mazo=${itemActivo.data.id}`
        : `cartas-coleccion/?coleccion=${itemActivo.data.id}`
      const actualizada = await api.get(listUrl)
      setCartasLista(actualizada.data)
      setCartaHoverImg(imgNormal)
      setBusquedaCarta('')
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setErrorCarta('No se encontró la carta en Scryfall.')
      } else {
        setErrorCarta('Error al guardar la carta en el servidor.')
      }
    }
  }

  const toggleSeleccion = async (fila) => {
    setMensajeP5('')
    const yaEsta = seleccionadas.includes(fila.id)
    const nuevas = yaEsta
      ? seleccionadas.filter((id) => id !== fila.id)
      : [...seleccionadas, fila.id]
    setSeleccionadas(nuevas)

    if (nuevas.length === 1) {
      const unica = cartasLista.find((c) => c.id === nuevas[0])
      if (unica) {
        setCantidadEditada(unica.cantidad)
        setEdicionElegida(unica.edicion || '')
        try {
          const resPrints = await axios.get(
            `https://api.scryfall.com/cards/search?q=!"${encodeURIComponent(unica.nombre)}"&unique=prints`
          )
          setEdicionesDisponibles(resPrints.data.data || [])
        } catch {
          setEdicionesDisponibles([])
        }
      }
    } else {
      setEdicionesDisponibles([])
    }
  }

  const guardarEdicionCarta = async () => {
    if (seleccionadas.length !== 1) return
    setErrorCarta('')
    setMensajeP5('')
    try {
      const idFila = seleccionadas[0]
      const endpoint = itemActivo.tipo === 'mazo'
        ? `cartas-mazo/${idFila}/`
        : `cartas-coleccion/${idFila}/`

      const printObj = edicionesDisponibles.find((p) => p.set_name === edicionElegida)
      const nuevaImg = printObj?.image_uris?.normal || printObj?.card_faces?.[0]?.image_uris?.normal

      const payload = {
        cantidad: Math.max(1, Number(cantidadEditada) || 1),
        edicion: edicionElegida,
        ...(nuevaImg ? { imagen_carta: nuevaImg } : {})
      }

      const res = await api.patch(endpoint, payload)
      setCartasLista(cartasLista.map((item) => (item.id === idFila ? res.data : item)))
      if (nuevaImg) setCartaHoverImg(nuevaImg)
      setMensajeP5('Cambios guardados.')
    } catch {
      setErrorCarta('No se pudo actualizar la carta.')
    }
  }

  const eliminarSeleccionadas = async () => {
    if (seleccionadas.length === 0) return
    try {
      const base = itemActivo.tipo === 'mazo' ? 'cartas-mazo' : 'cartas-coleccion'
      await Promise.all(seleccionadas.map((id) => api.delete(`${base}/${id}/`)))
      setCartasLista(cartasLista.filter((c) => !seleccionadas.includes(c.id)))
      setSeleccionadas([])
      setEdicionesDisponibles([])
    } catch {
      setErrorCarta('Error al eliminar las cartas seleccionadas.')
    }
  }

  // =========================================================
  // RENDER PROTOTIPO 5 (Detalle de Mazo / Colección)
  // =========================================================
  if (itemActivo) {
    return (
      <>
        <nav className='navbar navbar-split'>
          <div className='pos-boton'>
            <button type='button' className='nav-boton' onClick={() => setItemActivo(null)}>
              Volver
            </button>
          </div>
          <div className='pos-logo' onClick={() => setItemActivo(null)}>
            <img src={logo} alt='Logo' className='nav-logo' />
          </div>
          <div className='pos-boton'>
            <button type='button' className='nav-boton' onClick={Logout}>
              Logout
            </button>
          </div>
        </nav>

        <main className='p5-container'>
          <div className='p5-izq'>
            <div className='p5-card-preview'>
              <img src={cartaHoverImg} alt='Vista previa carta' />
            </div>

            <form onSubmit={anadirCartaScryfall} className='p5-add-box'>
              <input
                type='text'
                className='bar-reg'
                style={{ width: '100%' }}
                placeholder={`Agregar carta a ${itemActivo.data.nombre}...`}
                value={busquedaCarta}
                onChange={(e) => setBusquedaCarta(e.target.value)}
              />
              {errorCarta && <p className='mensaje-error'>{errorCarta}</p>}
              <button type='submit' className='reg-boton'>
                Añadir
              </button>
            </form>
          </div>

          <div className='p5-centro'>
            <h2>{itemActivo.data.nombre}</h2>
            <table className='p5-tabla'>
              <thead>
                <tr>
                  <th>Sel.</th>
                  <th>Costo de maná</th>
                  <th>Nombre</th>
                  <th>Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {cartasLista.map((fila) => (
                  <tr key={fila.id}>
                    <td>
                      <input
                        type='checkbox'
                        checked={seleccionadas.includes(fila.id)}
                        onChange={() => toggleSeleccion(fila)}
                      />
                    </td>
                    <td>{fila.costo_mana}</td>
                    <td
                      className='p5-nombre-hover'
                      onMouseEnter={() => setCartaHoverImg(fila.imagen_final || CARTA_DORSO)}
                    >
                      {fila.nombre}
                    </td>
                    <td>{fila.cantidad}</td>
                  </tr>
                ))}
                {cartasLista.length === 0 && (
                  <tr>
                    <td colSpan='4' style={{ color: 'var(--text-muted)', padding: '2rem' }}>
                      Aún no hay cartas aquí. Usa el buscador de la izquierda para añadir.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button
                type='button'
                className='nav-boton'
                onClick={eliminarSeleccionadas}
                disabled={seleccionadas.length === 0}
              >
                Eliminar ({seleccionadas.length})
              </button>
            </div>
          </div>

          {seleccionadas.length === 1 && (
            <aside className='p5-derecha'>
              <h2>Ediciones de la carta seleccionada</h2>
              <div className='register-form'>
                <label>Edición / Set:</label>
                <select
                  className='bar-reg'
                  style={{ width: '100%' }}
                  value={edicionElegida}
                  onChange={(e) => setEdicionElegida(e.target.value)}
                >
                  {edicionesDisponibles.length === 0 && edicionElegida && (
                    <option value={edicionElegida}>{edicionElegida}</option>
                  )}
                  {edicionesDisponibles.map((ed) => (
                    <option key={ed.id} value={ed.set_name}>
                      {ed.set_name} ({ed.set.toUpperCase()})
                    </option>
                  ))}
                </select>

                <label>Cantidad:</label>
                <input
                  type='number'
                  min='1'
                  className='bar-reg'
                  style={{ width: '100%' }}
                  value={cantidadEditada}
                  onChange={(e) => setCantidadEditada(e.target.value)}
                />

                {mensajeP5 && <p className='mensaje-exito'>{mensajeP5}</p>}

                <button type='button' className='reg-boton' onClick={guardarEdicionCarta}>
                  Guardar
                </button>
              </div>
            </aside>
          )}
        </main>
      </>
    )
  }

  // =========================================================
  // RENDER PROTOTIPO 4 (Mis Mazos y Mis Colecciones)
  // =========================================================
  return (
    <>
      <nav className='navbar navbar-split'>
        <div className='pos-boton'>
          <button type='button' className='nav-boton' onClick={() => abrirFormulario('mazo')}>
            + Mazo
          </button>
          <button type='button' className='nav-boton' onClick={() => abrirFormulario('coleccion')}>
            + Colección
          </button>
        </div>

        <div className='pos-logo'>
          <img src={logo} alt='Logo' className='nav-logo' />
        </div>

        <div className='pos-boton'>
          <button type='button' className='nav-boton' onClick={Logout}>
            Logout
          </button>
        </div>
      </nav>

      <main className='p4-container'>
        {formTipo && (
          <div className='estado-content' style={{ marginBottom: '3rem' }}>
            <h2>
              {editandoId
                ? `Editar ${formTipo === 'mazo' ? 'Mazo' : 'Colección'}`
                : `Nuevo ${formTipo === 'mazo' ? 'Mazo' : 'Colección'}`}
            </h2>
            <form onSubmit={guardarItemP4} className='register-form'>
              <input
                type='text'
                className='bar-reg'
                placeholder={formTipo === 'mazo' ? 'Nombre del mazo' : 'Nombre de la colección'}
                value={nombreForm}
                onChange={(e) => setNombreForm(e.target.value)}
                required
              />
              <input
                type='text'
                className='bar-reg'
                placeholder={
                  formTipo === 'mazo'
                    ? 'Carta Comandante (ej. Atraxa)'
                    : 'Carta de portada (ej. Black Lotus)'
                }
                value={cartaRefForm}
                onChange={(e) => setCartaRefForm(e.target.value)}
              />
              {errorForm && <p className='mensaje-error'>{errorForm}</p>}
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type='submit' className='reg-boton'>Guardar</button>
                <button type='button' className='reg-boton' onClick={() => setFormTipo(null)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <section className='p4-seccion'>
          <h2>Mis Mazos</h2>
          <div className='p4-grid'>
            {mazos.map((mazo) => (
              <div
                key={mazo.id}
                className='p4-card'
                onClick={() => abrirDetalleP5('mazo', mazo)}
              >
                <h3>{mazo.nombre}</h3>
                <img
                  src={mazo.imagen_comandante || CARTA_DORSO}
                  alt={mazo.nombre}
                />
                {mazo.fecha_creacion && (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.9rem' }}>
                    Creado: {formatearFecha(mazo.fecha_creacion)}
                  </p>
                )}
                <div className='p4-card-actions'>
                  <button
                    type='button'
                    onClick={(e) => {
                      e.stopPropagation()
                      abrirFormulario('mazo', mazo)
                    }}
                  >
                    Editar
                  </button>
                  <button
                    type='button'
                    onClick={(e) => eliminarItemP4(e, 'mazo', mazo.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className='p4-seccion'>
          <h2>Mis Colecciones</h2>
          <div className='p4-grid'>
            {colecciones.map((col) => (
              <div
                key={col.id}
                className='p4-card'
                onClick={() => abrirDetalleP5('coleccion', col)}
              >
                <h3>{col.nombre}</h3>
                <img
                  src={col.imagen_portada || CARTA_DORSO}
                  alt={col.nombre}
                />
                {col.fecha_creacion && (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.9rem' }}>
                    Creada: {formatearFecha(col.fecha_creacion)}
                  </p>
                )}
                <div className='p4-card-actions'>
                  <button
                    type='button'
                    onClick={(e) => {
                      e.stopPropagation()
                      abrirFormulario('coleccion', col)
                    }}
                  >
                    Editar
                  </button>
                  <button
                    type='button'
                    onClick={(e) => eliminarItemP4(e, 'coleccion', col.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  )
}