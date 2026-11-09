import { useState } from "react";
import api from '../api'
import logo3 from '../assets/logo3.png'


export default function Registrar(){
    const [Reg_Username, setRegUsername] = useState('')
    const [Reg_Email, setRegEmail] = useState('')
    const [Reg_Password, setRegPassword] = useState('')
    const [Reg_ConfirmPassword, setRegConfirmPassword] = useState('')
    const [Reg_Error, setRegError] = useState('')
    const [Reg_Exito, setRegExito] = useState('')

    const funcReg = async (e) => {
        e.preventDefault()
        setRegError('')
        setRegExito('')

        try {
            const response = await api.post('register/',{
                usuario: Reg_Username,
                correo: Reg_Email,
                contraseña: Reg_Password
            })

            if (response.status === 201 || response.status === 200){
                setRegExito('Cuenta creada con exito')
                setRegUsername('')
                setRegEmail('')
                setRegPassword('')
                setRegConfirmPassword('')
            }
        } catch (error) {
            if (error.response && error.response.data){
                const mensaje = Object.values(error.response.data).flat().join('|')
                setRegError(mensaje)
            } else {
                setRegError('Error de conexión con el servidor')
            }
        }
    }

    return (
        <main className="estado-content">
            <img src={logo3} alt="Logo registro" className="register-logo"/>
            <h2>Crear Cuenta</h2> 

            <form onSubmit={funcReg} className="register-form">
                <input 
                    type="text"
                    placeholder="Usuario"
                    className="bar-reg"
                    value={Reg_Username}
                    onChange={(e) => setRegUsername(e.target.value)}
                    required
                />
                <input 
                    type="email"
                    placeholder="Email"
                    className="bar-reg"
                    value={Reg_Email}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                /> 
                <input 
                    type="password"
                    placeholder="Contraseña"
                    className="bar-reg"
                    value={Reg_Password}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                />
                <input 
                    type="password"
                    placeholder="Confirmar Contraseña"
                    className="bar-reg"
                    value={Reg_ConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    required
                />

                {Reg_Error && <p className="mensaje-error">{Reg_Error}</p>}
                {Reg_Exito && <p className="mensaje-exito">{Reg_Exito}</p>}

                <button type="submit" className="reg-boton">Registrarse</button>
                    
            </form>
        </main>
    )
}