import { IonButton, IonLoading, useIonViewWillEnter, useIonViewWillLeave, IonCard, IonItem, IonContent, IonGrid, IonHeader, IonImg, IonInput, IonLabel, IonPage, IonRow, IonText, IonTitle, IonToolbar, IonIcon } from '@ionic/react';
import { ComponentProps, PropsWithRef, useEffect, useState } from 'react';
import { RouteComponentProps, useHistory, useParams } from 'react-router';
import bcyrpt from 'bcryptjs'
import storage from '../helpers/storage'
import {
  Plugins,
  PushNotification,
  PushNotificationToken,
  PushNotificationActionPerformed,
} from '@capacitor/core';
const { PushNotifications } = Plugins;
const { users, fStorage, tokenFirebase } = require('../helpers/firebase.ts')
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

        if (Boolean(data) && data.isAdmin) {
          console.log('Initializing HomePage');
    
          // Request permission to use push notifications
          // iOS will prompt user and return if they granted permission or not
          // Android will just grant without prompting
          PushNotifications.requestPermission().then( result => {
            if (result.granted) {
              // Register with Apple / Google to receive push via APNS/FCM
              PushNotifications.register();
            } else {
              // Show some error
            }
          });
    
          // On success, we should be able to receive notifications
          PushNotifications.addListener('registration',
            async (token: PushNotificationToken) => {
              // alert('Push registration success, token: ' + token.value);
              const found = await tokenFirebase.where('token', '==', token.value ).get()
              if (found.empty) {
                await tokenFirebase.add({ token: token.value })
              }
              console.log('Push registration success, token: ' + token.value);
            }
          );
    
          // Some issue with our setup and push will not work
          PushNotifications.addListener('registrationError',
            (error: any) => {
              // alert('Error on registration: ' + JSON.stringify(error));
              console.log('Error on registration: ' + JSON.stringify(error));
            }
          );
    
          // // Show us the notification payload if the app is open on our device
          // PushNotifications.addListener('pushNotificationReceived',
          //   async (notification: PushNotification) => {
          //     let messages = await storage.get('messages')
          //     if (!messages) messages = []
          //     messages.push(notification.data.message)
          //     await storage.set('messages', messages)
          //     // alert('Push received: ' + JSON.stringify(notification));
          //     console.log('Push RECEIVED: ' + JSON.stringify(notification), 'dari received, di login')
          //   }
          // );
    
          // // Method called when tapping on a notification
          // PushNotifications.addListener('pushNotificationActionPerformed',
          //   async (notification: PushNotificationActionPerformed) => {
          //     let messages = await storage.get('messages')
          //     if (!messages) messages = []
          //     messages.push(notification.notification.data.message)
          //     await storage.set('messages', messages)
          //     // alert('Push action performed: ' + JSON.stringify(notification));
          //     console.log('Push ACTION performed: ' + JSON.stringify(notification), 'dari ACTION di login');
          //     history.replace('/home/addcase')
          //   }
          // );
    
        }
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
              <IonLabel position="floating" >Phone Number</IonLabel>
              <IonInput type='tel' id='email' minlength={5} required value={input.email} onIonChange={handleInput}></IonInput>
            </IonItem>
            <IonItem className=''>
              <IonIcon slot='start' src='./assets/gembok.svg' className='ion-align-self-center'/>
              <IonLabel position="floating">Password</IonLabel>
              { // @ts-ignore 
              <IonInput type={showPassword} minlength={5} id='password' required value={input.password} onIonChange={handleInput}></IonInput>
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
