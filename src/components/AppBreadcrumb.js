import React from 'react'
import { Link, useLocation } from 'react-router-dom'

import routes from '../routes'

import { CBreadcrumb, CBreadcrumbItem } from '@coreui/react'

const AppBreadcrumb = () => {
  const currentLocation = useLocation().pathname

  const getRouteName = (pathname, routes) => {
    const currentRoute = routes.find((route) =>
      route.path.includes(':')
        ? route.path.includes(pathname.split('/')[0])
        : route.path === pathname,
    )
    return currentRoute.name
  }

  const getBreadcrumbs = (location) => {
    const breadcrumbs = []
    location.split('/').reduce((prev, curr, index, array) => {
      const currentPathname = `${prev}/${curr}`
      breadcrumbs.push({
        pathname: currentPathname,
        name: getRouteName(currentPathname, routes),
        active: true,
      })
      return currentPathname
    })
    if (breadcrumbs.length > 2) {
      breadcrumbs.splice(breadcrumbs.length - 2, 1)
    }
    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs(currentLocation)

  return (
    <CBreadcrumb className="m-0 ms-2">
      <CBreadcrumbItem href="/">Home</CBreadcrumbItem>
      {breadcrumbs.map((breadcrumb, index) => {
        const totalBreadcrumbs = breadcrumbs.length
        const isLastBreadcrumb = index === totalBreadcrumbs - 1
        return (
          <CBreadcrumbItem key={index}>
            {breadcrumb.active && !isLastBreadcrumb ? (
              <Link to={breadcrumb.pathname}>{breadcrumb.name}</Link>
            ) : (
              <>{breadcrumb.name}</>
            )}
          </CBreadcrumbItem>
        )
      })}
    </CBreadcrumb>
  )
}

export default React.memo(AppBreadcrumb)
