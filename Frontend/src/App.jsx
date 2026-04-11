import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DailyTracker from './pages/DailyTracker';
import StudyTracker from './pages/StudyTracker';
import FinanceTracker from './pages/FinanceTracker';
import Journal from './pages/Journal';
import FailureTracker from './pages/FailureTracker';
import RulesDiscipline from './pages/RulesDiscipline';
import Analysis from './pages/Analysis';
import Test from './pages/Test';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/test" element={<Test />} />

        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/daily-tracker" element={<DailyTracker />} />
        <Route path="/study-tracker" element={<StudyTracker />} />
        <Route path="/finance-tracker" element={<FinanceTracker />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/failure-tracker" element={<FailureTracker />} />
        <Route path="/rules-discipline" element={<RulesDiscipline />} />
        <Route path="/analysis" element={<Analysis />} />
        
      </Routes>
    </Router>
  );
}

export default App;
