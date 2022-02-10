import React, { useEffect } from 'react'
import {
  CAlert,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
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
import { Link } from 'react-router-dom'

const Patients = () => {
  const baseUrl = process.env.REACT_APP_BASE_GET + '&resource=Patient'
  const [searching, setSearching] = React.useState(true)
  const [errorMsg, setErrorMsg] = React.useState(null)
  const [patients, setPatients] = React.useState([])
  const [urlPagination, setUrlPagination] = React.useState(null)
  const [isFirstPage, setIsFirstPage] = React.useState(true)

  const getPatientsFromFetch = async (url = null) => {
    try {
      setErrorMsg(null)
      setSearching(true)
      const request = await fetch(url ? url : baseUrl)
      const response = await request.json()
      if (response && response.entry) {
        setPatients(response.entry)
        setSearching(false)
        checkPagination(response)
      } else {
        setErrorMsg('No patients found. Please try again.')
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
      getPatientsFromFetch(urlPagination)
    }
  }

  const handleFirstPagination = () => {
    setIsFirstPage(true)
    getPatientsFromFetch()
  }

  useEffect(() => {
    getPatientsFromFetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>List of patients</strong> <small>{patients.length} results</small>
          </CCardHeader>
          <CCardBody>
            {searching && <CSpinner color="secondary" />}
            {errorMsg && <CAlert color="danger">{errorMsg}</CAlert>}
            {!searching && !errorMsg && (
              <CTable>
                <CTableCaption>
                  <span className="float-start">List of patients</span>
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
                    <CTableHeaderCell scope="col">Name</CTableHeaderCell>
                    <CTableHeaderCell align="center" scope="col">
                      Gender
                    </CTableHeaderCell>
                    <CTableHeaderCell scope="col">Birth Date</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Quick Access</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {patients.map(({ resource: patient }, index) => (
                    <CTableRow key={index}>
                      <CTableDataCell>{patient.id}</CTableDataCell>
                      <CTableDataCell>
                        {patient.name[0].given[0] + ' ' + patient.name[0].family}
                      </CTableDataCell>
                      <CTableDataCell align="middle">{patient.gender}</CTableDataCell>
                      <CTableDataCell>{patient.birthDate}</CTableDataCell>
                      <CTableDataCell>
                        <CDropdown variant="btn-group">
                          <CDropdownToggle color="primary">View Links</CDropdownToggle>
                          <CDropdownMenu>
                            <CDropdownItem>
                              <Link to={'/patients/' + patient.id + '/appointments'}>
                                Appointments
                              </Link>
                            </CDropdownItem>
                            <CDropdownItem>
                              <Link to={'/patients/' + patient.id + '/measurements'}>
                                Measurements
                              </Link>
                            </CDropdownItem>
                            <CDropdownItem href="#">Care plans</CDropdownItem>
                          </CDropdownMenu>
                        </CDropdown>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Patients
