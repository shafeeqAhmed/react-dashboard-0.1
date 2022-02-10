import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => {
  const date = new Date().getFullYear()
  return (
    <CFooter>
      <div>
        <span className="ms-1">&copy; {date} Health Care.</span>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)
