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
import { Link, useLocation } from 'react-router-dom'

const Appointments = (props) => {

  const [appointmentsList, setAppointmentsList] = useState([]);
  const [requesting, setRequesting] = useState(false);
  const [visible, setVisible] = useState(false)
  const [editVisible, setEditVisible] = useState(false)
  const [deleteVisible, setDeleteVisible] = useState(false)

  // new patient fields
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [comment, setComment] = useState("");
  const [description, setDescription] = useState("");
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
  const [patientId, setPatientId] = useState(false)


  useEffect(() => {
    const patient_id = new URLSearchParams(search).get('patient_id');
    setPatientId(patient_id)
    let get_patients_url = process.env.REACT_APP_BASE_GET_URL+`&resource=Appointment&actor=Patient/${patient_id}&_sort=appointment-sort-start`;
    setRequesting(true);
    axios.get(get_patients_url).then((response) => {
      var appointmentList = [];
      response.data.entry?.forEach((item, index) => {
          console.log(item)
        appointmentList.push({
            // name: item.resource?.name[0]?.given?.join(' '),
            id: item.resource.id,
            start: item.resource.start,
            end: item.resource.end,
            comment: item.resource.comment,
            status: item.resource.status,
        })
      })
      console.log(response);
      console.log(appointmentList)
      setRequesting(false);
      setAppointmentsList(appointmentList);
    })
  }, [])

  const addPatient = () => {
    // const data = {
    //   "resourceType": "Patient",
    //   "active": status == 'on'? true:false,
    //   "name": [
    //     {
    //       "use": "official",
    //       "family": lastName,
    //       "given": [
    //         firstName, lastName
    //       ]
    //     }
    //   ],
    //   "gender": gender,
    //   "birthDate": dob
    // }

    const data1 = {
      "resourceType": "Appointment",
        "status": "booked",
        
        // "appointmentType": {
        //     "coding": [
        //         {
        //             "system": "http://terminology.hl7.org/CodeSystem/v2-0276",
        //             "code": "FOLLOWUP",
        //             "display": "A follow up visit from a previous appointment"
        //         }
        //     ]
        // },
        "priority": 5,
        "description": "Discussion on the results of your recent MRI",
        "start": "2021-12-15T12:00:00+00:00",
        "end": "2021-12-15T12:30:00+00:00",
        "comment": "Further expand on the results of the MRI and determine the next actions that may be appropriate."    
    }

    axios.post(process.env.REACT_APP_BASE_POST_URL+`&resource=Appointment&actor=Patient/${patientId}`, data1).then((response) => {
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


  const deletePatient = () => {
    let delete_patient_url = process.env.REACT_APP_BASE_DELETE_URL+'&resource=Patient/'+selectedPatientId;
    setRequesting(true);
    axios.delete(delete_patient_url).then((response) => {
      setRequesting(false);
      setDeleteVisible(false);
      // fetchPatients();
    }).catch((err) => {
      setRequesting(false);
      setDeleteVisible(false);
      // fetchPatients();
    })
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Appointments</strong> <small>listing</small>
            <CButton style={{float: 'right'}} onClick={() => setVisible(!visible)}>Add appointment</CButton>

          </CCardHeader>
          <CCardBody>
              <CTable>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">#</CTableHeaderCell>
                    <CTableHeaderCell scope="col">ID</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Start</CTableHeaderCell>
                    <CTableHeaderCell scope="col">End</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Status</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Comment</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  { requesting && <CSpinner/> }
                    {appointmentsList?.map((item, index) => {
                      return (
                        <CTableRow key={item.id}>
                          <CTableHeaderCell scope="row">{index+1}</CTableHeaderCell>
                          <CTableDataCell>{item.id}</CTableDataCell>
                          <CTableDataCell>{item.start}</CTableDataCell>
                          <CTableDataCell>{item.end}</CTableDataCell>
                          <CTableDataCell>{item.status}</CTableDataCell>
                          <CTableDataCell>
                            {item.comment}
                          </CTableDataCell>
                          <CTableDataCell>
                            <a href="javascript:void(0)" onClick={() => setAndEditModal(item)}>Edit Appointment</a>
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
        <CModalTitle>Add Appointment</CModalTitle>
      </CModalHeader>
      <CModalBody>

      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardBody>
              <CForm className="row g-3">
                <CCol md={6}>
                  <CFormLabel htmlFor="inputEmail4">Start</CFormLabel>
                  <CFormInput type='date' onChange={(e) => setStart(e.target.value)} id="inputEmail4" />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="inputPassword4">Last name</CFormLabel>
                  <CFormInput type='date' onChange={(e) => setEnd(e.target.value)} id="inputPassword4" />
                </CCol>
                <CCol xs={12}>
                  <CFormLabel htmlFor="inputAddress">Date of birth</CFormLabel>
                  <CFormInput type="text" onChange={(e) => setComment(e.target.value)} id="inputAddress" placeholder="" />
                </CCol>
                <CCol xs={12}>
                  <CFormLabel htmlFor="inputAddress">Date of birth</CFormLabel>
                  <CFormInput type="text" onChange={(e) => setDescription(e.target.value)} id="inputAddress" placeholder="1234 Main St" />
                </CCol>
                <CCol md={12}>
                  <CFormLabel htmlFor="inputState">Status</CFormLabel>
                  <CFormSelect onChange={(e) => setStatus(e.target.value)} id="inputState">
                    <option>Choose...</option>
                    <option value='Booked'>Booked</option>
                    <option value='Confirmed'>Confirmed</option>
                    <option value='Completed'>Completed</option>
                    
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

    </CRow>
  )
}

export default Appointments
