import { useState } from "react";
import api from '../api'
import logo3 from '../assets/logo3.png'
import logo from '../assets/logo.png'

export default function Login({setIsAuthenticated, setCurrentView}){
    const [Log_Username, setLogUsername] = useState('')
    const [Log_Password, setLogPassword] = useState('')
    const [Log_Error, setLogError] = useState('')
    const [Log_Exito, setLogExito] = useState('')

    const funcLog = async (e) => {
        e.preventDefault()
        setLogError('')
        setLogExito('')

        try {
            const response = await api.post('login/',{
                username: Log_Username,
                password: Log_Password
            })

            if (response.status === 200){
                localStorage.setItem('token', response.data.token)
                setLogUsername('')
                setLogPassword('')
                setLogExito('Sesion iniciada correctamente')
                setIsAuthenticated(true)
                setCurrentView('principal')
            }
        } catch (error) {
            if (error.response && error.response.data === 400){
                setLogError('Usuario o contraseña incorrectos')
            } else {
                setLogError('Error de conexión con el servidor')
            }
        }
    }

    return (
        <div>
            <nav className='navbar'>
                <div className='pos-logo'>
                    <img src={logo} className="nav-logo"/>
                </div>
            </nav>


            <main className="estado-content">
                <img src={logo3} alt="Logo registro" className="register-logo"/>
                <h2>Iniciar sesion</h2> 

                <form onSubmit={funcLog} className="register-form">
                    <input 
                        type="text"
                        placeholder="Usuario"
                        className="bar-reg"
                        value={Log_Username}
                        onChange={(e) => setLogUsername(e.target.value)}
                        required
                    /> 
                    <input 
                        type="password"
                        placeholder="Contraseña"
                        className="bar-reg"
                        value={Log_Password}
                        onChange={(e) => setLogPassword(e.target.value)}
                        required
                    />

                    {Log_Error && <p className="mensaje-error">{Log_Error}</p>}
                    {Log_Exito && <p className="mensaje-exito">{Log_Exito}</p>}

                    <button type="submit" className="reg-boton">Ingresar</button>
                        
                </form>
            </main>
        </div>
    )
} 