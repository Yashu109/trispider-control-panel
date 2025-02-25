// import React from 'react';
// import { X } from "lucide-react";

// const PDFViewer = ({ pdfUrl, projectId, onClose }) => {
//   if (!pdfUrl) return null;

//   return (
//     <div className="pdf-viewer-overlay" onClick={onClose}>
//       <div className="pdf-viewer-content" onClick={e => e.stopPropagation()}>
//         <div className="pdf-viewer-header">
//           <h3>Quotation - {projectId}</h3>
//           <button className="close-button" onClick={onClose}>
//             <X size={24} />
//           </button>
//         </div>
//         <div className="pdf-viewer-body">
//           <iframe
//             src={pdfUrl}
//             title="PDF Viewer"
//             className="pdf-iframe"
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PDFViewer;
import React, { useState } from 'react';
import { Download, X } from 'lucide-react';

const PDFViewer = ({ pdfUrl, projectId, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modal: {
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      width: '100%',
      maxWidth: '500px',
      position: 'relative',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
    },
    header: {
      padding: '16px 20px',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    title: {
      margin: 0,
      fontSize: '20px',
      fontWeight: 600,
      color: '#111827'
    },
    closeButton: {
      background: 'none',
      border: 'none',
      padding: '8px',
      cursor: 'pointer',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    content: {
      padding: '24px'
    },
    buttonsContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    },
    button: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      padding: '12px',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: 500,
      width: '100%',
      transition: 'background-color 0.2s'
    },
    primaryButton: {
      backgroundColor: '#2563eb',
      color: '#ffffff',
    },
    secondaryButton: {
      display:'none',
      backgroundColor: '#f3f4f6',
      color: '#1f2937',
    },
    message: {
      textAlign: 'center',
      color: '#6b7280',
      fontSize: '14px',
      marginTop: '16px'
    },
    error: {
      backgroundColor: '#fee2e2',
      color: '#991b1b',
      padding: '12px',
      borderRadius: '6px',
      marginBottom: '16px',
      fontSize: '14px'
    },
    spinnerContainer: {
      display: 'inline-block',
      width: '20px',
      height: '20px',
      border: '3px solid #ffffff',
      borderTopColor: 'transparent',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }
  };

  const handleDownload = async () => {
    try {
      setLoading(true);
      const response = await fetch(pdfUrl);
      if (!response.ok) throw new Error('Failed to download PDF');
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `Project-${projectId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to download the PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openInNewTab = () => {
    window.open(pdfUrl, '_blank');
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>PDF Options - Project {projectId}</h2>
          <button 
            style={styles.closeButton}
            onClick={onClose}
          >
            <X size={24} />
          </button>
        </div>
        
        <div style={styles.content}>
          {error && (
            <div style={styles.error}>
              {error}
            </div>
          )}
          
          <div style={styles.buttonsContainer}>
            <button
              onClick={openInNewTab}
              style={{...styles.button, ...styles.primaryButton}}
              disabled={loading}
            >
              <span>Open in New Tab</span>
            </button>

            <button
              onClick={handleDownload}
              style={{...styles.button, ...styles.secondaryButton}}
              disabled={loading}
            >
              {loading ? (
                <div style={styles.spinnerContainer} />
              ) : (
                <Download size={20} />
              )}
              <span>Download PDF</span>
            </button>
          </div>

          <p style={styles.message}>
            Due to security restrictions, you can either open the PDF in a new tab or download it to your device.
          </p>
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          button:disabled {
            opacity: 0.7;
            cursor: not-allowed;
          }
          
          button:not(:disabled):hover {
            opacity: 0.9;
          }
        `}
      </style>
    </div>
  );
};

export default PDFViewer;