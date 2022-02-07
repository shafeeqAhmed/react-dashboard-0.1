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
  CFormSelect
} from '@coreui/react'
import { DocsCallout, DocsExample } from 'src/components'
import { Link, useHistory} from 'react-router-dom'

const Patients = () => {

  const [patients, setPatients] = useState([]);
  const [requesting, setRequesting] = useState(false);
  const [visible, setVisible] = useState(false)
  const [editVisible, setEditVisible] = useState(false)

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
    let get_patients_url = process.env.REACT_APP_BASE_GET_URL+'&resource=Patient';
    setRequesting(true);
    axios.get(get_patients_url).then((response) => {
      var patientsList = [];
      response.data.entry.forEach((item, index) => {
        patientsList.push({
            name: item.resource?.name[0]?.given?.join(' '),
            dob: item.resource?.birthDate,
            isActive: item.resource?.active,
            gender: item.resource?.gender,
            id: item.resource?.id
        })
      })
      console.log(patientsList)
      setRequesting(false);
      setPatients(patientsList);
    })
  }, [])

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

    axios.post(process.env.REACT_APP_BASE_POST_URL+'&resource=Patient', data).then((response) => {
      console.log(response);
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

  const patientAppointments = (id) => {
    history.push("/appointments?patient_id="+id);
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
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">#</CTableHeaderCell>
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
                          <CTableHeaderCell scope="row">{index+1}</CTableHeaderCell>
                          <CTableDataCell>{item.name}</CTableDataCell>
                          <CTableDataCell>{item.dob}</CTableDataCell>
                          <CTableDataCell>{item.gender}</CTableDataCell>
                          <CTableDataCell>{item.isActive ? 'Active' : 'Inactive'}</CTableDataCell>
                          <CTableDataCell>
                            <a href='javascript:void(0)' onClick={() => patientAppointments(item.id)}>Appointments</a>
                            {/* <small><a href='#'>Measurements</a> &nbsp; </small>
                            <small><a href='#'>Care Plans</a></small> */}
                          </CTableDataCell>
                          <CTableDataCell>
                            <a href="javascript:void(0)" onClick={() => setAndEditModal(item)}>Edit Patient</a>
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
                    <option value='male'>Male</option>
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

    </CRow>
  )
}

export default Patients
