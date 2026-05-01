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
import FinanceHistory from './pages/FinanceHistory';
import PhoenixChat from './pages/PhoenixChat';
import { FinanceProvider } from './context/FinanceContext';

//  IMPORT THIS
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <FinanceProvider>
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
                        path="/finance-chat"
                        element={
                            <ProtectedRoute>
                                <PhoenixChat />
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

                    {/* Finance History Routes */}
                    <Route
                        path="/all-history"
                        element={
                            <ProtectedRoute>
                                <FinanceHistory type="all" />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/expenses-history"
                        element={
                            <ProtectedRoute>
                                <FinanceHistory type="expense" />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/income-history"
                        element={
                            <ProtectedRoute>
                                <FinanceHistory type="income" />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/savings-history"
                        element={
                            <ProtectedRoute>
                                <FinanceHistory type="savings" />
                            </ProtectedRoute>
                        }
                    />

                </Routes>
            </Router>
        </FinanceProvider>
    );
}

export default App;

