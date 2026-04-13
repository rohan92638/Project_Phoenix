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
import CourseDetail from './pages/CourseDetail';

//  IMPORT THIS
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <Router>
            <Routes>

                    {/*  Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/test" element={<Test />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/login" element={<Login />} />

                    {/*  Protected Routes */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/daily-tracker"
                        element={
                            <ProtectedRoute>
                                <DailyTracker />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/study-tracker"
                        element={
                            <ProtectedRoute>
                                <StudyTracker />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/study-tracker/:courseId"
                        element={
                            <ProtectedRoute>
                                <CourseDetail />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/finance-tracker"
                        element={
                            <ProtectedRoute>
                                <FinanceTracker />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/journal"
                        element={
                            <ProtectedRoute>
                                <Journal />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/failure-tracker"
                        element={
                            <ProtectedRoute>
                                <FailureTracker />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/rules-discipline"
                        element={
                            <ProtectedRoute>
                                <RulesDiscipline />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/analysis"
                        element={
                            <ProtectedRoute>
                                <Analysis />
                            </ProtectedRoute>
                        }
                    />

                </Routes>
        </Router>
    );
}

export default App;

