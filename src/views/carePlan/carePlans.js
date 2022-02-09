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
import data from "@coreui/coreui/js/src/dom/data";

const Appointments = (props) => {

  const [carePlansList, setCarePlansList] = useState([]);
  const [requesting, setRequesting] = useState(false);
  const [visible, setVisible] = useState(false)
  const [editVisible, setEditVisible] = useState(false)
  const [deleteVisible, setDeleteVisible] = useState(false)

  // new carePlan fields
  const [title, setTitle] = useState("");
  const [cmsId, setCmsId ]= useState("");

  const [editTitle, setEditTitle] = useState("");
  const [editCmsId, setEditCmsId] = useState("");
  const [editStatus, setEditStatus] = useState(false);
  const [editPatientObject, setEditPatientObject] = useState(false);
  const [selectedId, setSelectedId] = useState(false);
  const [editSchema, setEditSchema] = useState(false);
  const search = useLocation().search;


  useEffect(() => {
    fetchRecord()
  }, [])

  const fetchRecord = () => {

    const patient_id = new URLSearchParams(search).get('patient_id');
    let get_patients_url = process.env.REACT_APP_BASE_GET_URL+`&resource=CarePlan&subject=Patient/${patient_id}`;
    setRequesting(true);
    axios.get(get_patients_url).then((response) => {
      var carePlans = [];
      response.data.entry?.forEach((item, index) => {
        carePlans.push({
          // name: item.resource?.name[0]?.given?.join(' '),
          id: item.resource.id,
          title: item.resource.title,
          intent: item.resource.intent,
          status: item.resource.status,
        })
      })
      console.log(carePlans);
      // console.log(appointmentList)
      setRequesting(false);
      setCarePlansList(carePlans);
    })
  }
  const addCarePlan = () => {
    const patient_id = new URLSearchParams(search).get('patient_id');

    const data = {
      "resourceType": "CarePlan",
      "identifier":[
        {
          "system":"medlix",
          "value":cmsId,
        }
      ],

      "status": 'active',
      "intent": 'order',
      "title": title,
      "subject":{
        "reference":"Patient/"+patient_id
      },
    }
    axios.post(process.env.REACT_APP_BASE_POST_URL+'&resource=CarePlan', data).then((response) => {
      fetchRecord();
      setVisible(false)
    }).catch((e)=>{
      setVisible(false)
      fetchRecord()
    })
  }
  const editCarePlan = () => {
    const patient_id = new URLSearchParams(search).get('patient_id');

    const data = {
      "resourceType": "CarePlan",
      "identifier":[
        {
          "system":"medlix",
          "value":editCmsId,
        }
      ],

      "status": 'active',
      "intent": 'order',
      "title": editTitle,
      "subject":{
        "reference":"Patient/"+patient_id
      },
    }
    const url = process.env.REACT_APP_BASE_EDIT_URL+'&resource=CarePlan/'+selectedId
    axios.put(url, data).then((response) => {
      fetchRecord();
      setEditVisible(false)
    }).catch((e)=>{
      alert('there is something going wrong please try again')
      setEditVisible(false)
      fetchRecord()
    })
  }
  const deleteCarePlan = () => {
    let delete_patient_url = process.env.REACT_APP_BASE_DELETE_URL+'&resource=CarePlan/'+selectedId;
    setRequesting(true);
    axios.delete(delete_patient_url).then((response) => {
      setRequesting(false);
      setDeleteVisible(false);
      fetchRecord();
    }).catch((err) => {
      setRequesting(false);
      setDeleteVisible(false);
      fetchRecord();
    })
  }

  const setAndEditModal = (item) => {
    setRequesting(true)
    const url = process.env.REACT_APP_BASE_GET_URL+'&resource=CarePlan/'+item.id
    axios.get(url).then((response) => {
      const data = response.data
      setSelectedId(item.id)
      setEditTitle(data.title)
      setEditStatus(data.status)
      setEditCmsId(data.identifier[0].value)

      setEditVisible(true)
      setRequesting(false)
    }).catch((e)=>{
      setVisible(false)
      setRequesting(false)
    })

  }


  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Care Plans</strong> <small>listing</small>
            <CButton style={{float: 'right'}} onClick={() => setVisible(!visible)}>Add Plan</CButton>

          </CCardHeader>
          <CCardBody>
              <CTable>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">#</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Title</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Intent</CTableHeaderCell>
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
                          <CTableDataCell>{item.intent}</CTableDataCell>
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
        <CModalTitle>Add Care Plan</CModalTitle>
      </CModalHeader>
      <CModalBody>

      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardBody>
              <CForm className="row g-3">
                <CCol md={6}>
                  <CFormLabel htmlFor="title">Title</CFormLabel>
                  <CFormInput onChange={(e) => setTitle(e.target.value)} type="text" id="title" />
                </CCol>
                {/*<CCol md={6}>*/}
                {/*  <CFormLabel htmlFor="intent">Intent</CFormLabel>*/}
                {/*  <CFormInput onChange={(e) => setIntent(e.target.value)} type="text" id="intent" />*/}
                {/*</CCol>*/}
                <CCol md={6}>
                  <CFormLabel htmlFor="cmsid">CMS ID</CFormLabel>
                  <CFormInput onChange={(e) => setCmsId(e.target.value)} type="text" id="cmsid" />
                </CCol>
                {/*<CCol md={6}>*/}
                {/*  <CFormLabel htmlFor="inputState">Status</CFormLabel>*/}
                {/*  <CFormSelect onChange={(e) => setStatus(e.target.value)} id="inputState">*/}
                {/*    <option>Choose...</option>*/}
                {/*    <option value='true'>Active</option>*/}
                {/*    <option value='false'>InActive</option>*/}
                {/*  </CFormSelect>*/}
                {/*</CCol>*/}
              </CForm>
          </CCardBody>
        </CCard>
      </CCol>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={() => setVisible(false)}>
          Close
        </CButton>
        <CButton color="primary" onClick={() => addCarePlan()}>Save changes</CButton>
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
                <CFormLabel htmlFor="title">Title</CFormLabel>
                <CFormInput value={editTitle} onChange={(e) => setEditTitle(e.target.value)} type="text" id="title" />
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="cmsid">CMS ID</CFormLabel>
                <CFormInput value={editCmsId} onChange={(e) => setEditCmsId(e.target.value)} type="text" id="title" />
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
        <CButton color="primary" onClick={() => editCarePlan()}>Save changes</CButton>
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
          <CButton color="primary" onClick={() => deleteCarePlan()}>Confirm Delete</CButton>
        </CModalFooter>
      </CModal>

    </CRow>
  )
}

export default Appointments
