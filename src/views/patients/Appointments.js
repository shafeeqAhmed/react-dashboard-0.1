import React, { useEffect } from 'react'
import {
  CAlert,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CPagination,
  CPaginationItem,
  CRow,
  CSpinner,
  CTable,
  CTableBody,
  CTableCaption,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import { Link, withRouter } from 'react-router-dom'

const Appointments = (props) => {
  const baseUrl = process.env.REACT_APP_BASE_GET + '&resource=Appointment'
  const baseGetUrl =
    // eslint-disable-next-line react/prop-types
    baseUrl + '&actor=Patient/' + props.match.params.patientId + '&_sort=appointment-sort-start'
  const [searching, setSearching] = React.useState(true)
  const [errorMsg, setErrorMsg] = React.useState(null)
  const [appointments, setAppointments] = React.useState([])
  const [urlPagination, setUrlPagination] = React.useState(null)
  const [isFirstPage, setIsFirstPage] = React.useState(true)

  const getAppointmentsFromPatient = async (url = null) => {
    try {
      setSearching(true)
      setErrorMsg(null)
      const request = await fetch(url ? url : baseGetUrl)
      const response = await request.json()
      if (response && response.entry) {
        setAppointments(response.entry)
        setSearching(false)
        checkPagination(response)
      } else {
        setErrorMsg('No Appointments found. Please try again.')
      }
    } catch (err) {
      setErrorMsg('Error: ' + err)
      console.error(err)
    } finally {
      setSearching(false)
    }
  }

  const getCtParamFromUrl = (url = null) => {
    const urlParams = url.split('?')[1]
    const params = urlParams.split('&')
    const ctParam = params.find((param) => param.includes('ct=')).split('=')[1]
    return ctParam
  }

  const checkPagination = (response) => {
    if (response.link) {
      const nextLink = response.link.find((link) => link.relation === 'next')
      if (nextLink) {
        const nextUrl = nextLink.url
        const nextPagination = getCtParamFromUrl(nextUrl)
        if (nextPagination) {
          const nextUrlWithPagination = `${baseUrl}&ct=${nextPagination}`
          setUrlPagination(nextUrlWithPagination)
        }
      } else {
        setUrlPagination(null)
        setSearching(false)
      }
    } else {
      setUrlPagination(null)
      setSearching(false)
    }
  }

  const handleNextPagination = () => {
    if (urlPagination) {
      setIsFirstPage(false)
      getAppointmentsFromPatient(urlPagination)
    }
  }

  const handleFirstPagination = () => {
    setIsFirstPage(true)
    getAppointmentsFromPatient()
  }

  useEffect(() => {
    getAppointmentsFromPatient()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>List of Appointments</strong> <small>{appointments.length} results</small>
          </CCardHeader>
          <CCardBody>
            {searching && <CSpinner color="secondary" />}
            {errorMsg && <CAlert color="danger">{errorMsg}</CAlert>}
            {!searching && !errorMsg && (
              <CTable responsive>
                <CTableCaption>
                  <span className="float-start">List of appointments</span>
                  <CPagination align="end">
                    {!isFirstPage && (
                      <CPaginationItem itemType="prev" onClick={handleFirstPagination}>
                        &laquo; Prev
                      </CPaginationItem>
                    )}
                    {urlPagination && (
                      <CPaginationItem itemType="next" onClick={handleNextPagination}>
                        Next &raquo;
                      </CPaginationItem>
                    )}
                  </CPagination>
                </CTableCaption>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">ID</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Type</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Status</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Service Type</CTableHeaderCell>
                    <CTableHeaderCell style={{ width: 165 }} scope="col">
                      Appointment Type
                    </CTableHeaderCell>
                    <CTableHeaderCell scope="col">Start</CTableHeaderCell>
                    <CTableHeaderCell scope="col">End</CTableHeaderCell>
                    <CTableHeaderCell style={{ width: 145 }} scope="col">
                      Schedule ID
                    </CTableHeaderCell>
                    <CTableHeaderCell scope="col">Encounter ID</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Tasks</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {appointments.map(({ resource: appointment }, index) => {
                    const start = appointment.start ? new Date(appointment.start) : null
                    const end = appointment.end ? new Date(appointment.end) : null
                    return (
                      <CTableRow key={index}>
                        <CTableDataCell>{appointment.id}</CTableDataCell>
                        <CTableDataCell>{appointment.resourceType}</CTableDataCell>
                        <CTableDataCell>{appointment.status}</CTableDataCell>
                        <CTableDataCell>
                          {appointment.serviceType && appointment.serviceType.length
                            ? appointment?.serviceType[0]?.coding[0]?.display
                            : null}
                        </CTableDataCell>
                        <CTableDataCell>
                          {appointment?.appointmentType?.coding[0]?.display}
                        </CTableDataCell>
                        <CTableDataCell>
                          {start
                            ? start.getFullYear() +
                              '-' +
                              (start.getMonth() + 1 < 10
                                ? '0' + (start.getMonth() + 1)
                                : start.getMonth() + 1) +
                              '-' +
                              (start.getDate() < 10 ? '0' + start.getDate() : start.getDate()) +
                              ' at ' +
                              start.getHours() +
                              ':' +
                              (start.getMinutes() < 10 ? '0' : '') +
                              start.getMinutes()
                            : ''}
                        </CTableDataCell>
                        <CTableDataCell>
                          {end
                            ? end.getFullYear() +
                              '-' +
                              (end.getMonth() + 1 < 10
                                ? '0' + (end.getMonth() + 1)
                                : end.getMonth() + 1) +
                              '-' +
                              (end.getDate() < 10 ? '0' + end.getDate() : end.getDate()) +
                              ' at ' +
                              end.getHours() +
                              ':' +
                              (end.getMinutes() < 10 ? '0' : '') +
                              end.getMinutes()
                            : ''}
                        </CTableDataCell>
                        <CTableDataCell>
                          {appointment.extension && appointment.extension.length > 2
                            ? appointment.extension[0].valueString
                            : null}
                        </CTableDataCell>
                        <CTableDataCell>
                          {appointment.extension && appointment.extension.length > 2
                            ? appointment.extension[2].valueString
                            : null}
                        </CTableDataCell>
                        <CTableDataCell>
                          <Link
                            to={
                              '/patients/' +
                              // eslint-disable-next-line react/prop-types
                              props.match.params.patientId +
                              '/appointments/' +
                              appointment.id +
                              '/tasks'
                            }
                          >
                            Go to Tasks
                          </Link>
                        </CTableDataCell>
                      </CTableRow>
                    )
                  })}
                </CTableBody>
              </CTable>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default withRouter(Appointments)
