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
import { withRouter } from 'react-router-dom'

const Measurements = (props) => {
  const baseUrl = process.env.REACT_APP_BASE_GET + '&resource=Observation'
  const baseGetUrl =
    // eslint-disable-next-line react/prop-types
    baseUrl + '&subject=Patient/' + props.match.params.patientId
  const [searching, setSearching] = React.useState(true)
  const [errorMsg, setErrorMsg] = React.useState(null)
  const [measurements, setMeasurements] = React.useState([])
  const [urlPagination, setUrlPagination] = React.useState(null)
  const [isFirstPage, setIsFirstPage] = React.useState(true)

  const getMeasurementsFromPatient = async (url = null) => {
    try {
      setSearching(true)
      setErrorMsg(null)
      const request = await fetch(url ? url : baseGetUrl)
      const response = await request.json()
      if (response && response.entry) {
        setMeasurements(response.entry)
        setSearching(false)
        checkPagination(response)
      } else {
        setErrorMsg('No Measurements found. Please try again.')
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
      getMeasurementsFromPatient(urlPagination)
    }
  }

  const handleFirstPagination = () => {
    setIsFirstPage(true)
    getMeasurementsFromPatient()
  }

  useEffect(() => {
    getMeasurementsFromPatient()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>List of Measurements</strong> <small>{measurements.length} results</small>
          </CCardHeader>
          <CCardBody>
            {searching && <CSpinner color="secondary" />}
            {errorMsg && <CAlert color="danger">{errorMsg}</CAlert>}
            {!searching && !errorMsg && (
              <CTable responsive>
                <CTableCaption>
                  <span className="float-start">List of Measurements</span>
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
                    <CTableHeaderCell scope="col">Code</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Quantity</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {measurements.map(({ resource: measurement }, index) => {
                    return (
                      <CTableRow key={index}>
                        <CTableDataCell>{measurement.id}</CTableDataCell>
                        <CTableDataCell>{measurement.resourceType}</CTableDataCell>
                        <CTableDataCell>{measurement.status}</CTableDataCell>
                        <CTableDataCell>
                          {measurement.code &&
                          measurement.code.coding &&
                          measurement.code.coding.length
                            ? measurement?.code.coding[0]?.code
                            : null}
                        </CTableDataCell>
                        <CTableDataCell>
                          {measurement.valueQuantity ? measurement.valueQuantity.value : null}
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

export default withRouter(Measurements)
