import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          <div className="footer-brand">
            <h3><span className="gradient-text">Vitta IPO</span></h3>
            <p>AI-powered IPO research platform. Understand any IPO in 5 minutes instead of reading 500-page DRHPs.</p>
          </div>
          <div className="footer-links">
            <h4>Quick Links</h4>
            <Link to="/?tab=upcoming">Upcoming IPOs</Link>
            <Link to="/?tab=open">Open IPOs</Link>
            <Link to="/?tab=listed">Listed IPOs</Link>
          </div>
          <div className="footer-links">
            <h4>Vitta Ecosystem</h4>
            <a href="https://vittahub.com" target="_blank" rel="noopener noreferrer">Vitta Tools</a>
            <a href="https://vittahub.com/insurance" target="_blank" rel="noopener noreferrer">Vitta Insurance</a>
            <a href="https://vittahub.com/ai-advisor" target="_blank" rel="noopener noreferrer">Vitta AI</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Vittahub Private Ltd. All rights reserved.</span>
          <span>Data for educational purposes only. Not investment advice.</span>
        </div>
      </div>
    </footer>
  );
}
