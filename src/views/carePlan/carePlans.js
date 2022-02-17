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
  CFormSelect, CPagination, CPaginationItem
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
  const [urlPagination, setUrlPagination] = React.useState(null)
  const [isFirstPage, setIsFirstPage] = React.useState(true)
  const [searching, setSearching] = React.useState(true)


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
    fetchRecords()
  }, [])

  const fetchRecords = (url = null) => {

    const patient_id = new URLSearchParams(search).get('patient_id');
    // let get_patients_url = process.env.REACT_APP_BASE_GET_URL+`&resource=CarePlan&subject=Patient/${patient_id}`;

    let get_patients_url = process.env.REACT_APP_BASE_URL+`/CarePlan?subject=Patient/${patient_id}?_sort=lastUpdate`;

    setRequesting(true);
    axios.get(url ? url : get_patients_url).then((response) => {
      checkPagination(response.data)
      var carePlans = [];
      response.data.entry?.forEach((item, index) => {
        carePlans.push({
          // name: item.resource?.name[0]?.given?.join(' '),
          id: item.resource.id,
          title: item.resource.title,
          intent: item.resource.intent,
          status: item.resource.status,
          cmsid: item.resource.identifier[0]?.value
        })
      })
      // console.log(appointmentList)
      setRequesting(false);
      setCarePlansList(carePlans);
    })
  }
  const addCarePlan = () => {
    const patient_id = new URLSearchParams(search).get('patient_id');

    const data = {
      "resourceType": "CarePlan",
      "meta": {
        "versionId": "1",
        "lastUpdated": "2022-01-05T15:21:30.028+00:00"
      },
      "identifier": [
        {
          "system":"medlix",
          "value":cmsId,
        }
      ],
      "status": "active",
      "intent": "plan",
      "title": title,
      "subject": {
            "reference":"Patient/"+patient_id
      },
    }
    const url = process.env.REACT_APP_BASE_URL+'/CarePlan'

    // axios.post(process.env.REACT_APP_BASE_POST_URL+'&resource=CarePlan', data).then((response) => {
    axios.post(url, data).then((response) => {
      fetchRecords();
      setVisible(false)
    }).catch((e)=>{
      setVisible(false)
      fetchRecords()
    })
  }
  const editCarePlan = () => {
    const patient_id = new URLSearchParams(search).get('patient_id');
    const data = {
      "resourceType": "CarePlan",
      "id": selectedId,
      "meta": {
        "versionId": "2",
        "lastUpdated": "2022-02-17T11:43:01.869+00:00"
      },
      "identifier": [
        {
          "system":"medlix",
          "value":editCmsId,
        }
      ],
      "status": "active",
      "intent": "plan",
      "title": editTitle,
      "subject": {
            "reference":"Patient/"+patient_id
      },
    }
    // const url = process.env.REACT_APP_BASE_EDIT_URL+'&resource=CarePlan/'+selectedId
    const url = process.env.REACT_APP_BASE_URL+'/CarePlan/'+selectedId

    axios.put(url, data).then((response) => {
      fetchRecords();
      setEditVisible(false)
    }).catch((e)=>{
      alert('there is something going wrong please try again')
      setEditVisible(false)
      fetchRecords()
    })
  }
  const deleteCarePlan = () => {
    // let delete_patient_url = process.env.REACT_APP_BASE_DELETE_URL+'&resource=CarePlan/'+selectedId;
    const delete_patient_url = process.env.REACT_APP_BASE_URL+'/CarePlan/'+selectedId

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

  const setAndEditModal = (item) => {
    setRequesting(true)
    // const url = process.env.REACT_APP_BASE_GET_URL+'&resource=CarePlan/'+item.id
    const url = process.env.REACT_APP_BASE_URL+'/CarePlan/'+item.id

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


  //pagination functions
  const getCtParamFromUrl = (url = null) => {
    const urlParams = url.split('?')[1]
    const params = urlParams.split('&')
    return params[1]
    // const ctParam = params.find((param) => param.includes('ct=')).split('=')[1]
    // return ctParam
  }
  const checkPagination = (response) => {
    if (response.link) {
      const nextLink = response.link.find((link) => link.relation === 'next')
      if (nextLink) {
        const nextUrl = nextLink.url
        const nextPagination = getCtParamFromUrl(nextUrl)

        if (nextPagination) {
          const patient_id = new URLSearchParams(search).get('patient_id');
          // let baseUrl = process.env.REACT_APP_BASE_GET_URL+`&resource=CarePlan&subject=Patient/${patient_id}`;
          let baseUrl = process.env.REACT_APP_BASE_URL+`/CarePlan?subject=Patient/${patient_id}`;


          const nextUrlWithPagination = `${baseUrl}&${nextPagination}`
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
            <strong>Care Plans</strong> <small>listing</small>
            <CButton style={{float: 'right'}} onClick={() => setVisible(!visible)}>Add Plan</CButton>

          </CCardHeader>
          <CCardBody>
              <CTable>
                <CTableCaption>
                  <span className="float-start">List of Care Plan</span>
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
                    <CTableHeaderCell scope="col">Title</CTableHeaderCell>
                    <CTableHeaderCell scope="col">CMS ID</CTableHeaderCell>
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
                          <CTableHeaderCell scope="row">{item.id}</CTableHeaderCell>
                          <CTableDataCell>{item.title}</CTableDataCell>
                          <CTableDataCell>{item.cmsid}</CTableDataCell>
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
    <CModal  backdrop={'static'}  visible={visible} onClose={() => setVisible(false)}>
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
                  <CFormInput onChange={(e) => setCmsId(e.target.value)} type="number" id="cmsid" />
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

    <CModal  backdrop={'static'}  visible={editVisible} onClose={() => setEditVisible(false)}>
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
                <CFormInput value={editCmsId} onChange={(e) => setEditCmsId(e.target.value)} type="number" id="title" />
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
