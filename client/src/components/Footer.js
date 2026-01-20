import React from 'react';
import { Box, Link, Typography } from '@mui/material';
import '../css/Footer.css';

const Footer = () => {
  return (
    <Box className="app-footer">
      <Box className="app-footer-content">
        <Box className="app-footer-links">
          <Link 
            href="https://www.gov.il/he/pages/foi_edu" 
            target="_blank"
            rel="noopener noreferrer"
            className="app-footer-link"
          >
            חוק חופש המידע
          </Link>
          <Link 
            href="https://www.gov.il/he/pages/accessibility_edu" 
            target="_blank"
            rel="noopener noreferrer"
            className="app-footer-link"
          >
            הצהרת נגישות
          </Link>
          <Link 
            href="https://www.gov.il/he/departments/ministry-of-education/govil-landing-page" 
            target="_blank"
            rel="noopener noreferrer"
            className="app-footer-link"
          >
            תנאי שימוש
          </Link>
        </Box>
        <Typography variant="body2" className="app-footer-copyright">
          כל הזכויות שמורות למערכת ניהול יועצות
        </Typography>
      </Box>
    </Box>
  );
};

export default Footer;
