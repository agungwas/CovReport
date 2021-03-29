import { IonButton, IonLoading, IonCard, IonItem, IonContent, IonGrid, IonHeader, IonImg, IonInput, IonLabel, IonPage, IonRow, IonText, IonTitle, IonToolbar, IonIcon, useIonViewWillEnter, useIonViewDidEnter, useIonViewDidLeave, useIonViewWillLeave } from '@ionic/react';
import { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router';
import storage from '../helpers/storage'
const { users, fStorage } = require('../helpers/firebase.ts')
const { hash } = require('../helpers/bcrypt')


const Register: React.FC = () => {
  const params = useParams()
  const history = useHistory()
  const [ showPassword, setShowPassword ] = useState('password')
  const [ loading, setLoading ] = useState(false)
  const [ error, setError ] = useState({ 
    status: false,
    message: ''
  })
  const [ input, setInput ] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  useIonViewWillEnter(async () => {
    const data = await storage.get('user')
    if (Boolean(data)) history.push('/home')
  })

  useIonViewWillLeave(() => {
    setError({ status: false, message: '' })
    setInput({ name: '', email: '', password: '', confirmPassword: '' })
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
      if (input.password !== input.confirmPassword) {
        throw { 
          status: true,
          message: 'Your password is not match'
        }
      } 

      // for (const idInput in input) {
      //   // @ts-ignore
      //   const element = input[idInput]
      //   if (!element) setError({ 
      //     status: true,
      //     message: `${element.charAt(0).toUpperCase() + element.slice(1)} are bad input`
      //   })   
      // }
      
      const found = await users.where('email', '==', input.email ).get()
      if (found.empty) {
        const data = {
          name: input.name,
          email: input.email,
          password: hash(input.password),
          isAdmin: false,
        }
        await users.add(data)
        await storage.set('user', {
          name: data.name,
          email: data.email,
          isAdmin: data.isAdmin
        })
        history.push('/home')
      } else {
        found.forEach((el: any) => {
          if (el.id) throw { 
            status: true,
            message: `Your email is already registered, try to login`
          }
        })
      }
    } catch (error) { setError(error)
    } finally { setLoading(false) }
  }

  return (
    <IonPage>
      <div className='d-flex justify-content-center align-items-center h-100'>
        <div>
          <h4 style={{ font: 'Noto Sans KR'}}>Get's started with CoStats</h4>
          <IonText 
          color='medium'
          >Already have an account? 
            <IonText 
            style={{
              font: 'Noto Sans KR',
              fontWeight: 'bolder'
            }}
            color='primary'
            onClick={_=> history.push('/login')}> Log in</IonText>
          </IonText>
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
              <IonIcon slot='start' src='./assets/person.svg' className='ion-align-self-center'/>
              <IonLabel position="floating" >Name</IonLabel>
              <IonInput type='text' id='name' required value={input.name} onIonChange={handleInput}></IonInput>
            </IonItem>
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
            <IonItem className=''>
              <IonIcon slot='start' src='./assets/gembok.svg' className='ion-align-self-center'/>
              <IonLabel position="floating">Confirm Password</IonLabel>
              { // @ts-ignore 
              <IonInput type={showPassword} id='confirmPassword' required value={input.confirmPassword} onIonChange={handleInput}></IonInput>
              }
            </IonItem>
            <IonButton type='submit' className='w-100'>Sign up</IonButton>
          </form>
          <IonLoading
            isOpen={loading}
            message={'Registering...'}
            spinner='lines'
          />
        </div>
      </div>
    </IonPage>
  );
};

export default Register;


