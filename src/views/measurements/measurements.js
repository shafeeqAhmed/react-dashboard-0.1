import React, {useEffect, useState} from 'react'
import axios from 'axios'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableCaption,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CSpinner,
  CModal,
  CButton,
  CModalTitle,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CFormInput,
  CForm,
  CFormLabel,
  CFormCheck,
  CFormSelect, CPagination, CPaginationItem
} from '@coreui/react'
import { DocsCallout, DocsExample } from 'src/components'
import { Link, useLocation } from 'react-router-dom'

const Appointments = (props) => {

  const [carePlansList, setCarePlansList] = useState([]);
  const [requesting, setRequesting] = useState(false);
  const [visible, setVisible] = useState(false)
  const [editVisible, setEditVisible] = useState(false)
  const [deleteVisible, setDeleteVisible] = useState(false)
  const [selectedId, setSelectedId] = useState(false)
  const [urlPagination, setUrlPagination] = React.useState(null)
  const [isFirstPage, setIsFirstPage] = React.useState(true)
  const [searching, setSearching] = React.useState(true)




  // new patient fields
  const [title, setTitle] = useState("");

  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editDob, setEditDob] = useState("");
  const [editGender, setEditGender] = useState("");
  const [editStatus, setEditStatus] = useState(false);
  const search = useLocation().search;


  useEffect(() => {
    fetchRecords()
  }, [])


  const fetchRecords = (url = null) => {
    const patient_id = new URLSearchParams(search).get('patient_id');
    let mearsurement_url = process.env.REACT_APP_BASE_URL+`/Observation?subject=Patient/${patient_id}?_sort=date`;

    setRequesting(true);
    axios.get(url ? url : mearsurement_url).then((response) => {
      checkPagination(response.data)
      var carePlans = [];
      response.data.entry?.forEach((item, index) => {
          console.log(item)
          carePlans.push({
              id: item.resource.id,
              title: item.resource.code.text,
              status: item.resource.status,
              code: item.resource?.valueQuantity?.code,
              unit: item.resource?.valueQuantity?.unit,
              value: item.resource?.valueQuantity?.value,
              effectiveDateTime: item.resource?.effectiveDateTime,
          })
      })
      console.log(carePlans);
      // console.log(appointmentList)
      setRequesting(false);
      setCarePlansList(carePlans);
    })
  }

  const addMeasurement = () => {
    const patient_id = new URLSearchParams(search).get('patient_id');
    const data = {
        "resourceType": "Observation",
        "status": "registered",
        "code": {
            "coding": [
                {
                    "system": "http://loinc.org/",
                    "code": "8867-4",
                    "display": "Heart rate"
                }
            ],
            "text": title
        },
        "subject": {
            "reference": "Patient/"+patient_id
        },
        "valueQuantity": {
            "value": 22,
            "unit": "degree cesius",
            "code": "12351"
        },
      "effectiveDateTime": "2022-02-16T11:53:39.723"
    }
    let mearsurement_url = process.env.REACT_APP_BASE_URL+`/Observation?subject=Patient/${patient_id}`;

    axios.post(mearsurement_url, data)
      .then((response) => {
      fetchRecords()
      setVisible(false)
    }).catch((e)=>{
      setVisible(false)
      console.log(e)
    })
  }
  const deleteMeasurement = () => {

    let delete_patient_url = process.env.REACT_APP_BASE_URL+`/Observation/${selectedId}`;

    setRequesting(true);
    axios.delete(delete_patient_url).then((response) => {
      setRequesting(false);
      setDeleteVisible(false);
      fetchRecords();
    }).catch((err) => {
      setRequesting(false);
      setDeleteVisible(false);
      fetchRecords();
    })
  }

  //pagination functions
  const getCtParamFromUrl = (url = null) => {
    const urlParams = url.split('?')[1]
    const params = urlParams.split('&')
    // const ctParam = params.find((param) => param.includes('ct=')).split('=')[1]
    return params[1]
  }
  const checkPagination = (response) => {
    if (response.link) {
      const nextLink = response.link.find((link) => link.relation === 'next')
      if (nextLink) {
        const nextUrl = nextLink.url
        const nextPagination = getCtParamFromUrl(nextUrl)

        if (nextPagination) {
          const patient_id = new URLSearchParams(search).get('patient_id');

          let baseUrl = process.env.REACT_APP_BASE_URL+`/Observation?subject=Patient/${patient_id}`;


          const nextUrlWithPagination = `${baseUrl}&${nextPagination}`
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
      fetchRecords(urlPagination)
    }
  }
  const handleFirstPagination = () => {
    setIsFirstPage(true)
    fetchRecords()
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Measurement</strong> <small>listing</small>
            {/*<CButton style={{float: 'right'}} onClick={() => setVisible(!visible)}>Add Measurement</CButton>*/}

          </CCardHeader>
          <CCardBody>
              <CTable align={'middle'}>
                <CTableCaption>
                  <span className="float-start">List of Measurement</span>
                  <CPagination align="end">
                    {!isFirstPage && (
                      <CPaginationItem  className="btn"  itemType="prev" onClick={handleFirstPagination}>
                        &laquo; Prev
                      </CPaginationItem>
                    )}
                    {urlPagination && (
                      <CPaginationItem className="btn" itemType="next" onClick={handleNextPagination}>
                        Next &raquo;
                      </CPaginationItem>
                    )}
                  </CPagination>
                </CTableCaption>

                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">ID</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Title</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Code</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Unit</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Value</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Effective Date Time</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Status</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Action</CTableHeaderCell>

                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  { requesting && <CSpinner/> }
                    {carePlansList?.map((item, index) => {
                      return (
                        <CTableRow key={item.id}>
                          <CTableHeaderCell scope="row">{item.id}</CTableHeaderCell>
                          <CTableDataCell>{item.title}</CTableDataCell>
                          <CTableDataCell>{item.code}</CTableDataCell>
                          <CTableDataCell>{item.unit}</CTableDataCell>
                          <CTableDataCell>{item.value}</CTableDataCell>
                          <CTableDataCell>{item.effectiveDateTime}</CTableDataCell>
                          <CTableDataCell>{item.status}</CTableDataCell>
                          <CTableDataCell>
                            <CButton
                                color="danger"
                                variant="outline"
                                onClick={() => {setDeleteVisible(true);console.log(item); setSelectedId(item.id)}}
                              >
                                Delete
                              </CButton>
                          </CTableDataCell>
                        </CTableRow>
                      )
                    })}
                </CTableBody>
              </CTable>
          </CCardBody>
        </CCard>
      </CCol>
    <CModal  backdrop={'static'}  visible={visible} onClose={() => setVisible(false)}>
      <CModalHeader onClose={() => setVisible(false)}>
        {/*<CModalTitle>Add Measurement</CModalTitle>*/}
      </CModalHeader>
      <CModalBody>

      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardBody>
              <CForm className="row g-3">
                <CCol md={12}>
                  <CFormLabel htmlFor="title">Title</CFormLabel>
                  <CFormInput onChange={(e) => setTitle(e.target.value)} type="text" id="title" />
                </CCol>

                {/*<CCol md={6}>*/}
                {/*  <CFormLabel htmlFor="inputState">Status</CFormLabel>*/}
                {/*  <CFormSelect onChange={(e) => setGender(e.target.value)} id="inputState">*/}
                {/*    <option>Choose...</option>*/}
                {/*    <option value='true'>Active</option>*/}
                {/*    <option value='false'>InActive</option>*/}
                {/*  </CFormSelect>*/}
                {/*</CCol>*/}
              </CForm>
          </CCardBody>
        </CCard>
      </CCol>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={() => setVisible(false)}>
          Close
        </CButton>
        <CButton color="primary" onClick={() => addMeasurement()}>Save changes</CButton>
      </CModalFooter>
    </CModal>


    <CModal visible={deleteVisible} onClose={() => setDeleteVisible(false)}>
      <CModalHeader onClose={() => setDeleteVisible(false)}>
        <CModalTitle>Confirmation</CModalTitle>
      </CModalHeader>
      <CModalBody>

      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardBody>
              Are you sure you want to delete?
          </CCardBody>
        </CCard>
      </CCol>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={() => setDeleteVisible(false)}>
          Close
        </CButton>
        <CButton color="primary" onClick={() => deleteMeasurement()}>Confirm Delete</CButton>
      </CModalFooter>
    </CModal>
    </CRow>
  )
}

export default Appointments
