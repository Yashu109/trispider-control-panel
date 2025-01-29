import React from 'react';
import { X } from "lucide-react";

const PDFViewer = ({ pdfUrl, projectId, onClose }) => {
  if (!pdfUrl) return null;

  return (
    <div className="pdf-viewer-overlay" onClick={onClose}>
      <div className="pdf-viewer-content" onClick={e => e.stopPropagation()}>
        <div className="pdf-viewer-header">
          <h3>Quotation - {projectId}</h3>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        <div className="pdf-viewer-body">
          <iframe
            src={pdfUrl}
            title="PDF Viewer"
            className="pdf-iframe"
          />
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;