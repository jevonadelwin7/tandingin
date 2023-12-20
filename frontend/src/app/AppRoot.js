import React from 'react'
import { Outlet } from 'react-router-dom'
import AppNavigation from '../components/AppNavigation'

function AppRoot() {
  return (
    <>

    <Outlet/>
    </>
  )
}

export default AppRoot