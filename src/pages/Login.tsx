import { IonButton, IonLoading, useIonViewWillEnter, useIonViewWillLeave, IonCard, IonItem, IonContent, IonGrid, IonHeader, IonImg, IonInput, IonLabel, IonPage, IonRow, IonText, IonTitle, IonToolbar, IonIcon } from '@ionic/react';
import { ComponentProps, PropsWithRef, useEffect, useState } from 'react';
import { RouteComponentProps, useHistory, useParams } from 'react-router';
import bcyrpt from 'bcryptjs'
import storage from '../helpers/storage'
const { users, fStorage } = require('../helpers/firebase.ts')
const { hash, compare } = require('../helpers/bcrypt')

// @ts-ignore
const Login: React.FC = ({ match }) => {
  const history = useHistory()
  const params = useParams()
  const [ showPassword, setShowPassword ] = useState('password')
  const [ loading, setLoading ] = useState(false)
  const [ error, setError ] = useState({ 
    status: false,
    message: ''
  })
  const [ input, setInput ] = useState({
    email: '',
    password: ''
  })

  useIonViewWillLeave(() => {
    setError({ status: false, message: '' })
    setInput({ email: '', password: '' })
  })

  useIonViewWillEnter(async () => {
    await storage.create()
    const data = await storage.get('user')
    if (Boolean(data)) history.push('/home')
  })

  function showPasswordPress() {
    if (showPassword === 'password') setShowPassword('text')
    else setShowPassword('password')
  }

  function handleInput(e: any) {
    setInput({ ...input, [e.target.id]: e.target.value})
  }

  async function handleSubmit(e: any) {
    try {
      e.preventDefault()
      setLoading(true)
      setInput({ ...input, email: input.email.toLowerCase() })

      const found = await users.where('email', '==', input.email ).get()
      if (found.empty) {
        throw { 
          status: true,
          message: `Please register first!`
        }
      } else {
        let data = { name: '', email: '', isAdmin: false, password: '' }  
        found.forEach((el: any) => {
          if (el.id) data = el.data()
        })

        if (!compare(input.password, data.password)) {
          throw {
            status: true,
            message: 'Email or password is not match!'
          }
        } 
        await storage.set('user', { name: data.name, email: data.email, isAdmin: data.isAdmin })
        history.replace('/home/welcome')
      }
    } catch (error) { setError(error)
    } finally { setLoading(false) }
  }

  return (
    <IonPage>
      <div className='d-flex justify-content-center align-items-center h-100'>
        <div>
          <h4 style={{ font: 'Noto Sans KR'}}>Hi, Welcome back!</h4>
          <IonText 
          color='medium'
          style={{ font: 'Noto Sans KR'}}
          >Login now to fight the virus</IonText>
          <form onSubmit={handleSubmit}>
            {error.status && 
              <div
              className='d-flex justify-content-center w-100 p-1'>
                <IonText 
                style={{ 
                  padding: 4,
                  fontSize: 14,
                }} className="alert alert-danger m-1">{error.message}</IonText>
              </div>
            }
            <IonItem className=''>
              <IonIcon slot='start' src='./assets/email.svg' className='ion-align-self-center'/>
              <IonLabel position="floating" >Email address</IonLabel>
              <IonInput type='email' id='email' required value={input.email} onIonChange={handleInput}></IonInput>
            </IonItem>
            <IonItem className=''>
              <IonIcon slot='start' src='./assets/gembok.svg' className='ion-align-self-center'/>
              <IonLabel position="floating">Password</IonLabel>
              { // @ts-ignore 
              <IonInput type={showPassword} id='password' required value={input.password} onIonChange={handleInput}></IonInput>
              }
              <IonIcon slot="end" src={showPassword === 'text' ? './assets/eye-outline.svg' : './assets/eye-off-outline.svg'} onClick={showPasswordPress} className='ion-align-self-center'></IonIcon>
            </IonItem>
            <IonButton type='submit' className='w-100'>Sign in</IonButton>
          </form>
          <IonRow className='d-flex justify-content-center'>
          <IonText 
          color='medium'
          style={{ fontSize: 14 }}
          >Not registered yet? 
            <IonText 
            style={{
              font: 'Noto Sans KR',
              fontWeight: 'bolder',
              fontSize: 14
            }}
            color='primary'
            onClick={_=> history.push('/register')}> Create an account</IonText>
          </IonText>
          </IonRow>
          <IonLoading
            isOpen={loading}
            message={'Login...'}
            spinner='lines'
          />
        </div>
      </div>
    </IonPage>
  );
};

export default Login;
