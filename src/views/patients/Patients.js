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
import { DocsCallout, DocsExample } from 'src/components'
import { Link, useHistory} from 'react-router-dom'
import CIcon from "@coreui/icons-react";
import {cilBell} from "@coreui/icons";

const Patients = () => {

  const [patients, setPatients] = useState([]);
  const [requesting, setRequesting] = useState(false);
  const [visible, setVisible] = useState(false)
  const [editVisible, setEditVisible] = useState(false)
  const [deleteVisible, setDeleteVisible] = useState(false)
  const [pagination, setPagination] = useState(false)



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
    fetchPatients();
  }, [])

  const fetchPatients = (url = '') => {
    var get_patients_url = ''
    if(url === '') {
       get_patients_url = process.env.REACT_APP_BASE_GET_URL+'&resource=Patient';
    } else {
       get_patients_url = url
    }
    setRequesting(true);
    axios.get(get_patients_url).then((response) => {
      var patientsList = [];
      setPagination(response.data.link)
      response.data.entry.forEach((item, index) => {
        patientsList.push({
            name: item.resource?.name[0]?.given?.join(' '),
            dob: item.resource?.birthDate,
            isActive: item.resource?.active,
            gender: item.resource?.gender,
            id: item.resource?.id
        })
      })
      setRequesting(false);
      setPatients(patientsList);
    }).catch((e)=>{
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

    axios.post(process.env.REACT_APP_BASE_POST_URL+'&resource=Patient', data).then((response) => {
      setVisible(false)
      fetchPatients()
    }).catch((e)=>{
      setVisible(false)
    })
  }
  const getPaginationHtml = (pagination) => {
    if(pagination) {
      return (
        <CPagination className="justify-content-end" aria-label="Page navigation example">
          <CPaginationItem disabled>Previous</CPaginationItem>
          {/**/}
          {pagination?.map((item, index) => {
            return (
              // eslint-disable-next-line react/jsx-key
              <CPaginationItem  active={item.relation == 'self'} onClick={() => fetchPatients(item.url)}>{++index}</CPaginationItem>
            )
          })}
          <CPaginationItem>Next</CPaginationItem>
        </CPagination>
      )
    }

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

  const patientAppointments = (id) => {
    history.push("/appointments?patient_id="+id);
  }
  const patientCarePlan = (id) => {
    history.push("/CarePlans?patient_id="+id);
  }
  const patientMeasurement = (id) => {
    history.push("/measurements?patient_id="+id);
  }

  const deletePatient = () => {
    let delete_patient_url = process.env.REACT_APP_BASE_DELETE_URL+'&resource=Patient/'+selectedPatientId;
    setRequesting(true);
    axios.delete(delete_patient_url).then((response) => {
      setRequesting(false);
      setDeleteVisible(false);
      fetchPatients();
    }).catch((err) => {
      setRequesting(false);
      setDeleteVisible(false);
      fetchPatients();
    })
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
