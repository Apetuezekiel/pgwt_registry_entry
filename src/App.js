import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import ComingSoon from './components/ComingSoon';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useEffect } from 'react';

function AppRoutes() {
  useEffect(() => {
    document.body.classList.add('body--full');
  }, []);

  return (
    <div className="App App--full">
      <Routes>
        <Route path='/register' element={<ComingSoon/>}/>
        <Route path='*' element={<Navigate to="/register" replace/>}/>
      </Routes>
    </div>
  );
}

function App() {
  return (
    <>
      <ToastContainer
        closeOnClick
        pauseOnFocusLoss
        pauseOnHover
      ></ToastContainer>
      <BrowserRouter>
        <AppRoutes/>
      </BrowserRouter>
    </>
  );
}

export default App;
