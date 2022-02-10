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
import { Link, useLocation } from 'react-router-dom'

const Tasks = (props) => {

  const [tasksList, setTasksList] = useState([]);
  const [requesting, setRequesting] = useState(false);
  const [visible, setVisible] = useState(false)
  const [editVisible, setEditVisible] = useState(false)
  const [deleteVisible, setDeleteVisible] = useState(false)
  const [selectedId, setSelectedId] = useState(false);
  const [encounterId, setEncounterId] = useState(false);
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


  const [selectedPatientId, setSelectedPatientId] = useState(false);
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


  useEffect(() => {
    fetchAppointments();
  }, [])

  const fetchAppointments = () => {
    const encounter_id = new URLSearchParams(search).get('encounter_id');
    const patient_id = new URLSearchParams(search).get('patient_id');

    setEncounterId(encounter_id)
    setPatientId(patient_id)

    let get_tasks_url = process.env.REACT_APP_BASE_GET_URL+`&resource=Task&encounter=${encounter_id}`;
    setRequesting(true);
    axios.get(get_tasks_url).then((response) => {
      var tasksList = [];
      console.log(response)
      response.data.entry?.forEach((item, index) => {
        tasksList.push({
            id: item.resource.id,
            description: item.resource.description,
            period: item.resource.executionPeriod.start,
            order: item.resource.intent,
            priority: item.resource.priority,
            status: item.resource.status,
            description: item.resource.description
        })
      })
      console.log(tasksList)
      setRequesting(false);
      setTasksList(tasksList);
    })
  }

  const addAppointment = () => {
    const patient_id = new URLSearchParams(search).get('patient_id');
    const data = {
      "resourceType": "Task",
      "id": "e180f26c-2b98-48cf-a35a-b1cfcadb000b",
                
                "extension": [
                    {
                        "url": "http://fhir.medlix.org/StructureDefinition/task-cms-id",
                        "valueString": "1"
                    },
                    {
                        "url": "http://fhir.medlix.org/StructureDefinition/time-since-last-execution",
                        "valueString": "2022-05-11T16:00:00.0000000+00:00"
                    }
                ],
                "groupIdentifier": {
                    "value": "de589d09-f57a-43bb-696c-5568282559b1"
                },
                "status": "accepted",
                "statusReason": {
                    "text": "Created"
                },
                "intent": "order",
                "priority": "routine",
                "code": {
                    "coding": [
                        {
                            "code": "tasks.measurement"
                        }
                    ]
                },
                "description": "Temperature measurement",
                "encounter": {
                    "reference": `Encounter/${encounterId}`
                },
                "executionPeriod": {
                    "start": "2022-01-28T16:00:00.6831150Z"
                },
                "authoredOn": "2022-01-25T14:54:10.6831150Z",
                "lastModified": "2022-01-25T14:54:10.6831150Z",
                "owner": {
                    "reference": `Patient/${patient_id}`
                }
      
    }



    axios.post(process.env.REACT_APP_BASE_POST_URL+`&resource=Task&encounter=${encounterId}`, data)
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


    //   updating encounter to appointment extension


      setVisible(false)
    }).catch((e)=>{
      setVisible(false)
      console.log(e)
    })
  }

  const setAndEditModal = (item) => {
    console.log('item', item);
    setEditComment(item.comment)
    setEditStart(item.start)
    // setEditAppointmentTypeCode('123');
    setEditStatus(item.status)
    setSelectedPatientId(item.id)
    setEditVisible(true)
  }

  const editPatient = () => {
    const data = {
      "resourceType": "Appointment",
      "id": "279260f5-aa63-4893-86ef-363a39b8f24d",
      "meta": {
          "versionId": "1",
          "lastUpdated": "2022-02-09T13:39:39.374+00:00"
      },
      "status": "booked",
      "serviceType": [
          {
              "coding": [
                  {
                      "code": "Omnis ea itaque elit",
                      "display": "Accusantium mollit a"
                  }
              ]
          }
      ],
      "appointmentType": {
          "coding": [
              {
                  "code": "Quam consectetur ac",
                  "display": "Et nesciunt esse do"
              }
          ]
      },
      "start": "2021-12-15T12:00:00+00:00",
      "end": "2021-12-15T12:30:00+00:00",
      "comment": "Enim commodi aut non",
      "participant": [
          {
              "actor": {
                  "reference": "Patient/9e909e52-61a1-be50-1878-a12ef8c36346"
              },
              "status": "accepted"
          }
      ]
  }

    axios.put(process.env.REACT_APP_BASE_EDIT_URL+'&resource=Patient/'+selectedPatientId, data).then((response) => {
      console.log(response);
      setEditVisible(false)
    }).catch((e)=>{
      setEditVisible(false)
      console.log(e)
    })

  }

  const deleteTask = () => {
    let delete_task_url = process.env.REACT_APP_BASE_DELETE_URL+`&resource=Task/${selectedId}`;
    setRequesting(true);
    axios.delete(delete_task_url).then((response) => {
      setRequesting(false);
      setDeleteVisible(false);
      fetchAppointments();
    }).catch((err) => {
      setRequesting(false);
      setDeleteVisible(false);
      fetchAppointments();
    })
  }




  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Tasks</strong> <small>listing</small>
            <CButton style={{float: 'right'}} onClick={() => setVisible(!visible)}>Add task</CButton>

          </CCardHeader>
          <CCardBody>
              <CTable>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">#</CTableHeaderCell>
                    {/*<CTableHeaderCell scope="col">ID</CTableHeaderCell>*/}
                    <CTableHeaderCell scope="col">Id</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Order</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Period</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Priority</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Description</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Status</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
                  
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  { requesting && <CSpinner/> }
                    {tasksList?.map((item, index) => {
                      return (
                        <CTableRow key={item.id}>
                          <CTableHeaderCell scope="row">{index+1}</CTableHeaderCell>
                          {/*<CTableDataCell>{item.id}</CTableDataCell>*/}
                          <CTableDataCell>{item.order}</CTableDataCell>
                          <CTableDataCell>{item.period}</CTableDataCell>
                          <CTableDataCell>{item.priority}</CTableDataCell>
                          <CTableDataCell>
                            {item.description}
                          </CTableDataCell>
                          <CTableDataCell>{item.description}</CTableDataCell>
                          <CTableDataCell>{item.status}</CTableDataCell>
                          
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
        <CModalTitle>Add Task</CModalTitle>
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
        <CModalTitle>Edit Task</CModalTitle>
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
        <CButton color="primary" onClick={() => deleteTask()}>Confirm Delete</CButton>
      </CModalFooter>
    </CModal>

    </CRow>
  )
}

export default Tasks
