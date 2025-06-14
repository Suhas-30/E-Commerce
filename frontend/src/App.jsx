import { useState } from 'react'
import Sample from './components/Sample'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Register from './pages/Register'
import Login from './pages/Login'
const App = ()=> {
  

  return (
    <>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/register' element={<Register></Register>}/>
        <Route path='/login' element={<Login></Login>}/>
        

      </Routes>
    </>
  )
}

export default App
