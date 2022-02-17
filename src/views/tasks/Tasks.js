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
  CFormSelect, CFormTextarea, CPagination, CPaginationItem
} from '@coreui/react'
import {DocsCallout, DocsExample} from 'src/components'
import {Link, useLocation} from 'react-router-dom'

const Tasks = (props) => {

  const [searching, setSearching] = React.useState(true)
  const [tasksList, setTasksList] = useState([]);
  const [requesting, setRequesting] = useState(false);
  const [visible, setVisible] = useState(false)
  const [editVisible, setEditVisible] = useState(false)
  const [deleteVisible, setDeleteVisible] = useState(false)
  const [selectedId, setSelectedId] = useState(false);
  const [patientId, setPatientId] = useState(false);
  const [encounterId, setEncounterId] = useState(false);
  const [urlPagination, setUrlPagination] = React.useState(null)
  const [isFirstPage, setIsFirstPage] = React.useState(true)

  // new Appointment fields

  const [status, setStatus] = useState();
  const [priority, setPriority] = useState();
  const [code, setCode] = useState();
  const [description, setDescription] = useState("");
  const [cmsId, setCmsId] = useState("");
  const [executionStart, setExecutionStart] = useState("")
  const [executionEnd, setExecutionEnd] = useState("")


  const search = useLocation().search;


  const [editStatus, setEditStatus] = useState(false);
  const [editPriority, setEditPriority] = useState();
  const [editCode, setEditCode] = useState();
  const [editDescription, setEditDescription] = useState("");
  const [editCmsId, setEditCmsId] = useState("");
  const [editPeriod, setEditPeriod] = useState("");
  const [editExecutionStart, setEditExecutionStart] = useState("")
  const [editExecutionEnd, setEditExecutionEnd] = useState("")


  useEffect(() => {
    fetchTask();
  }, [])

  const fetchTask = (url = null) => {
    const patient_id = new URLSearchParams(search).get('patient_id');
    const encounter_id = new URLSearchParams(search).get('encounter_id');
    setPatientId(patient_id)
    setEncounterId(encounter_id)

    let tasks_url = process.env.REACT_APP_BASE_URL+`/Task?encounter=${encounter_id}`;

    setRequesting(true);
    axios.get(url ? url : tasks_url).then((response) => {
      checkPagination(response.data)
      var tasksList = [];
      response.data.entry?.forEach((item, index) => {
        tasksList.push({
          id: item.resource.id,
          period: item.resource.executionPeriod?.start,
          order: item.resource.intent,
          priority: item.resource.priority,
          status: item.resource.status,
          description: item.resource.description,
          cmsId: item.resource.extension[0].valueString,
          exStart: item.resource.executionPeriod?.start,
          exEnd: item.resource.executionPeriod?.end
        })
      })
      setRequesting(false);
      setTasksList(tasksList);
    }).catch((error => {
      console.log(error)
      setRequesting(false)
    }))
  }

  const addTask = () => {
    setRequesting(true)
    const patient_id = new URLSearchParams(search).get('patient_id');
    const encounterId = new URLSearchParams(search).get('encounter_id');
    const data = {
      "resourceType": "Task",
      // "id": "e180f26c-2b98-48cf-a35a-b1cfcadb000b",
      "extension": [
        {
          "url": "http://fhir.medlix.org/StructureDefinition/task-cms-id",
          "valueString": cmsId
        },
        // {
        //   "url": "http://fhir.medlix.org/StructureDefinition/time-since-last-execution",
        //   "valueString": "2022-05-11T16:00:00.0000000+00:00"
        // }
      ],
      // "groupIdentifier": {
      //   "value": "de589d09-f57a-43bb-696c-5568282559b1"
      // },
      "status": "accepted",
      // "status": status,
      "statusReason": {
        "text": "Created"
      },
      "intent": "order",
      "priority": "routine",
      // "priority": priority,
      "code": {
        "coding": [
          {
            // "code": "tasks.measurement"
            "code": code
          }
        ]
      },
      "description": description,
      "encounter": {
        "reference": `Encounter/${encounterId}`
      },
      "executionPeriod": {
        "start": executionStart,
        "end": executionEnd
      },
      "authoredOn": "2022-01-25T14:54:10.6831150Z",
      "lastModified": "2022-01-25T14:54:10.6831150Z",
      "owner": {
        "reference": `Patient/${patient_id}`
      }

    }

    let tasks_url = process.env.REACT_APP_BASE_URL+`/Task?encounter=${encounterId}`;

    axios.post(tasks_url, data)
      .then((response) => {
        fetchTask()
        setVisible(false)
        setRequesting(false)
      }).catch((e) => {
      setVisible(false)
      setRequesting(false)
    })
  }
  const editTask = () => {
    const patient_id = new URLSearchParams(search).get('patient_id');
    const encounterId = new URLSearchParams(search).get('encounter_id');
    setRequesting(true)
    const data = {
      "resourceType": "Task",
      "id": selectedId,
      "extension": [
        {
          "url": "http://fhir.medlix.org/StructureDefinition/task-cms-id",
          "valueString": editCmsId
        },
        // {
        //   "url": "http://fhir.medlix.org/StructureDefinition/time-since-last-execution",
        //   "valueString": "2022-05-11T16:00:00.0000000+00:00"
        // }
      ],
      // "groupIdentifier": {
      //   "value": "de589d09-f57a-43bb-696c-5568282559b1"
      // },
      // "status": "accepted",
      "status": editStatus,
      "statusReason": {
        "text": "Created"
      },
      "intent": "order",
      "priority": "routine",
      // "priority": editPriority,
      "code": {
        "coding": [
          {
            "code": "tasks.measurement"
            // "code": code
          }
        ]
      },
      "description": editDescription,
      // "description": 'description',
      "encounter": {
        "reference": `Encounter/${encounterId}`
      },
      "executionPeriod": {
        "start": editExecutionStart,
        "end": editExecutionEnd
      },
      "authoredOn": "2022-01-25T14:54:10.6831150Z",
      "lastModified": "2022-01-25T14:54:10.6831150Z",
      "owner": {
        "reference": `Patient/${patient_id}`
      }

    }
    let tasks_url = process.env.REACT_APP_BASE_URL+`/Task?encounter=${selectedId}`;

    axios.put(tasks_url, data)
    // axios.put(tasks_url, data)

      .then((response) => {
      setRequesting(false)
      setEditVisible(false)
        fetchTask()
    }).catch((e) => {
      setEditVisible(false)
      setRequesting(true)
    })
  }

  const setAndEditModal = (item) => {
    // setRequesting(true)
    console.log(item)
    setSelectedId(item.id)
    setEditStatus(item.status)
    setEditPriority(item.priority)
    setEditCmsId(item.cmsId)
    setEditPeriod(item.period)
    setEditDescription(item.description)
    setEditVisible(true)
    setEditExecutionStart(item.exStart)
    setEditExecutionEnd(item.exEnd)

  }
  const deleteTask = () => {
    let delete_task_url = process.env.REACT_APP_BASE_URL+`/Task/${selectedId}`;

    setRequesting(true);
    axios.delete(delete_task_url).then((response) => {
      setRequesting(false);
      setDeleteVisible(false);
      fetchTask();
    }).catch((err) => {
      setRequesting(false);
      setDeleteVisible(false);
      fetchTask();
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
          let baseUrl = process.env.REACT_APP_BASE_URL+`/Task?encounter=${encounterId}`;

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
      fetchTask(urlPagination)
    }
  }
  const handleFirstPagination = () => {
    setIsFirstPage(true)
    fetchTask()
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
              <CTableCaption>
                <span className="float-start">List of Tasks</span>
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
                  {/*<CTableHeaderCell scope="col">ID</CTableHeaderCell>*/}
                  <CTableHeaderCell scope="col">Start</CTableHeaderCell>
                  <CTableHeaderCell scope="col">End</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Priority</CTableHeaderCell>
                  <CTableHeaderCell scope="col">CMS ID</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Description</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Status</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Actions</CTableHeaderCell>

                </CTableRow>
              </CTableHead>
              <CTableBody>
                {requesting && <CSpinner/>}
                {tasksList?.map((item, index) => {
                  return (
                    <CTableRow key={item.id}>
                      <CTableHeaderCell scope="row">{item.id}</CTableHeaderCell>
                      {/*<CTableDataCell>{item.id}</CTableDataCell>*/}
                      <CTableDataCell>{item.exStart}</CTableDataCell>
                      <CTableDataCell>{item.exEnd}</CTableDataCell>
                      <CTableDataCell>{item.priority}</CTableDataCell>
                      <CTableDataCell>{item.cmsId}</CTableDataCell>
                      <CTableDataCell>{item.description}</CTableDataCell>
                      <CTableDataCell>{item.status}</CTableDataCell>

                      <CTableDataCell>
                        <CButton
                          color="success"
                          variant="outline"
                          className="m-2"
                          onClick={() => setAndEditModal(item)}>
                          Edit
                        </CButton>
                        <CButton
                          color="danger"
                          variant="outline"
                          onClick={() => {
                            setDeleteVisible(true);
                            setSelectedId(item.id)
                          }}
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
          <CModalTitle>Add Task</CModalTitle>
        </CModalHeader>
        <CModalBody>

          <CCol xs={12}>
            <CCard className="mb-4">
              <CCardBody>
                <CForm className="row g-3">
                  <CCol xs={12}>
                    <CFormLabel htmlFor="cmsid">CMS ID </CFormLabel>
                    <CFormInput type="number" onChange={(e) => setCmsId(e.target.value)}
                                id="cmsid" placeholder="CMS id"/>
                  </CCol>
                  <CCol md={12}>
                    <CFormLabel htmlFor="priority">Priority</CFormLabel>
                    <CFormSelect onChange={(e) => setPriority(e.target.value)} id="priority">
                      <option>Choose...</option>
                      <option selected={true} value='routine'>Routine</option>
                    </CFormSelect>
                  </CCol>

                  <CCol md={6}>
                  <CFormLabel htmlFor="start">Execution Start </CFormLabel>
                    <CFormInput type='datetime-local' onChange={(e) => setExecutionStart(e.target.value)}  id="start" />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="end">Execution End </CFormLabel>
                  <CFormInput  type='datetime-local' onChange={(e) => setExecutionEnd(e.target.value)} id="end" />
                </CCol>

                  <CCol md={12}>
                    <CFormLabel htmlFor="code">Code</CFormLabel>
                    <CFormSelect onChange={(e) => setCode(e.target.value)} id="code">
                      <option>Choose...</option>
                      <option selected={true} value='tasks.simple-task'>Simple Task</option>
                      <option value='tasks.measurement'>Measurement</option>
                      <option value='tasks.questionnaire'>Questionnaire</option>
                    </CFormSelect>
                  </CCol>

                  <CCol md={12}>
                    <CFormLabel htmlFor="description">Description</CFormLabel>
                    <CFormTextarea onChange={(e) => setDescription(e.target.value)} id="description"></CFormTextarea>
                  </CCol>
                  <CCol md={12}>
                    <CFormLabel htmlFor="status">Status</CFormLabel>
                    <CFormSelect onChange={(e) => setStatus(e.target.value)} id="status">
                      <option>Choose...</option>
                      <option selected={true} value='accepted'>Accepted</option>
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
          <CButton color="primary" onClick={() => addTask()}>Save changes</CButton>
        </CModalFooter>
      </CModal>

      <CModal backdrop={'static'}  visible={editVisible} onClose={() => setEditVisible(false)}>
        <CModalHeader onClose={() => setVisible(false)}>
          <CModalTitle>Edit Task</CModalTitle>
        </CModalHeader>
        <CModalBody>

          <CCol xs={12}>
            <CCard className="mb-4">
              <CCardBody>
                <CForm className="row g-3">
                  <CCol xs={12}>
                    <CFormLabel htmlFor="cmsid">CMS ID </CFormLabel>
                    <CFormInput type="number" onChange={(e) => setEditCmsId(e.target.value)}
                                value={editCmsId}
                                id="cmsid" placeholder="CMS id"/>
                  </CCol>
                  <CCol md={12}>
                    <CFormLabel htmlFor="priority">Priority</CFormLabel>
                    <CFormSelect onChange={(e) => setEditPriority(e.target.value)} id="priority">
                      <option>Choose...</option>
                      <option selected={true} value='routine'>Routine</option>
                    </CFormSelect>
                  </CCol>

                  <CCol md={6}>
                  <CFormLabel htmlFor="start">Execution Start</CFormLabel>
                  <CFormInput value={editExecutionStart} type='datetime-local' onChange={(e) => setEditExecutionStart(e.target.value)} id="start" />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="end">Execution End</CFormLabel>
                  <CFormInput value={editExecutionEnd} type='datetime-local' onChange={(e) => setEditExecutionEnd(e.target.value)} id="end" />
                </CCol>

                  <CCol md={12}>
                    <CFormLabel htmlFor="code">Code</CFormLabel>
                    <CFormSelect onChange={(e) => setEditCode(e.target.value)} id="code">
                      <option>Choose...</option>
                      <option value='tasks.simple-task'>Simple Task</option>
                      <option selected={true} value='tasks.measurement'>Measurement</option>
                      <option value='tasks.questionnaire'>Questionnaire</option>
                    </CFormSelect>
                  </CCol>

                  <CCol md={12}>
                    <CFormLabel htmlFor="description">Description</CFormLabel>
                    <CFormTextarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} id="description"></CFormTextarea>
                  </CCol>
                  <CCol md={12}>
                    <CFormLabel htmlFor="status">Status</CFormLabel>
                    <CFormSelect onChange={(e) => setEditStatus(e.target.value)} id="status">
                      <option>Choose...</option>
                      <option selected={true} value='accepted'>Accepted</option>
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
          <CButton color="primary" onClick={() => editTask()}>Save changes</CButton>
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
