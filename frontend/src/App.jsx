import { useState } from 'react'
import Sample from './components/Sample'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Register from './pages/Register'
import Login from './pages/Login'
import CartPage from './pages/Cart'
import Products from './pages/Products'
import Buy from './pages/Buy'

const App = () => {
  return (
    <>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/register' element={<Register/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/cart/:id' element={<CartPage/>}/>
        <Route path='/products' element={<Products/>}/>
        <Route path='/buy' element={<Buy></Buy>}/>
      </Routes>
    </>
  )
}

export default App