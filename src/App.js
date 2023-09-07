import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import EventRegistrationTwins from './components/EventRegistration';
import EventRegistrationReg from './components/EventRegistration2';
import ThankYouPage from './components/ThankYouPage';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import Spinner from './components/Spinner';


function App() {
  return (
    <div className="App">
      <ToastContainer
        closeOnClick
        pauseOnFocusLoss
        pauseOnHover
      ></ToastContainer>
      <BrowserRouter>
      <Routes>
        <Route path='/' element={<EventRegistrationReg/>}/>
        <Route path='/reg' element={<EventRegistrationReg/>}/>
        <Route path='/thanks' element={<ThankYouPage/>}/>
      </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
