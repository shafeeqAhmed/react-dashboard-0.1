import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))

// Patients
const Patients = React.lazy(() => import('./views/patients/Patients'))
const Appointments = React.lazy(() => import('./views/patients/Appointments'))
const Measurements = React.lazy(() => import('./views/patients/Measurements'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/patients', exact: true, name: 'Patients', component: Patients },
  {
    path: '/patients/:patientId/appointments',
    name: 'Appointments',
    exact: true,
    component: Appointments,
  },
  {
    path: '/patients/:patientId/measurements',
    name: 'Measurements',
    exact: true,
    component: Measurements,
  },
]

export default routes
