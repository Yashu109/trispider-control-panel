// import React from 'react';
// import { X } from "lucide-react";
// import './InVoice.css';
// import Img from '../../assets/Trispider-Logo-removebg-preview.png'
// const Invoice = ({ project, onClose }) => {
//     const rate = parseFloat(project?.totalPayment || 0);
//     const quantity = parseFloat(project?.quantity || 1);
//     const baseAmount = rate * quantity;
//     const gstRate = 9;
//     const cgstAmount = parseFloat((baseAmount * gstRate) / 100);
//     const sgstAmount = parseFloat((baseAmount * gstRate) / 100);
//     const grandTotal = parseFloat(baseAmount + cgstAmount + sgstAmount);

//     const formatCurrency = (amount) => {
//         const numberAmount = parseFloat(amount);
//         if (isNaN(numberAmount)) return '0.00';
//         return new Intl.NumberFormat('en-IN', {
//             maximumFractionDigits: 2,
//             minimumFractionDigits: 2
//         }).format(numberAmount);
//     };
//     const getCurrentDate = () => {
//         const today = new Date();
//         const day = String(today.getDate()).padStart(2, '0');
//         const month = String(today.getMonth() + 1).padStart(2, '0');
//         const year = today.getFullYear();
//         return `${day}-${month}-${year}`;
//     };
//     const getFinancialYear = () => {
//         const today = new Date();
//         const currentYear = today.getFullYear();
//         const currentMonth = today.getMonth() + 1;

//         if (currentMonth > 3) {
//             return `${currentYear}-${String(currentYear + 1).slice(2)}`;
//         } else {
//             return `${currentYear - 1}-${String(currentYear).slice(2)}`;
//         }
//     };

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
//                                     <div className="invoice-number">
//                                         <p>INVOICE NO : 200 / {getFinancialYear()}</p>
//                                         <p>DATE : {getCurrentDate()}</p>
//                                     </div>
//                                 </div>
//                             </div>

//                             <div className="company-details">
//                                 {/* <div className="invoice-logo">
//                                     <img src={Img}></img>
//                                 </div> */}
//                                 <div className="company-info">
//                                     <h2>TRISPIDER PRIVATE LIMITED</h2>
//                                     <p>GSTIN: 29AALCT3687J1ZI</p>
//                                     <p>Dodhmane complex, 1st floor,</p>
//                                     <p>Muddinaplaya main road, Vishwaneedam</p>
//                                     <p>Post, Bangalore-560091</p>
//                                 </div>
//                             </div>

//                             <div className="party-details">
//                                 <h3>Client Name:</h3>
//                                 <p>{project?.clientName || ''}</p>
//                                 <p>{project?.collegeName || ''}</p>

//                             </div>
//                         </div>

//                         <div className="main-table">
//                             <table>
//                                 <thead>
//                                     <tr>
//                                         <th>SR No</th>
//                                         <th>Item & Description</th>
//                                         <th>HSN</th>
//                                         <th>Qty</th>
//                                         <th>Product Rate</th>
//                                         <th>Disc.</th>
//                                         <th>Taxable Amt.</th>
//                                         <th>CGST</th>
//                                         <th>S/UT GST</th>
//                                         <th>CGST Amt.</th>
//                                         <th>S/UT GST Amt.</th>
//                                         <th>Cess</th>
//                                         <th>Cess Amt.</th>
//                                         <th>Total Amt.</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     <tr className="content-row">
//                                         <td>{project?.title || ''}</td>
//                                         {/* <td></td> */}
//                                         <td>{quantity}</td>
//                                         <td>₹ {formatCurrency(rate)}</td>
//                                         <td>₹ {formatCurrency(baseAmount)}</td>
//                                     </tr>
//                                 </tbody>
//                             </table>
//                         </div>

//                         <div className="bottom-section">
//                             <div className="warranty-section">
//                                 <h3>Warranty related Terms & conditions</h3>
//                                 <ol>
//                                     <li>An Invoice Must accompany products returned for warranty.</li>
//                                     <li>Goods damaged During transit voids warranty.</li>
//                                     <li>90 days limited warranty unless otherwise stated.</li>
//                                     <li>30 days limited warranty on OEM processor ( an internal parts of the product) exchange the same items only.</li>
//                                     <li>All Items carry MFG Warranty only No return or exchange.</li>
//                                 </ol>
//                             </div>

//                             <div className="totals-section">
//                                 <table>
//                                     <tr>
//                                         <td>Total</td>
//                                         <td>₹ {formatCurrency(baseAmount)}</td>
//                                     </tr>
//                                     <tr>
//                                         <td>Add : CGST @ 9%</td>
//                                         <td>₹ {formatCurrency(cgstAmount)}</td>
//                                     </tr>
//                                     <tr>
//                                         <td>Add : SGST @ 9%</td>
//                                         <td>₹ {formatCurrency(sgstAmount)}</td>
//                                     </tr>
//                                     <tr className="grand-total">
//                                         <td>Grand Total</td>
//                                         <td>₹ {formatCurrency(grandTotal)}</td>
//                                     </tr>
//                                 </table>
//                             </div>
//                         </div>

//                         <div className="amount-words">
//                             <p>Total Amount (INR):</p>
//                             <input
//                                 className="word-amount-box"
//                                 type="text"
//                                 value={`₹ ${formatCurrency(grandTotal)}`}
//                                 readOnly
//                             />
//                         </div>

//                         <div className="invoice-signature-section">
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


import React, { useState } from 'react';
import { X, Printer } from "lucide-react";
import './InVoice.css';

const InvoiceComponent = ({ invoiceData, project, onClose }) => {
    const [quantity, setQuantity] = useState(parseFloat(project?.quantity || 1));

    const handleQuantityChange = (e) => {
        const newQuantity = parseFloat(e.target.value);
        setQuantity(newQuantity);
    };

    const rate = parseFloat(project?.totalPayment || 0);
    // const discountRate = parseFloat(project?.discount)/100;
    const gstRate = 5 / 100;
    const packagingFee = 12.91;

    const baseAmount = rate * quantity;
    const discountAmount = parseFloat(project?.discount)
    const taxableAmount = baseAmount - discountAmount;
    const cgstAmount = taxableAmount * (gstRate / 2);
    const sgstAmount = taxableAmount * (gstRate / 2);
    const grandTotal = taxableAmount + cgstAmount + sgstAmount + packagingFee;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-IN", {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2,
        }).format(parseFloat(amount) || 0);
    };

    const getCurrentDate = () => {
        const today = new Date();
        return `${String(today.getDate()).padStart(2, "0")}-${String(today.getMonth() + 1).padStart(2, "0")}-${today.getFullYear()}`;
    };

    const getFinancialYear = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;
        return month >= 4 ? `${year}-${String(year + 1).slice(-2)}` : `${year - 1}-${String(year).slice(-2)}`;
    };

    const getStoredSerialNumber = (key) => {
        return parseInt(localStorage.getItem(key) || "0", 10) || 0;
    };

    const [invoiceSerial, setInvoiceSerial] = useState(getStoredSerialNumber("lastInvoiceSerialNumber"));
    const [orderSerial, setOrderSerial] = useState(getStoredSerialNumber("lastOrderSerialNumber"));

    const generateInvoiceNumber = () => {
        return `TRY${getFinancialYear()}-${String(invoiceSerial + 1).padStart(4, "0")}`;
    };

    const generateOrderNumber = () => {
        const today = new Date();
        return `ORD${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}-${String(orderSerial + 1).padStart(4, "0")}`;
    };

    const handlePrint = () => {
        const printContent = document.querySelector(".invoice-modal-content");
        const originalContent = document.body.innerHTML;

        document.body.innerHTML = printContent.innerHTML;
        window.print();
        document.body.innerHTML = originalContent;
        window.location.reload();

        const newInvoiceSerial = invoiceSerial + 1;
        const newOrderSerial = orderSerial + 1;

        localStorage.setItem("lastInvoiceSerialNumber", newInvoiceSerial);
        localStorage.setItem("lastOrderSerialNumber", newOrderSerial);

        setInvoiceSerial(newInvoiceSerial);
        setOrderSerial(newOrderSerial);
    };
    const annexureData = [
        { taxRate: "5.0%", cessRate: "0.0%", taxableValue: 9.59, cgst: 0.24, sgst: 0.24, cess: 0.0 },
        { taxRate: "18.0%", cessRate: "0.0%", taxableValue: 2.4, cgst: 0.22, sgst: 0.22, cess: 0.0 },
        { taxRate: "Total", cessRate: "", taxableValue: taxableAmount, cgst: cgstAmount, sgst: sgstAmount, cess: 0.0 },
    ];
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="invoice-modal-content" onClick={(e) => e.stopPropagation()}>

                <div className="invoice-container">
                    {/* Page 1 */}
                    <div className="invoice-page">
                        <div className="invoice-header">
                            <div className="company-info">
                                <h1>TRISPIDER PRIVATE LIMITED</h1>
                                <p>Dodhmane complex, 1st floor, Muddinaplaya main road, Vishwaneedam, Post, Bangalore-560091</p>
                                <p>GSTIN: 29AALCT3687J1ZI</p>
                                <p>FSSAI: 11521998000248</p>
                            </div>
                        </div>

                        <div className="invoice-title">TAX INVOICE/BILL OF SUPPLY</div>

                        <div className="invoice-details">
                            <div className="invoice-details-left">
                                <p><strong>Invoice No. :</strong> {generateInvoiceNumber()}</p>
                                <p><strong>Order No :</strong> {generateOrderNumber()}</p>
                            </div>
                            <div className="invoice-details-right">
                                <p><strong>Place Of Supply :</strong> Karnataka (29)</p>
                                <p className='Date'><strong>Date </strong>: {getCurrentDate()}</p>
                            </div>
                        </div>

                        <div className="address-section">
                            <div className="bill-to">
                                <div className="section-title">Bill To</div>
                                <div className="address-content">
                                    <h3>{project?.clientName || ''}</h3>
                                    <p>{project?.collegeName || ''}</p>
                                </div>
                            </div>
                        </div>

                        <div className="invoice-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>SR No</th>
                                        <th>Item & Description</th>
                                        <th>Qty</th>
                                        <th>Product Rate</th>
                                        <th>Disc.</th>
                                        <th>Taxable Amt.</th>
                                        <th>CGST</th>
                                        <th>S/UT GST</th>
                                        <th>CGST Amt.</th>
                                        <th>S/UT GST Amt.</th>
                                        
                                        <th>Total Amt.</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>1</td>
                                        <td>{project?.title || ''}</td>
                                        <td>{quantity}
                                            {handleQuantityChange}
                                            {/* Dynamic Quantity Input */}
                                            {/* <input
                                                type="number"
                                                value={quantity}
                                                onChange={handleQuantityChange}
                                                min="1"
                                            /> */}
                                        </td>
                                        <td>{project?.totalPayment || ''}</td>
                                        <td>{project?.discount || ''}</td>
                                        <td>{formatCurrency(taxableAmount)}</td>
                                        <td>9%</td>
                                        <td>9%</td>
                                        <td>{formatCurrency(cgstAmount)}</td>
                                        <td>{formatCurrency(sgstAmount)}</td>
                                        
                                        <td>{formatCurrency(grandTotal)}</td>
                                    </tr>
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan="5"></td>
                                        <td>{formatCurrency(taxableAmount)}</td>
                                        <td colSpan="2"></td>
                                        <td>{formatCurrency(cgstAmount)}</td>
                                        <td>{formatCurrency(sgstAmount)}</td>
                                       
                                        <td>{formatCurrency(grandTotal)}</td>
                                    </tr>
                                </tfoot>

                            </table>
                        </div>

                        <div className="invoice-summary">
                            <div className="summary-item">
                                <span>Item Total</span>
                                <span>{formatCurrency(grandTotal)}</span>
                            </div>
                            {/* <div className="summary-item">
                                <span>Packaging Fee (Inclusive of Taxes)</span>
                                <span>12.91</span>
                            </div> */}
                            <div className="summary-item total">
                                <span>Invoice Value</span>
                                <span>{formatCurrency(grandTotal)}</span>
                            </div>
                        </div>

                        <div className="invoice-footer">
                            <p>Whether GST is payable on reverse charge - No.</p>
                            <div className="footer-note">
                                <p>Charges/Fees mentioned above (For instance, Delivery Charges, Surge Fees, Packaging Charges, etc.)
                                    are apportioned to each product included in this invoice in the ratio of taxable value for
                                    computation of applicable Goods and Services Tax and/or Compensation Cess, and accordingly, Goods
                                    and Services Tax and/or Compensation Cess are computed, disclosed (please refer to the annexure) and
                                    collected in the invoice</p>
                            </div>
                            <div className="signature-section">
                                <p>Authorized Signatory</p>
                            </div>
                        </div>
                    </div>

                    {/* Page 2 - Annexure */}
                    {/* <div className="invoice-page annexure">
                        <div className="invoice-header">
                            <div className="company-info">
                                <h1>TRISPIDER PRIVATE LIMITED</h1>
                                <p>Dodhmane complex, 1st floor, Muddinaplaya main road, Vishwaneedam, Post, Bangalore-560091</p>
                                <p>GSTIN: 29AALCT3687J1ZI</p>
                                <p>FSSAI: 11521998000248</p>
                            </div>
                        </div>

                        <div className="annexure-title">Annexure</div>

                        <div className="annexure-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Tax Rate</th>
                                        <th>Cess Rate</th>
                                        <th>Taxable Value</th>
                                        <th>CGST</th>
                                        <th>S/UT GST</th>
                                        <th>Cess</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {annexureData.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.taxRate}</td>
                                            <td>{item.cessRate}</td>
                                            <td>{formatCurrency(item.taxableValue)}</td>
                                            <td>{formatCurrency(item.cgst)}</td>
                                            <td>{formatCurrency(item.sgst)}</td>
                                            <td>{formatCurrency(item.cess)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div> */}
                </div>
                <div className="modal-actions">
                    <button onClick={onClose} className="invoice-close-button">
                        <X size={20} /> Cancel
                    </button>
                    <button onClick={handlePrint} className="print-button">
                        <Printer size={20} /> Print
                    </button>

                </div>
            </div>
        </div>
    );
};

export default InvoiceComponent;
