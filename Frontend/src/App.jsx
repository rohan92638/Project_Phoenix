import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import FinanceTracker from './pages/FinanceTracker';
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

                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/login" element={<Login />} />

                    {/*  Protected Routes */}
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

