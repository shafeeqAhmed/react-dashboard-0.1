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
  const [urlPagination, setUrlPagination] = React.useState(null)
  const [isFirstPage, setIsFirstPage] = React.useState(true)
  const [searching, setSearching] = React.useState(true)

  // new Appointment fields

  const [status, setStatus] = useState(false);
  const [serviceTypeCode, setServiceTypeCode] = useState();
  const [serviceTypeDisplay, setServiceTypeDisplay] = useState();
  const [appointmentTypeCode, setAppointmentTypeCode] = useState();
  const [appointmentTypeDisplay, setAppointmentTypeDisplay] = useState();
  const [calenderCode, setCalenderCode] = useState();
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
  const [editCalenderCode, setEditCalenderCode] = useState();
  const [editEncounterId, seteditEncounterId] = useState();
  const [editComment, setEditComment] = useState("");
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const history = useHistory()
  useEffect(() => {
    fetchRecords();
  }, [])

  const fetchRecords = (url = null) => {
    const patient_id = new URLSearchParams(search).get('patient_id');
    setPatientId(patient_id)
    let patients_url = process.env.REACT_APP_BASE_URL+`/Appointment?actor=Patient/${patient_id}?_sort=lastUpdate`;
    setRequesting(true);
    axios.get(url ? url : patients_url)
      .then((response) => {
      checkPagination(response.data)
      var appointmentList = [];
      response.data.entry?.forEach((item, index) => {
        appointmentList.push({
            id: item.resource.id,
            start: item.resource?.start,
            service_type: item.resource?.appointmentType.coding[0].code,
            appointment_type: item.resource?.serviceType[0]?.coding[0].code,
            end: item.resource?.end,
            comment: item.resource?.comment,
            status: item.resource?.status,
            encounter_id: getRecordValue(item,0),
            calenderCode: getRecordValue(item,1)
        })
      })
      setRequesting(false);
      setAppointmentsList(appointmentList);
    }).catch(error => {
      console.log(error)
    })
  }
  const addAppointment = () => {
    const patient_id = new URLSearchParams(search).get('patient_id');
    const data = {
      "resourceType":"Appointment",
      "status": status,
      "extension": [
        {
          "url": "http://fhir.medlix.org/StructureDefinition/appointment-schedule-id",
          "valueString": calenderCode
        }
        ],
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


    let patients_url = process.env.REACT_APP_BASE_URL+`/Appointment?actor=Patient/${patient_id}`;

    axios.post(patients_url, data)
      .then((response) => {
      addAppointmentEncounter(response.data.id);
      setVisible(false)
    }).catch((e)=>{
      alert('this is something going wrong please try again!')
      // setVisible(false)
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
    let url = process.env.REACT_APP_BASE_URL+`/Encounter?Appointment=${appointmentId}`;

    axios.post(url, data)
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
      "status":status,
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
            "url": 'encounter-id',
            "valueString": `${enc.data.id}`
        },
        {
          "url": "http://fhir.medlix.org/StructureDefinition/appointment-schedule-id",
          "valueString": calenderCode
        }
      ],
      "comment":comment,
      "start":start+":00+00:00",
      "end":end+":00+00:00",
      "participant":[
        {
          "actor":{
            "reference":"Patient/"+patient_id
          },
          "status":"accepted"
        },
      ]
    }
    let url = process.env.REACT_APP_BASE_URL+`/Appointment/${appointmentId}`;

    axios.put(url, data).then((resp) => {
      fetchRecords()
    }).catch((err) => {
        console.log(err)
    })
  }

  const setAndEditModal = (item) => {
    setRequesting(true)
    setSelectedId(item.id)
    let url = process.env.REACT_APP_BASE_URL+`/Appointment/${item.id}`;

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
      seteditEncounterId(data.extension.length > 0 ? data.extension[0].valueString : '')
      setEditCalenderCode(data.extension.length > 0 ? data.extension[1].valueString : '')
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
      "extension": [
        {
          "url": 'encounter-id',
          "valueString": editEncounterId
        },
        {
          "url": "http://fhir.medlix.org/StructureDefinition/appointment-schedule-id",
          "valueString": editCalenderCode
        }
      ],
      "status": editStatus,
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
    let url = process.env.REACT_APP_BASE_URL+`/Appointment/${selectedId}`;

    axios.put(url, data).then((response) => {
      fetchRecords()
      setEditVisible(false)
    }).catch((e)=>{
      alert('this is something going wrong please try again!')
      // setEditVisible(false)
    })

  }
  const deleteAppointment = () => {
    let url = process.env.REACT_APP_BASE_URL+`/Appointment/${selectedId}`;
    setRequesting(true);
    axios.delete(url).then((response) => {
      setRequesting(false);
      setDeleteVisible(false);
      fetchRecords();
    }).catch((err) => {
      setRequesting(false);
      setDeleteVisible(false);
      fetchRecords();
    })
  }
  const navigateTasks = (item) => {
    console.log(item)
    const patient_id = new URLSearchParams(search).get('patient_id');
    history.push(`tasks?encounter_id=${item.encounter_id}&patient_id=${patient_id}`)
  }


  const getRecordValue = (item,index) => {
    if (Object.keys(item.resource.extension).includes(index.toString())) {
      return item.resource.extension[index].valueString;
    }
    return null
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
          const patient_id = new URLSearchParams(search).get('patient_id');
          let baseUrl = process.env.REACT_APP_BASE_URL+`/Appointment?actor=Patient/${patient_id}?_sort=lastUpdate`;
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
            <strong>Appointments</strong> <small>listing</small>
            <CButton style={{float: 'right'}} onClick={() => setVisible(!visible)}>Add appointment</CButton>

          </CCardHeader>
          <CCardBody>
              <CTable>
                <CTableCaption>
                  <span className="float-start">List of Appointments</span>
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
                    <CTableHeaderCell scope="col">Service Type</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Appointment Type</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Calender Code</CTableHeaderCell>
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
                          <CTableHeaderCell scope="row">{item.id}</CTableHeaderCell>
                          {/*<CTableDataCell>{item.id}</CTableDataCell>*/}
                          <CTableDataCell>{item.start}</CTableDataCell>
                          <CTableDataCell>{item.end}</CTableDataCell>
                          <CTableDataCell>{item.service_type}</CTableDataCell>
                          <CTableDataCell>{item.appointment_type}</CTableDataCell>
                          <CTableDataCell>{item.calenderCode}</CTableDataCell>

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
    <CModal backdrop={'static'}  visible={visible} onClose={() => setVisible(false)}>
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
                  <CFormInput type="text" onChange={(e) => setAppointmentTypeCode(e.target.value)} id="appointmentTypeCode" placeholder="Type Appointment Type Code" />
                </CCol>


                <CCol xs={6}>
                  <CFormLabel htmlFor="appointmentType">Appointment Type </CFormLabel>
                  <CFormInput type="text" onChange={(e) => setAppointmentTypeDisplay(e.target.value)} id="appointmentType" placeholder="Appointment Type" />
                </CCol>

                <CCol xs={12}>
                  <CFormLabel htmlFor="calenderCode">Calender Code </CFormLabel>
                  <CFormInput type="text" onChange={(e) => setCalenderCode(e.target.value)} id="calenderCode" placeholder="Calender Code" />
                </CCol>

                <CCol md={12}>
                  <CFormLabel htmlFor="comment">Comment</CFormLabel>
                  <CFormTextarea onChange={(e) => setComment(e.target.value)} id="comment"></CFormTextarea>
                </CCol>

                <CCol md={12}>
                  <CFormLabel htmlFor="status">Status</CFormLabel>
                  <CFormSelect defaultValue={'booked'} onChange={(e) => setStatus(e.target.value)} id="status">
                    <option>Choose...</option>
                    <option value='booked'>Booked</option>
                    <option value='proposed'>Proposed</option>
                    <option value='pending'>Pending</option>
                    <option value='arrived'>Arrived</option>
                    <option value='fulfilled'>Fulfilled</option>
                    <option value='cancelled'>Cancelled</option>
                    <option value='noshow'>No show</option>
                    <option value='entered-in-error'>Entered-in-error</option>
                    <option value='checked-in'>Checked-in</option>
                    <option value='waitlist'>Waitlist</option>

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

    <CModal backdrop={'static'}  visible={editVisible} onClose={() => setEditVisible(false)}>
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
                <CCol xs={12}>
                  <CFormLabel htmlFor="appointmentType">calendar  Code </CFormLabel>
                  <CFormInput value={editCalenderCode} type="text" onChange={(e) => setEditCalenderCode(e.target.value)} id="appointmentType" placeholder="Appointment Type" />
                </CCol>

                <CCol md={12}>
                  <CFormLabel htmlFor="comment">Comment</CFormLabel>
                  <CFormTextarea value={editComment} onChange={(e) => setEditComment(e.target.value)} id="comment"></CFormTextarea>
                </CCol>

                <CCol md={12}>
                  <CFormLabel htmlFor="status">Status</CFormLabel>
                  <CFormSelect defaultValue={editStatus} onChange={(e) => setEditStatus(e.target.value)} id="status">
                    <option>Choose...</option>
                    <option value='booked'>Booked</option>
                    <option value='proposed'>Proposed</option>
                    <option value='pending'>Pending</option>
                    <option value='arrived'>Arrived</option>
                    <option value='fulfilled'>Fulfilled</option>
                    <option value='cancelled'>Cancelled</option>
                    <option value='noshow'>No show</option>
                    <option value='entered-in-error'>Entered-in-error</option>
                    <option value='checked-in'>Checked-in</option>
                    <option value='waitlist'>Waitlist</option>

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
