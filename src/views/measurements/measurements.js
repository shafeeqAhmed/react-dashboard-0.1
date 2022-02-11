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
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [status, setStatus] = useState(false);

  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editDob, setEditDob] = useState("");
  const [editGender, setEditGender] = useState("");
  const [editStatus, setEditStatus] = useState(false);
  const [editPatientObject, setEditPatientObject] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(false);
  const [editSchema, setEditSchema] = useState(false);
  const search = useLocation().search;


  useEffect(() => {
    fetchRecords()
  }, [])


  const fetchRecords = (url = null) => {
    const patient_id = new URLSearchParams(search).get('patient_id');
    let get_patients_url = process.env.REACT_APP_BASE_GET_URL+`&resource=Observation&subject=Patient/${patient_id}`;
    setRequesting(true);
    axios.get(url ? url : get_patients_url).then((response) => {
      checkPagination(response.data)
      var carePlans = [];
      response.data.entry?.forEach((item, index) => {
          console.log(item)
          carePlans.push({
              id: item.resource.id,
              title: item.resource.code.text,
              status: item.resource.status,
          })
      })
      console.log(carePlans);
      // console.log(appointmentList)
      setRequesting(false);
      setCarePlansList(carePlans);
    })
  }

  const addPatient = () => {
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
            "text": "Heart rate"
        },
        "subject": {
            "reference": "Patient/"+patient_id
        },
        "valueQuantity": {
            "value": 97,
            "unit": "beats/minute",
            "system": "http://unitsofmeasure.org/",
            "code": "/min"
        }
    }

    axios.post(process.env.REACT_APP_BASE_POST_URL+`&resource=Observation&subject=Patient/${patient_id}`, data)
      .then((response) => {
      fetchRecords()
      setVisible(false)
    }).catch((e)=>{
      setVisible(false)
      console.log(e)
    })
  }

  const setAndEditModal = (item) => {
    console.log('item', item);
     var names = item.name.split(' ')
    // let editObjectSchema = {
    //   "resourceType": "Patient",
    //   "active": item.isActive,
    //   "name": [
    //     {
    //       "use": "official",
    //       "family": names[names.length-1],
    //       "given": names
    //     }
    //   ],
    //   "gender": item.gender,
    //   "birthDate": item.dob
    // }

    setEditFirstName(names[0])
    setEditLastName(names[1] ?? "")
    setEditGender(item.gender)
    setEditDob(item.dob)
    setEditStatus(item.status)

    setSelectedPatientId(item.id)
    setEditVisible(true)

  }

  const editPatient = () => {
    const data = {
      "resourceType": "Patient",
      "active": editStatus == 'on'? true:false,
      "name": [
        {
          "use": "official",
          "family": editLastName,
          "given": [
            editFirstName, editLastName
          ]
        }
      ],
      "gender": editGender,
      "birthDate": editDob
    }

    axios.put(process.env.REACT_APP_BASE_EDIT_URL+'&resource=Patient/'+selectedPatientId, data).then((response) => {
      console.log(response);
      setEditVisible(false)
    }).catch((e)=>{
      setEditVisible(false)
      console.log(e)
    })

  }

  const deleteMeasurement = () => {
    let delete_patient_url = process.env.REACT_APP_BASE_DELETE_URL+'&resource=Observation/'+selectedId;
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
          let baseUrl = process.env.REACT_APP_BASE_GET_URL+`&resource=Observation&subject=Patient/${patient_id}`;

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
            <CButton style={{float: 'right'}} onClick={() => setVisible(!visible)}>Add Measurement</CButton>

          </CCardHeader>
          <CCardBody>
              <CTable>
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
                    <CTableHeaderCell scope="col">#</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Title</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Status</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Action</CTableHeaderCell>

                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  { requesting && <CSpinner/> }
                    {carePlansList?.map((item, index) => {
                      return (
                        <CTableRow key={item.id}>
                          <CTableHeaderCell scope="row">{index+1}</CTableHeaderCell>
                          <CTableDataCell>{item.title}</CTableDataCell>
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
    <CModal visible={visible} onClose={() => setVisible(false)}>
      <CModalHeader onClose={() => setVisible(false)}>
        <CModalTitle>Add Measurement</CModalTitle>
      </CModalHeader>
      <CModalBody>

      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardBody>
              <CForm className="row g-3">
                <CCol md={6}>
                  <CFormLabel htmlFor="inputEmail4">Title</CFormLabel>
                  <CFormInput onChange={(e) => setFirstName(e.target.value)} type="text" id="inputEmail4" />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="inputPassword4">Intent</CFormLabel>
                  <CFormInput onChange={(e) => setLastName(e.target.value)} type="text" id="inputPassword4" />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="inputState">Status</CFormLabel>
                  <CFormSelect onChange={(e) => setGender(e.target.value)} id="inputState">
                    <option>Choose...</option>
                    <option value='true'>Active</option>
                    <option value='false'>InActive</option>
                  </CFormSelect>
                </CCol>
              </CForm>
          </CCardBody>
        </CCard>
      </CCol>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={() => setVisible(false)}>
          Close
        </CButton>
        <CButton color="primary" onClick={() => addPatient()}>Save changes</CButton>
      </CModalFooter>
    </CModal>

    <CModal visible={editVisible} onClose={() => setEditVisible(false)}>
      <CModalHeader onClose={() => setVisible(false)}>
        <CModalTitle>Edit Patient</CModalTitle>
      </CModalHeader>
      <CModalBody>

      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardBody>
              <CForm className="row g-3">
                <CCol md={6}>
                  <CFormLabel htmlFor="inputEmail4">First name</CFormLabel>
                  <CFormInput value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)} type="text" id="inputEmail4" />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="inputPassword4">Last name</CFormLabel>
                  <CFormInput value={editLastName} onChange={(e) => setEditLastName(e.target.value)} type="text" id="inputPassword4" />
                </CCol>
                <CCol xs={6}>
                  <CFormLabel htmlFor="inputAddress">Date of birth</CFormLabel>
                  <CFormInput value={editDob} type="date" onChange={(e) => setEditDob(e.target.value)} id="inputAddress" />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="inputState">Gender</CFormLabel>
                  <CFormSelect onChange={(e) => setEditGender(e.target.value)} id="inputState">
                    <option>Choose...</option>
                    <option selected={editGender == 'male' ? 'selected' : ''} value='male'>Male</option>
                    <option selected={editGender == 'female' ? 'selected' : ''} value='female'>Female</option>
                  </CFormSelect>
                </CCol>
                <CCol xs={12}>
                  <CFormCheck checked={editStatus ? 'checked' : ''} type="checkbox" onChange={(e) => setEditStatus(e.target.value)} id="gridCheck" label="Active" />
                </CCol>
              </CForm>
          </CCardBody>
        </CCard>
      </CCol>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={() => setEditVisible(false)}>
          Close
        </CButton>
        <CButton color="primary" onClick={() => editPatient()}>Save changes</CButton>
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
