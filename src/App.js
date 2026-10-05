import './App.css';
import RegisterFlow from './components/register/RegisterFlow';
import ThankYou from './components/register/ThankYou';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<RegisterFlow />} />
        <Route path="/thanks" element={<ThankYou />} />
        <Route path="*" element={<Navigate to="/register" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
