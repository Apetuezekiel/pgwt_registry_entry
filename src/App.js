import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import EventRegistrationForm from './components/EventRegistration2';
import ThankYouPage from './components/ThankYouPage';
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
        <Route path='/register' element={<EventRegistrationForm/>}/>
        <Route path='/thanks' element={<ThankYouPage/>}/>
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
