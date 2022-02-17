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
  CFormSelect,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem, CPaginationItem, CPagination
} from '@coreui/react'
import { Link, useHistory} from 'react-router-dom'

const Patients = () => {

  const [patients, setPatients] = useState([]);
  const [requesting, setRequesting] = useState(false);
  const [visible, setVisible] = useState(false)
  const [editVisible, setEditVisible] = useState(false)
  const [deleteVisible, setDeleteVisible] = useState(false)
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

  const history = useHistory()

  useEffect(() => {
    fetchRecords();
  }, [])

  const fetchRecords = (url = null) => {
    // const get_patients_url = process.env.REACT_APP_BASE_GET_URL+'&resource=Patient?_sort=-_lastUpdated';
    // const get_patients_url = process.env.REACT_APP_BASE_GET_URL+'/Patient?_sort=lastUpdate';
    const get_patients_url = process.env.REACT_APP_BASE_URL+'/Patient?_sort=lastUpdate';

    setRequesting(true);
    axios.get(url ? url : get_patients_url).then((response) => {
      checkPagination(response.data)
      var patientsList = [];
      response.data.entry.forEach((item, index) => {
        console.log(item.resource.id)
        if(Object.keys(item.resource).includes('name')) {
          patientsList.push({
            name: item.resource?.name[0]?.given?.join(' '),
            dob: item.resource?.birthDate,
            isActive: item.resource?.active,
            gender: item.resource?.gender,
            id: item.resource?.id
          })
        }

      })
      setRequesting(false);
      setPatients(patientsList);
    }).catch((e)=>{
      console.log(e)
      setRequesting(false)
    })
  }

  const addPatient = () => {
    const data = {
      "resourceType": "Patient",
      "active": status == 'on'? true:false,
      "name": [
        {
          "use": "official",
          "family": lastName,
          "given": [
            firstName, lastName
          ]
        }
      ],
      "gender": gender,
      "birthDate": dob
    }

    axios.post(process.env.REACT_APP_BASE_URL+'/Patient', data).then((response) => {
      setVisible(false)
      fetchRecords()
    }).catch((e)=>{
      setVisible(false)
    })
  }

  const setAndEditModal = (item) => {

     var names = item.name.split(' ')

    setEditFirstName(names[0])
    setEditLastName(names[1] ?? "")
    setEditGender(item.gender)
    setEditDob(item.dob)
    setEditStatus(item.isActive)

    setSelectedPatientId(item.id)
    setEditVisible(true)

  }

  const editPatient = () => {
    const data = {
      "id": selectedPatientId,
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
    const  patients_url = process.env.REACT_APP_BASE_URL+'/Patient/'+selectedPatientId;

    // axios.put(process.env.REACT_APP_BASE_EDIT_URL+'&resource=Patient/'+selectedPatientId, data).then((response) => {
    axios.put(patients_url, data).then((response) => {
      setEditVisible(false)
      fetchRecords()
    }).catch((e)=>{
      setEditVisible(false)
      console.log(e)
    })

  }

  const patientAppointments = (id) => {
    history.push("/patients/appointments?patient_id="+id);
  }
  const patientCarePlan = (id) => {
    history.push("/patients/CarePlans?patient_id="+id);
  }
  const patientMeasurement = (id) => {
    history.push("/patients/measurements?patient_id="+id);
  }

  const deletePatient = () => {
    let delete_patient_url = process.env.REACT_APP_BASE_URL+'/Patient/'+selectedPatientId;
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

          let baseUrl = process.env.REACT_APP_BASE_GET_URL+'/Patient';
          const nextUrlWithPagination = `${baseUrl}?ct=${nextPagination}`
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
            <strong>Patients</strong> <small>listing</small>
            <CButton style={{float: 'right'}} onClick={() => setVisible(!visible)}>Add Patient</CButton>

          </CCardHeader>
          <CCardBody>
              <CTable>
                <CTableCaption>
                  <span className="float-start">List of Patient</span>
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
                    <CTableHeaderCell scope="col">Name</CTableHeaderCell>
                    <CTableHeaderCell scope="col">DOB</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Gender</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Status</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Links</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  { requesting && <CSpinner/> }
                    {patients.map((item, index) => {
                      return (
                        <CTableRow key={item.id}>
                          <CTableHeaderCell scope="row">{item.id}</CTableHeaderCell>
                          <CTableDataCell>{item.name}</CTableDataCell>
                          <CTableDataCell>{item.dob}</CTableDataCell>
                          <CTableDataCell>{item.gender}</CTableDataCell>
                          <CTableDataCell>{item.isActive ? 'Active' : 'Inactive'}</CTableDataCell>
                          <CTableDataCell>
                            {/*<a href="javascript:void(0)" onClick={() => setAndEditModal(item)}>Edit Patient</a>*/}
                            <CDropdown>
                              <CDropdownToggle href="#" color="primary">
                                View Links
                              </CDropdownToggle>
                              <CDropdownMenu>
                                <CDropdownItem href='javascript:void(0)' onClick={() => patientAppointments(item.id)}>Appointments</CDropdownItem>
                                <CDropdownItem href='javascript:void(0)' onClick={() => patientMeasurement(item.id)}>Measurements</CDropdownItem>
                                <CDropdownItem href='javascript:void(0)' onClick={() => patientCarePlan(item.id)}>Care plans</CDropdownItem>
                              </CDropdownMenu>
                            </CDropdown>
                          </CTableDataCell>

                          <CTableDataCell>
                            <CButton
                              color="success"
                              variant="outline"
                              className="m-2"
                              onClick={() => setAndEditModal(item)}
                            >
                              Edit
                            </CButton>
                            <CButton
                              color="danger"
                              variant="outline"
                              onClick={() => {setDeleteVisible(true); setSelectedPatientId(item.id)}}
                            >
                              Delete
                            </CButton>
                          </CTableDataCell>

                        </CTableRow>
                      )
                    })}
                </CTableBody>
              </CTable>
            {/*{ getPaginationHtml(pagination) }*/}
          </CCardBody>
        </CCard>
      </CCol>
    <CModal backdrop={'static'}  visible={visible} onClose={() => setVisible(false)}>
      <CModalHeader onClose={() => setVisible(false)}>
        <CModalTitle>Add Patient</CModalTitle>
      </CModalHeader>
      <CModalBody>

      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardBody>
              <CForm className="row g-3">
                <CCol md={6}>
                  <CFormLabel htmlFor="inputEmail4">First name</CFormLabel>
                  <CFormInput onChange={(e) => setFirstName(e.target.value)} type="text" id="inputEmail4" />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="inputPassword4">Last name</CFormLabel>
                  <CFormInput onChange={(e) => setLastName(e.target.value)} type="text" id="inputPassword4" />
                </CCol>
                <CCol xs={6}>
                  <CFormLabel htmlFor="inputAddress">Date of birth</CFormLabel>
                  <CFormInput type="date" onChange={(e) => setDob(e.target.value)} id="inputAddress" placeholder="1234 Main St" />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="inputState">Gender</CFormLabel>
                  <CFormSelect onChange={(e) => setGender(e.target.value)} id="inputState">
                    <option>Choose...</option>
                    <option selected={true} value='male'>Male</option>
                    <option value='female'>Female</option>
                  </CFormSelect>
                </CCol>
                <CCol xs={12}>
                  <CFormCheck type="checkbox" onChange={(e) => setStatus(e.target.value)} id="gridCheck" label="Active" />
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

    <CModal backdrop={'static'}  visible={editVisible} onClose={() => setEditVisible(false)}>
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
        <CButton color="primary" onClick={() => deletePatient()}>Confirm Delete</CButton>
      </CModalFooter>
    </CModal>
    </CRow>
  )
}

export default Patients
