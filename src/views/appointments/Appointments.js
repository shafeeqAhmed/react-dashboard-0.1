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
  CFormSelect, CFormTextarea
} from '@coreui/react'
import { DocsCallout, DocsExample } from 'src/components'
import { Link, useLocation } from 'react-router-dom'

const Appointments = (props) => {

  const [appointmentsList, setAppointmentsList] = useState([]);
  const [requesting, setRequesting] = useState(false);
  const [visible, setVisible] = useState(false)
  const [editVisible, setEditVisible] = useState(false)
  const [deleteVisible, setDeleteVisible] = useState(false)
  const [selectedId, setSelectedId] = useState(false);

  // new Appointment fields

  const [status, setStatus] = useState(false);
  const [serviceTypeCode, setServiceTypeCode] = useState();
  const [serviceTypeDisplay, setServiceTypeDisplay] = useState();
  const [appointmentTypeCode, setAppointmentTypeCode] = useState();
  const [appointmentTypeDisplay, setAppointmentTypeDisplay] = useState();
  const [comment, setComment] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [description, setDescription] = useState("");






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
        appointmentList.push({
            // name: item.resource?.name[0]?.given?.join(' '),
            id: item.resource.id,
            start: item.resource.start,
            end: item.resource.end,
            comment: item.resource.comment,
            status: item.resource.status,
        })
      })
      setRequesting(false);
      setAppointmentsList(appointmentList);
    })
  }, [])

  const addAppointment = () => {
    console.log(start)
    console.log(end)
    const patient_id = new URLSearchParams(search).get('patient_id');
    const data = {
      "resourceType":"Appointment",
      "status":'booked',
      "serviceType":[
        {
          "coding":[
            {
              "code":serviceTypeCode,
              "display":serviceTypeDisplay
            }
          ]
        }
      ],
      "appointmentType":{
        "coding":[
          {
            "code":appointmentTypeCode,
            "display":appointmentTypeDisplay
          }
        ]
      },
      // "start":start,
      // "end":end,
      "start": "2021-12-15T12:00:00+00:00",
      "end": "2021-12-15T12:30:00+00:00",
      "comment":comment,
      "participant":[
        {
          "actor":{
            "reference":"Patient/"+patient_id
          },
          "status":"accepted"
        },
      ]
    }



    axios.post(process.env.REACT_APP_BASE_POST_URL+`&resource=Appointment&actor=Patient/${patientId}&_sort=appointment-sort-start`, data)
      .then((response) => {
      addAppointmentEncounter(response.data.id);
      setVisible(false)
    }).catch((e)=>{
      setVisible(false)
      console.log(e)
    })
  }
  const addAppointmentEncounter = (appointmentId) => {
    const patient_id = new URLSearchParams(search).get('patient_id');
    const data = {
      "resourceType":"Encounter",
      "subject":{"reference":"Patient/"+patient_id},
      "status":"planned",
      "appointment":[
        {
          "reference":`Appointment/${appointmentId}`
        }
      ]
    }

    axios.post(process.env.REACT_APP_BASE_POST_URL+`&resource=Encounter`, data)
      .then((response) => {
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
                    {/*<CTableHeaderCell scope="col">ID</CTableHeaderCell>*/}
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
                          {/*<CTableDataCell>{item.id}</CTableDataCell>*/}
                          <CTableDataCell>{item.start}</CTableDataCell>
                          <CTableDataCell>{item.end}</CTableDataCell>
                          <CTableDataCell>{item.status}</CTableDataCell>
                          <CTableDataCell>
                            {item.comment}
                          </CTableDataCell>
                          {/*<CTableDataCell>*/}
                          {/*  <a href="javascript:void(0)" onClick={() => setAndEditModal(item)}>Edit Appointment</a>*/}
                          {/*</CTableDataCell>*/}
                          <CTableDataCell>
                            <CButton
                              color="success"
                              variant="outline"
                              className="m-2"
                              onClick={() => setAndEditModal(item)}                            >
                              Edit
                            </CButton>
                            <CButton
                              color="danger"
                              variant="outline"
                              onClick={() => {setDeleteVisible(true); setSelectedId(item.id)}}
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
        <CModalTitle>Add Appointment</CModalTitle>
      </CModalHeader>
      <CModalBody>

      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardBody>
              <CForm className="row g-3">
                <CCol md={6}>
                  <CFormLabel htmlFor="start">Start Date Time</CFormLabel>
                  <CFormInput type='datetime-local' onChange={(e) => setStart(e.target.value)} id="start" />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="end">End Date Time</CFormLabel>
                  <CFormInput type='datetime-local' onChange={(e) => setEnd(e.target.value)} id="end" />
                </CCol>
                <CCol xs={6}>
                  <CFormLabel htmlFor="serviceTypeCode">Service Type Code</CFormLabel>
                  <CFormInput type="text" onChange={(e) => setServiceTypeCode(e.target.value)} id="serviceTypeCode" placeholder="Type Service Type Code" />
                </CCol>
                <CCol xs={6}>
                  <CFormLabel htmlFor="serviceType">Service Type</CFormLabel>
                  <CFormInput type="text" onChange={(e) => setServiceTypeDisplay(e.target.value)} id="serviceType" placeholder="Type Service Type" />
                </CCol>


                <CCol xs={6}>
                  <CFormLabel htmlFor="appointmentTypeCode">Appointment Type Code</CFormLabel>
                  <CFormInput type="text" onChange={(e) => setAppointmentTypeCode(e.target.value)} id="appointmentTypeCode" placeholder="Type Service Type Code" />
                </CCol>


                <CCol xs={6}>
                  <CFormLabel htmlFor="appointmentType">Appointment Type </CFormLabel>
                  <CFormInput type="text" onChange={(e) => setAppointmentTypeDisplay(e.target.value)} id="appointmentType" placeholder="Appointment Type" />
                </CCol>

                <CCol md={12}>
                  <CFormLabel htmlFor="comment">Comment</CFormLabel>
                  <CFormTextarea onChange={(e) => setComment(e.target.value)} id="comment"></CFormTextarea>
                </CCol>

                <CCol md={12}>
                  <CFormLabel htmlFor="status">Status</CFormLabel>
                  <CFormSelect onChange={(e) => setStatus(e.target.value)} id="status">
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
        <CButton color="primary" onClick={() => addAppointment()}>Save changes</CButton>
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
