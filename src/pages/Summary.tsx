import react, { useState } from 'react'
import chart from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import { IonContent, IonLoading, IonPage, IonText, IonTitle, IonToolbar, useIonViewDidEnter, useIonViewWillEnter } from '@ionic/react'
import storage from '../helpers/storage'
import { useHistory } from 'react-router'
import { report } from 'node:process'
const { users, fStorage, cases } = require('../helpers/firebase.ts')


const Summary: React.FC = () => {
  const [ reports, setreports ]: any = useState({})
  const history = useHistory()
  
  useIonViewDidEnter(async () => {
    await storage.create()
    const data = await storage.get('user')
    if (!Boolean(data)) history.push('/login')
    else if (!data.isAdmin) history.push('/home/welcome')
    else {
      const total: any = []
      let byJenisKelamin: any = {}
      let byCountry: any = {}
      let byRegion: any = {}
      let byCounty: any = {}
      
      let dataCases
      if (data.isAdmin) dataCases = await cases.get()
      else dataCases = await cases.where('userEmail', '==', data.email).get()
      if (!dataCases.empty) {
        dataCases.forEach((el: any) => {
          const datum = el.data()
          const authorized = data.email === datum.userEmail ? true : false
          total.push({ ...datum, id: datum.id, authorized })
          byJenisKelamin[datum.isMale] ? byJenisKelamin[datum.isMale]++ : byJenisKelamin[datum.isMale] = 1
          byCountry[datum.detailLoc.country] ? byCountry[datum.detailLoc.country]++ : byCountry[datum.detailLoc.country] = 1
          byRegion[datum.detailLoc.region] ? byRegion[datum.detailLoc.region]++ : byRegion[datum.detailLoc.region] = 1
          byCounty[datum.detailLoc.county] ? byCounty[datum.detailLoc.county]++ : byCounty[datum.detailLoc.county] = 1
        })
      }
      byJenisKelamin = toDataChart(byJenisKelamin, 'Total victim by jenis kelamin')
      byCountry = toDataChart(byCountry, 'Total victim by country')
      byRegion = toDataChart(byRegion, 'Total victim by region')
      byCounty = toDataChart(byCounty, 'Total victim by county')
  
      setreports({ total, byCounty, byCountry, byRegion, byJenisKelamin })    
    }
  })

  function toDataChart(obj: any, nama: string) {
    const red = Math.floor(Math.random() * 256)
    const green = Math.floor(Math.random() * 256)
    const blue = Math.floor(Math.random() * 256)
    const data: any = {
      labels: [],
      datasets: [
        {
          label: nama,
          backgroundColor: `rgba(${red}, ${green}, ${blue}, 0.2)`,
          borderColor: `rgba(${red}, ${green}, ${blue}, 1)`,
          borderWidth: 1,
          hoverBackgroundColor: `rgba(${red}, ${green}, ${blue}, 0.4)`,
          hoverBorderColor: `rgba(${red}, ${green}, ${blue}, 1)`,
          data: []
        }
      ]
    }
    for (const key in obj) {
      if (key === 'true') data.labels.push('Male')
      else if (key === 'false') data.labels.push('Female')
      else {
        data.labels.push(key)
      }
      data.datasets[0].data.push(obj[key])
    }
    return data
  }

  return (
    <IonPage>
      <IonToolbar>
        <IonTitle>Summary</IonTitle>
      </IonToolbar>
      <IonContent>

        <IonTitle>Total Case: {reports?.total?.length ? reports?.total?.length : 'loading...'} </IonTitle>
        <div>
          <Bar 
            data={reports.byJenisKelamin}
            width={100}
            height={50}
            options={{
              maintainAspectRatio: true
            }}
          ></Bar>
        </div>
        <div>
          <Bar data={reports.byCounty}/>
        </div>
        <div>
          <Bar data={reports.byRegion}/>
        </div>
        <div>
          <Bar 
            data={reports.byCountry}
            width={100}
            height={50}
            options={{
              maintainAspectRatio: true
            }}
          ></Bar>
        </div>
      </IonContent>
    </IonPage>
  )
}

export default Summary