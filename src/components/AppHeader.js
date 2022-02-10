import React from 'react'
import { CContainer, CHeader } from '@coreui/react'

import { AppBreadcrumb } from './index'

const AppHeader = () => {
  return (
    <CHeader position="sticky" className="mb-4">
      <CContainer fluid>
        <AppBreadcrumb />
      </CContainer>
    </CHeader>
  )
}

export default AppHeader
