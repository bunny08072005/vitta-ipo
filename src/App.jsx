import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { IPODataProvider } from './context/IPODataContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import IPOAnalysis from './pages/IPOAnalysis';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function App() {
  return (
    <ThemeProvider>
      <IPODataProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/ipo/:slug" element={<IPOAnalysis />} />
            </Routes>
          </main>
          <Footer />
        </BrowserRouter>
      </IPODataProvider>
    </ThemeProvider>
  );
}

export default App;
