import React, {useEffect, useState} from 'react'
import axios from '../../utils/axios'
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
import { Link, useHistory, useLocation } from 'react-router-dom'

const Appointments = (props) => {

  const [appointmentsList, setAppointmentsList] = useState([]);
  const [requesting, setRequesting] = useState(false);
  const [visible, setVisible] = useState(false)
  const [editVisible, setEditVisible] = useState(false)
  const [deleteVisible, setDeleteVisible] = useState(false)
  const [selectedId, setSelectedId] = useState("");
  const [patientId, setPatientId] = useState(false);


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

  const search = useLocation().search;




  const [editStatus, setEditStatus] = useState(false);
  const [editServiceTypeCode, setEditServiceTypeCode] = useState();
  const [editServiceTypeDisplay, setEditServiceTypeDisplay] = useState();
  const [editAppointmentTypeCode, setEditAppointmentTypeCode] = useState();
  const [editAppointmentTypeDisplay, setEditAppointmentTypeDisplay] = useState();
  const [editComment, setEditComment] = useState("");
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const history = useHistory()
  useEffect(() => {
    fetchAppointments();
  }, [])

  const fetchAppointments = () => {
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
  }
  const addAppointment = () => {
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
      "start":start+":00+00:00",
      "end":end+":00+00:00",
      // "start": "2021-12-15T12:00:00+00:00",
      // "end": "2021-12-15T12:30:00+00:00",
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
        fetchAppointments()
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
      "class": {
        "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
        "code": "AMB",
        "display": "ambulatory"
      },
      "appointment":[
        {
          "reference":`Appointment/${appointmentId}`
        }
      ]
    }



    axios.post(process.env.REACT_APP_BASE_POST_URL+`&resource=Encounter`, data)
      .then((response) => {
    //   updating encounter to appointment extension
        updateEncountOnAppointment(response, appointmentId)
        setVisible(false)
    }).catch((e)=>{
      setVisible(false)
      console.log(e)
    })
  }
  const updateEncountOnAppointment = (enc, appointmentId) => {
    const patient_id = new URLSearchParams(search).get('patient_id');
    const data = {
      "resourceType":"Appointment",
      "status":'booked',
      "id": appointmentId,
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
      "extension": [
        {
            "url": `http://fhir.medlix.org/StructureDefinition/${enc.data.id}`
        }
      ],
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
    axios.put(process.env.REACT_APP_BASE_EDIT_URL+`&resource=Appointment/${appointmentId}`,
      data
    ).then((resp) => {
        console.log(resp)
    }).catch((err) => {
        console.log(err)
    })
  }

  const setAndEditModal = (item) => {
    setRequesting(true)
    setSelectedId(item.id)
    const url = process.env.REACT_APP_BASE_GET_URL+'&resource=Appointment/'+item.id
    axios.get(url).then((response) => {
      const data = response.data

      setEditVisible(true)
      setRequesting(false)
      setEditStatus(data.status)
      setEditStart(data.start.replace(":00+00:00", ""))
      setEditEnd(data.end.replace(":00+00:00", ""))
      setEditServiceTypeCode(data.serviceType[0].coding[0].code)
      setEditServiceTypeDisplay(data.serviceType[0].coding[0].display)
      setEditAppointmentTypeCode(data.appointmentType.coding[0].code)
      setEditAppointmentTypeDisplay(data.appointmentType.coding[0].display)
      setEditComment(data.comment)
      // setEditVisible(true)


    }).catch((e)=>{
      setVisible(false)
      setRequesting(false)
    })
  }

  const editAppointment = () => {
    const patient_id = new URLSearchParams(search).get('patient_id');

    const data = {
      "resourceType": "Appointment",
      "id": selectedId,
      // "meta": {
      //     "versionId": "1",
      //     "lastUpdated": "2022-02-09T13:39:39.374+00:00"
      // },
      "status": "booked",
      "serviceType": [
          {
              "coding": [
                  {
                      "code": editServiceTypeCode,
                      "display": editServiceTypeDisplay
                  }
              ]
          }
      ],
      "appointmentType": {
          "coding": [
              {
                  "code": editAppointmentTypeCode,
                  "display": editAppointmentTypeDisplay
              }
          ]
      },
      "start":editStart+":00+00:00",
      "end":editEnd+":00+00:00",
      "comment": editComment,
      "participant":[
        {
          "actor":{
            "reference":"Patient/"+patient_id
          },
          "status":"accepted"
        },
      ]
    }

    axios.put(process.env.REACT_APP_BASE_EDIT_URL+'&resource=Appointment/'+selectedId, data).then((response) => {
      fetchAppointments()
      setEditVisible(false)
    }).catch((e)=>{
      setEditVisible(false)
    })

  }
  const deleteAppointment = () => {let delete_patient_url = process.env.REACT_APP_BASE_DELETE_URL+'&resource=Appointment/'+selectedId;
    setRequesting(true);
    axios.delete(delete_patient_url).then((response) => {
      setRequesting(false);
      setDeleteVisible(false);
      fetchAppointments();
    }).catch((err) => {
      setRequesting(false);
      setDeleteVisible(false);
      fetchAppointments();
    })
  }

  const navigateTasks = (item) => {
    history.push(`tasks?encounter_id=${item.id}`)
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
                              color="info"
                              variant="outline"
                              className="m-2"
                              onClick={() => navigateTasks(item)}                            >
                              Tasks
                            </CButton>
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
                    <option value='booked' selected={editStatus === 'bookend'}>Booked</option>
                    <option value='confirmed'  selected={editStatus === 'confirmed'}>Confirmed</option>
                    <option value='completed'  selected={editStatus === 'completed'}>Completed</option>

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
        <CModalTitle>Edit Appointment</CModalTitle>
      </CModalHeader>
      <CModalBody>

      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardBody>
          <CForm className="row g-3">
                <CCol md={6}>
                  <CFormLabel htmlFor="start">Start Date Time</CFormLabel>
                  <CFormInput value={editStart} type='datetime-local' onChange={(e) => setEditStart(e.target.value)} id="start" />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="end">End Date Time</CFormLabel>
                  <CFormInput value={editEnd} type='datetime-local' onChange={(e) => setEditEnd(e.target.value)} id="end" />
                </CCol>
                <CCol xs={6}>
                  <CFormLabel htmlFor="serviceTypeCode">Service Type Code</CFormLabel>
                  <CFormInput value={editServiceTypeCode} type="text" onChange={(e) => setEditServiceTypeCode(e.target.value)} id="serviceTypeCode" placeholder="Type Service Type Code" />
                </CCol>
                <CCol xs={6}>
                  <CFormLabel htmlFor="serviceType">Service Type</CFormLabel>
                  <CFormInput value={editServiceTypeDisplay} type="text" onChange={(e) => setEditServiceTypeDisplay(e.target.value)} id="serviceType" placeholder="Type Service Type" />
                </CCol>


                <CCol xs={6}>
                  <CFormLabel htmlFor="appointmentTypeCode">Appointment Type Code</CFormLabel>
                  <CFormInput value={editAppointmentTypeCode} type="text" onChange={(e) => setEditAppointmentTypeCode(e.target.value)} id="appointmentTypeCode" placeholder="Type Service Type Code" />
                </CCol>


                <CCol xs={6}>
                  <CFormLabel htmlFor="appointmentType">Appointment Type </CFormLabel>
                  <CFormInput value={editAppointmentTypeDisplay} type="text" onChange={(e) => setEditAppointmentTypeDisplay(e.target.value)} id="appointmentType" placeholder="Appointment Type" />
                </CCol>

                <CCol md={12}>
                  <CFormLabel htmlFor="comment">Comment</CFormLabel>
                  <CFormTextarea value={editComment} onChange={(e) => setEditComment(e.target.value)} id="comment"></CFormTextarea>
                </CCol>

                <CCol md={12}>
                  <CFormLabel htmlFor="status">Status</CFormLabel>
                  <CFormSelect value={editStatus} onChange={(e) => setEditStatus(e.target.value)} id="status">
                    <option>Choose...</option>
                    <option value='booked'>Booked</option>
                    <option value='confirmed'>Confirmed</option>
                    <option value='completed'>Completed</option>

                  </CFormSelect>
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
        <CButton color="primary" onClick={() => editAppointment()}>Save changes</CButton>
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
        <CButton color="primary" onClick={() => deleteAppointment()}>Confirm Delete</CButton>
      </CModalFooter>
    </CModal>

    </CRow>
  )
}

export default Appointments
