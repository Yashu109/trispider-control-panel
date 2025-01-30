// import React, { useState } from 'react';
// import { X } from 'lucide-react';

// const Invoice = ({ project, onClose }) => {
//     const [invoiceDetails, setInvoiceDetails] = useState({
//         totalAmount: project.totalAmount || '',
//         advancePayment: project.advancePayment || '',
//         remainingPayment: project.remainingPayment || '',
//         paymentStatus: project.paymentStatus || 'Pending'
//     });

//     const handleSaveInvoice = () => {
//         // Implement save logic to Firebase
//         // This is a placeholder for actual implementation
//         console.log('Saving invoice details:', invoiceDetails);
//         onClose();
//     };

//     return (
//         <div className="modal-overlay">
//             <div className="modal-content invoice-modal">
//                 <div className="modal-header">
//                     <h2>Invoice Details - {project.projectId}</h2>
//                     <button onClick={onClose} className="close-button">
//                         <X size={20} />
//                     </button>
//                 </div>
//                 <div className="invoice-content">
//                     <div className="invoice-grid">
//                         <div className="form-group">
//                             <label>Client Name</label>
//                             <input 
//                                 type="text" 
//                                 value={project.clientName || ''} 
//                                 readOnly 
//                                 className="readonly-input"
//                             />
//                         </div>
//                         <div className="form-group">
//                             <label>Project Name</label>
//                             <input 
//                                 type="text" 
//                                 value={project.title || ''} 
//                                 readOnly 
//                                 className="readonly-input"
//                             />
//                         </div>
//                         <div className="form-group">
//                             <label>Total Amount</label>
//                             <input 
//                                 type="number" 
//                                 value={invoiceDetails.totalAmount}
//                                 onChange={(e) => setInvoiceDetails(prev => ({
//                                     ...prev, 
//                                     totalAmount: e.target.value,
//                                     remainingPayment: (e.target.value - (invoiceDetails.advancePayment || 0)).toString()
//                                 }))}
//                                 placeholder="Enter total project amount"
//                             />
//                         </div>
//                         <div className="form-group">
//                             <label>Advance Payment</label>
//                             <input 
//                                 type="number" 
//                                 value={invoiceDetails.advancePayment}
//                                 onChange={(e) => setInvoiceDetails(prev => ({
//                                     ...prev, 
//                                     advancePayment: e.target.value,
//                                     remainingPayment: (invoiceDetails.totalAmount - e.target.value).toString()
//                                 }))}
//                                 placeholder="Enter advance payment"
//                             />
//                         </div>
//                         <div className="form-group">
//                             <label>Remaining Payment</label>
//                             <input 
//                                 type="number" 
//                                 value={invoiceDetails.remainingPayment}
//                                 readOnly 
//                                 className="readonly-input"
//                             />
//                         </div>
//                         <div className="form-group">
//                             <label>Payment Status</label>
//                             <select 
//                                 value={invoiceDetails.paymentStatus}
//                                 onChange={(e) => setInvoiceDetails(prev => ({
//                                     ...prev, 
//                                     paymentStatus: e.target.value
//                                 }))}
//                             >
//                                 <option value="Pending">Pending</option>
//                                 <option value="Partial">Partial</option>
//                                 <option value="Completed">Completed</option>
//                             </select>
//                         </div>
//                     </div>
//                 </div>
//                 <div className="modal-footer">
//                     <button 
//                         onClick={onClose} 
//                         className="btn-cancel"
//                     >
//                         Cancel
//                     </button>
//                     <button 
//                         onClick={handleSaveInvoice} 
//                         className="btn-save"
//                     >
//                         Save Invoice
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Invoice;

// import React from 'react';
// import { X} from "lucide-react";
// import './InVoice.css'
// const Invoice = ({ project, onClose }) => {
//     return (
//         <div className="modal-overlay">
//             <div className="modal-content">
//                 <div className="modal-header">
//                     <h2>Invoice for {project.clientName}</h2>
//                     <button onClick={onClose} className="close-button">
//                         <X size={20} />
//                     </button>
//                 </div>
//                 <div className="invoice-content">
//                     <p><strong>Project ID:</strong> {project.projectId}</p>
//                     <p><strong>Client Name:</strong> {project.clientName}</p>
//                     <p><strong>Project Name:</strong> {project.title}</p>
//                     <p><strong>College Name:</strong> {project.collegeName}</p>
//                     <p><strong>Email:</strong> {project.email}</p>
//                     <p><strong>Phone Number:</strong> {project.phoneNumber}</p>
//                     <p><strong>WhatsApp Number:</strong> {project.whatsappNumber}</p>
//                     <p><strong>Referred By:</strong> {project.referredBy}</p>
//                     <p><strong>Timeline:</strong> {project.timeline ? new Date(project.timeline).toLocaleDateString() : 'Not set'}</p>
//                     <p><strong>Project Status:</strong> {project.projectStatus || 'Start'}</p>
//                     {/* Add more invoice details as needed */}
//                 </div>
//                 <div className="modal-footer">
//                     <button onClick={onClose} className="btn-cancel">
//                         Close
//                     </button>
//                     <button onClick={() => window.print()} className="btn-print">
//                         Print Invoice
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Invoice;

import React, { useState } from "react";
import axios from "axios";
import { X } from "lucide-react";
import './InVoice.css'
const Invoice = ({ project, onClose }) => {
    const [loading, setLoading] = useState(false);

    const generateInvoice = async (print = false) => {
        setLoading(true);
        try {
            const response = await axios.post(
                "https://invoice-generator.com",
                {
                    logo: "", // Optional: Add a logo URL
                    from: "Your Company Name\nAddress\nCity, Country",
                    to: `${project.clientName}\n${project.collegeName}\n${project.email}`,
                    items: [
                        {
                            name: project.title,
                            quantity: 1,
                            unit_cost: 100, // Example cost
                        },
                    ],
                    notes: "Thank you for your business!",
                    currency: "USD",
                },
                { responseType: "blob" } // Ensures we get a PDF file
            );

            // Create a URL for the PDF
            const pdfUrl = window.URL.createObjectURL(new Blob([response.data]));

            if (print) {
                // Open PDF in a new tab for printing
                const newTab = window.open(pdfUrl, "_blank");
                if (newTab) {
                    newTab.focus();
                } else {
                    alert("Please allow pop-ups to print the invoice.");
                }
            } else {
                // Trigger download
                const a = document.createElement("a");
                a.href = pdfUrl;
                a.download = "invoice.pdf";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
        } catch (error) {
            console.error("Error generating invoice:", error);
        }
        setLoading(false);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Invoice for {project.clientName}</h2>
                    <button onClick={onClose} className="close-button">
                        <X size={20} />
                    </button>
                </div>
                <div className="invoice-content">
                    <p><strong>Project ID:</strong> {project.projectId}</p>
                    <p><strong>Client Name:</strong> {project.clientName}</p>
                    <p><strong>Project Name:</strong> {project.title}</p>
                    <p><strong>College Name:</strong> {project.collegeName}</p>
                    <p><strong>Email:</strong> {project.email}</p>
                    <p><strong>Phone Number:</strong> {project.phoneNumber}</p> 
                    <p><strong>Project Status:</strong> {project.projectStatus || "Start"}</p>
                </div>
                <div className="modal-footer">
                    <button onClick={onClose} className="btn-cancel">Close</button>
                    {/* <button onClick={() => generateInvoice(false)} className="btn-download" disabled={loading}>
                        {loading ? "Generating..." : "Download Invoice"}
                    </button> */}
                    <button onClick={() => window.print()} className="btn-print">
                        Print Invoice
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Invoice;
