

// import React from 'react';
// import { X } from "lucide-react";
// import './Invoice.css';

// const Invoice = ({ project, onClose }) => {
//     return (
//         <div className="modal-overlay">
//             <div className="modal-content">
//                 <div className="modal-header">
//                     <h2>Invoice for {project?.clientName}</h2>
//                     <button onClick={onClose} className="close-button">
//                         <X size={20} />
//                     </button>
//                 </div>

//                 <div className="invoice-wrapper">
//                     <div className="tax-invoice">
//                         <div className="invoice-header">
//                             <div className="header-top">
//                                 <h1>TAX INVOICE</h1>
//                                 <div className="invoice-number">
//                                     <p>INVOICE NO : 0029 / 2017-18</p>
//                                     <p>DATE : 04-03-2018</p>
//                                 </div>
//                             </div>

//                             <div className="company-details">
//                                 <div className="logo">
//                                     <div className="logo-circle">
//                                         <span className="logo-wave"></span>
//                                     </div>
//                                 </div>
//                                 <div className="company-info">
//                                     <h2>TRISPIDER INNOVATIVE LABS</h2>
//                                     <p>Dodhmane complex, 1st floor,</p>
//                                     <p>Muddinaplaya main road, Vishwaneedam</p>
//                                     <p>Post, Bangalore-560091</p>
//                                 </div>
//                             </div>

//                             <div className="party-details">
//                                 <h3>Cleint Name: -</h3>
//                                 <p>{project?.clientName || ''}</p>
//                                 <p>{project?.collegeName || ''}</p>
//                                 <p>GSTIN: 07AAFD8457JU3</p>
//                             </div>
//                         </div>

//                         <div className="invoice-table">
//                             <table>
//                                 <thead>
//                                     <tr>
//                                         <th>Particulars (Descriptions & Specifications)</th>
//                                         <th>HSN Code</th>
//                                         <th>Qty</th>
//                                         <th>Rate</th>
//                                         <th>Amount</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     <tr>
//                                         <td>{project?.title || ''}</td>
//                                         <td></td>
//                                         <td></td>
//                                         <td></td>
//                                         <td></td>
//                                     </tr>
//                                 </tbody>
//                                 <tfoot>
//                                     <tr>
//                                         <td colSpan="2"></td>
//                                         <td>Total</td>
//                                         <td></td>
//                                         <td></td>
//                                     </tr>
//                                     <tr>
//                                         <td colSpan="2"></td>
//                                         <td>Add : CGST @</td>
//                                         <td>14%</td>
//                                         <td>-</td>
//                                     </tr>
//                                     <tr>
//                                         <td colSpan="2"></td>
//                                         <td>Add : SGST @</td>
//                                         <td>14%</td>
//                                         <td>-</td>
//                                     </tr>
//                                     <tr>
//                                         <td colSpan="2"></td>
//                                         <td>Grand Total</td>
//                                         <td></td>
//                                         <td>-</td>
//                                     </tr>
//                                 </tfoot>
//                             </table>
//                         </div>

//                         <div className="warranty-section">
//                             <h3>Warranty related Terms & conditions</h3>
//                             <ol>
//                                 <li>An Invoice Must accompany products returned for warranty.</li>
//                                 <li>Goods damaged During transit voids warranty.</li>
//                                 <li>90 days limited warranty unless otherwise stated.</li>
//                                 <li>30 days limited warranty on OEM processor ( an internal parts of the product) exchange the same items only.</li>
//                                 <li>All Items carry MFG Warranty only No return or exchange.</li>
//                             </ol>
//                         </div>

//                         <div className="amount-words">
//                             <p>Total Amount (INR):</p>
//                             <input
//                             className="word-amount-box"
//                             type='number'
//                             value={project?.totalPayment || ''}
//                             readOnly></input>
//                         </div>

//                         <div className="signature-section">
//                             <div>
//                                 <p>For TRISPIDER INNOVATIVE LABS</p>
//                                 <div className="signature-line"></div>
//                                 <p>Authorised Signatory</p>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 <div className="modal-footer">
//                     <button onClick={onClose} className="btn-cancel">Close</button>
//                     <button onClick={() => window.print()} className="btn-print">
//                         Print Invoice
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Invoice;

import React from 'react';
import { X } from "lucide-react";
import './Invoice.css';
import Img from '../../assets/Trispider-Logo-removebg-preview.png'
const Invoice = ({ project, onClose }) => {
    const rate = parseFloat(project?.totalPayment || 0);
    const quantity = parseFloat(project?.quantity || 1);
    const baseAmount = rate * quantity;
    const gstRate = 18;
    const cgstAmount = parseFloat((baseAmount * gstRate) / 100);
    const sgstAmount = parseFloat((baseAmount * gstRate) / 100);
    const grandTotal = parseFloat(baseAmount + cgstAmount + sgstAmount);

    const formatCurrency = (amount) => {
        const numberAmount = parseFloat(amount);
        if (isNaN(numberAmount)) return '0.00';
        return new Intl.NumberFormat('en-IN', {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2
        }).format(numberAmount);
    };
    const getCurrentDate = () => {
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = today.getFullYear();
        return `${day}-${month}-${year}`;
    };
    const getFinancialYear = () => {
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth() + 1;

        if (currentMonth > 3) {
            return `${currentYear}-${String(currentYear + 1).slice(2)}`;
        } else {
            return `${currentYear - 1}-${String(currentYear).slice(2)}`;
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Invoice for {project?.clientName}</h2>
                    <button onClick={onClose} className="close-button">
                        <X size={20} />
                    </button>
                </div>

                <div className="invoice-wrapper">
                    <div className="tax-invoice">
                        <div className="invoice-header">
                            <div className="header-top">
                                <h1>TAX INVOICE</h1>
                                <div className="invoice-number">
                                    <div className="invoice-number">
                                        <p>INVOICE NO : 200 / {getFinancialYear()}</p>
                                        <p>DATE : {getCurrentDate()}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="company-details">
                                <div className="invoice-logo">
                                    <img src={Img}></img>
                                </div>
                                <div className="company-info">
                                    <h2>TRISPIDER INNOVATIVE LABS</h2>
                                    <p>Dodhmane complex, 1st floor,</p>
                                    <p>Muddinaplaya main road, Vishwaneedam</p>
                                    <p>Post, Bangalore-560091</p>
                                </div>
                            </div>

                            <div className="party-details">
                                <h3>Client Name:</h3>
                                <p>{project?.clientName || ''}</p>
                                <p>{project?.collegeName || ''}</p>
                                <p>GSTIN: 07AAFD8457JU3</p>
                            </div>
                        </div>

                        <div className="main-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Particulars (Descriptions & Specifications)</th>
                                        {/* <th>HSN Code</th> */}
                                        <th>Qty</th>
                                        <th>Rate</th>
                                        <th>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="content-row">
                                        <td>{project?.title || ''}</td>
                                        {/* <td></td> */}
                                        <td>{quantity}</td>
                                        <td>₹ {formatCurrency(rate)}</td>
                                        <td>₹ {formatCurrency(baseAmount)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="bottom-section">
                            <div className="warranty-section">
                                <h3>Warranty related Terms & conditions</h3>
                                <ol>
                                    <li>An Invoice Must accompany products returned for warranty.</li>
                                    <li>Goods damaged During transit voids warranty.</li>
                                    <li>90 days limited warranty unless otherwise stated.</li>
                                    <li>30 days limited warranty on OEM processor ( an internal parts of the product) exchange the same items only.</li>
                                    <li>All Items carry MFG Warranty only No return or exchange.</li>
                                </ol>
                            </div>

                            <div className="totals-section">
                                <table>
                                    <tr>
                                        <td>Total</td>
                                        <td>₹ {formatCurrency(baseAmount)}</td>
                                    </tr>
                                    <tr>
                                        <td>Add : CGST @ 18%</td>
                                        <td>₹ {formatCurrency(cgstAmount)}</td>
                                    </tr>
                                    <tr>
                                        <td>Add : SGST @ 18%</td>
                                        <td>₹ {formatCurrency(sgstAmount)}</td>
                                    </tr>
                                    <tr className="grand-total">
                                        <td>Grand Total</td>
                                        <td>₹ {formatCurrency(grandTotal)}</td>
                                    </tr>
                                </table>
                            </div>
                        </div>

                        <div className="amount-words">
                            <p>Total Amount (INR):</p>
                            <input
                                className="word-amount-box"
                                type="text"
                                value={`₹ ${formatCurrency(grandTotal)}`}
                                readOnly
                            />
                        </div>

                        <div className="invoice-signature-section">
                            <div>
                                <p>For TRISPIDER INNOVATIVE LABS</p>
                                <div className="signature-line"></div>
                                <p>Authorised Signatory</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <button onClick={onClose} className="btn-cancel">Close</button>
                    <button onClick={() => window.print()} className="btn-print">
                        Print Invoice
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Invoice;