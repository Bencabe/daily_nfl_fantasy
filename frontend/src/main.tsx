import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
import {validateJWT} from './api/login.ts'
import LoginPage, { User } from './components/Login.tsx'
import './index.css'
import PlayerDraft from './components/PlayerDraft.tsx';
import NavBar from './components/NavBar';
import React from 'react'
import Home from './components/Home.tsx'
import PlayerSelection from './components/PlayerSelection.tsx';
import LeagueFixtures from './components/LeagueFixtures.tsx';
import LeagueTable from './components/LeagueTable.tsx'
import LeagueManagement from './components/LeagueManagement.tsx'
import InfoPage from './components/InfoPage.tsx'

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <NavBar />
      <div className="page-wrapper">
        {children}
      </div>
    </>
  );
};

export type GlobalContextType = {
  user: User,
  setUser: (user: User) => void
}

export const GlobalContext = React.createContext<GlobalContextType | null>(null);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<null | User>(null);


  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await validateJWT();
        setIsAuthenticated(true);
        setUser(user);
      } catch (error) {
        console.error(error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>; // Or a loading spinner component
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  else {
    return <GlobalContext.Provider value={{ user, setUser }}>
            {children}
          </GlobalContext.Provider>;

  }
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Layout><Home /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/player_select" element={
          <ProtectedRoute>
            <Layout><PlayerSelection /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/league_fixtures" element={
          <ProtectedRoute>
            <Layout><LeagueFixtures /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/league_table" element={
          <ProtectedRoute>
            <Layout><LeagueTable /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/league_management" element={
          <ProtectedRoute>
            <Layout><LeagueManagement /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/draft/:leagueId" element={
          <ProtectedRoute>
            <Layout><PlayerDraft /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/info" element={
          <ProtectedRoute>
            <Layout><InfoPage /></Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  </StrictMode>,
)