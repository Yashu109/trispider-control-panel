// import React, { useState } from 'react';
// import './Quotation.css'
// const TrispiderQuotation = ({ scopeOfWork = '' }) => {
//   const [formData, setFormData] = useState({
//     date: '',
//     quotationRef: '',
//     projectName: '',
//     projectDescription: '',
//   });

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const renderScopeOfWork = () => {
//     if (!scopeOfWork) return null;

//     return (
//       <div className="mt-6">
//         <h3 className="text-lg font-bold mb-4">Scope of Work:</h3>
//         <div className="space-y-4">
//           {scopeOfWork.split('\n').map((paragraph, index) => (
//             <p key={index}>{paragraph}</p>
//           ))}
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="max-w-4xl mx-auto bg-white">
//       {/* Header Design */}
//       <div className="h-16 w-full relative">
//         <div className="absolute top-0 left-0 h-full w-1/3 bg-orange-600"></div>
//         <div className="absolute top-0 right-0 h-full w-2/3 bg-blue-800"></div>
//         <div className="absolute top-0 left-1/3 h-full w-8 bg-white transform rotate-45 origin-center translate-x-[-50%]"></div>
//       </div>

//       <div className="p-8">
//         {/* Company Details Section */}
//         <div className="flex justify-between items-start mb-12">
//           <div>
//             <p className="font-bold">GSTIN: 29AAJCT68A1Z3</p>
//             <p>Contact info- +91 88619-38913</p>
//             <p>Email: <a href="mailto:info@trispiders.com" className="text-blue-600">info@trispiders.com</a></p>
//             <p>Website: <a href="http://www.Trispider.com" className="text-blue-600">www.Trispider.com</a></p>
//           </div>
//           <div className="text-right">
//             <img src="/api/placeholder/150/80" alt="Trispider Logo" className="mb-2" />
//             <p>Dodhmane complex, 1st floor,</p>
//             <p>muddinaplaya main road, vishwaneedam</p>
//             <p>post, Bangalore-560091</p>
//           </div>
//         </div>

//         {/* Main Content */}
//         <div className="space-y-6">
//           <div className="flex justify-between">
//             <div>
//               <p>Date: {formData.date || new Date().toLocaleDateString()}</p>
//               <p>Quotation Reference: {formData.quotationRef || 'KS5654'}</p>
//             </div>
//           </div>

//           <p>Dear Client,</p>

//           <p>
//             We are pleased to provide you with a detailed {formData.projectName || '{projectName} (KS5654)'} At
//             Trispider Innovation Labs, we are excited about the opportunity to collaborate with you on this
//             project. Our team is confident that our expertise in development and AI-driven solutions will
//             meet your requirements.
//           </p>

//           {/* Dynamic Scope of Work Section */}
//           {renderScopeOfWork()}

//           <div className="mt-8">
//             <p>Best regards:</p>
//             <p>Trispider Innovation Labs</p>
//             <p>Authorized Signature</p>
//             <div className="mt-4 w-32">
//               <img src="/api/placeholder/120/60" alt="Signature" className="mb-2" />
//               <p>(MD of Trispider Innovation Labs)</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Footer Design */}
//       <div className="h-16 w-full relative mt-8">
//         <div className="absolute bottom-0 left-0 h-full w-1/3 bg-orange-600"></div>
//         <div className="absolute bottom-0 right-0 h-full w-2/3 bg-blue-800"></div>
//         <div className="absolute bottom-0 left-1/3 h-full w-8 bg-white transform rotate-45 origin-center translate-x-[-50%]"></div>
//       </div>
//     </div>
//   );
// };

// export default TrispiderQuotation;

// import React, { useState } from 'react';
// import './Quotation.css';

// const TrispiderQuotation = ({ scopeOfWork = '' }) => {
//   const [formData, setFormData] = useState({
//     date: '',
//     quotationRef: '',
//     projectName: '',
//     projectDescription: '',
//   });

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   return (
//     <div className="quotation-container">
//       {/* Header Section */}
//       <div className="header">
//         <div className="header-left"></div>
//         <div className="header-right"></div>
//       </div>

//       <div className="content">
//         {/* Company Details */}
//         <div className="company-details">
//           <div>
//             <p>GSTIN: 29AAJCT68A1Z3</p>
//             <p>Contact: +91 88619-38913</p>
//             <p>Email: <a href="mailto:info@trispiders.com">info@trispiders.com</a></p>
//             <p>Website: <a href="http://www.Trispider.com">www.Trispider.com</a></p>
//           </div>
//           <div>
//             <p>Dodhmane complex, 1st floor,</p>
//             <p>Muddinaplaya main road, Vishwaneedam</p>
//             <p>Post, Bangalore-560091</p>
//           </div>
//         </div>

//         {/* Quotation Details */}
//         <div className="quotation-details">
//           <p>Date: {formData.date || new Date().toLocaleDateString()}</p>
//           <p>Quotation Reference: {formData.quotationRef || 'KS5654'}</p>
//           <p>Project Name: {formData.projectName || '{projectName}'}</p>
//         </div>

//         {/* Main Content */}
//         <p>Dear Client,</p>
//         <p>
//           We are pleased to provide you with a detailed quotation. At Trispider Innovation Labs, we are
//           excited about the opportunity to collaborate with you on this project.
//         </p>

//         {/* Scope of Work */}
//         {scopeOfWork && (
//           <div>
//             <h3>Scope of Work:</h3>
//             {scopeOfWork.split('\n').map((item, index) => (
//               <p key={index}>{item}</p>
//             ))}
//           </div>
//         )}

//         {/* Footer */}
//         <p>Best regards,</p>
//         <p>Trispider Innovation Labs</p>
//       </div>

//       <div className="footer">
//         <div className="footer-left"></div>
//         <div className="footer-right"></div>
//       </div>
//     </div>
//   );
// };

// export default TrispiderQuotation;


import React from 'react';
import './Quotation.css';
import ImgLogo from '../../assets/Trispider-Logo-removebg-preview.png'

const TrispiderQuotation = ({
    date = new Date().toLocaleDateString(),
    quotationRef = '',
    title = '',
    projectDescription = '',
    scopeOfWork = '',
    clientName = '',
    phoneNumber = '',
    email = '',
    totalPayment = '',
    advancePayment = '',
    discount = '',
    totalRemaining = '',
    timeline = '',
    counterpass = ''
}) => {
    return (
        <div className='quotation-main-container'>
            <div className="quotation-container">
                {/* Header Section */}
                {/* <div className="header">
                <div className="header-left"></div>
                <div className="header-right"></div>
            </div> */}

                <div className="page">
                    <div className="quotation-header">
                        <div className="header-left"></div>
                        <div className="header-right"></div>
                    </div>
                    {/* Company Details */}
                    <div className='middle-content'>


                        <div className="company-details">
                            <div className='company-details-part1'>
                                <p>GSTIN: 29AAJCT68A1Z3</p>
                                <p>Contact: +91 88619-38913</p>
                                <p>Email: <a href="mailto:info@trispiders.com">info@trispiders.com</a></p>
                                <p>Website: <a href="http://www.Trispider.com">www.Trispider.com</a></p>
                            </div>
                            <div className='company-details-part2'>
                                <img className='ImgLogo' src={ImgLogo}></img>
                                <p>Dodhmane complex, 1st floor,</p>
                                <p>Muddinaplaya main road, Vishwaneedam</p>
                                <p>Post, Bangalore-560091</p>
                            </div>
                        </div>

                        {/* Quotation Details */}
                        <div className="quotation-details">
                            <p>Date: {date}</p>
                            <p className='quotationRef'>Quotation Reference: {counterpass || 'projectID'}</p>
                            {/* <p>Project Name: {title}</p> */}
                        </div>

                        {/* Main Content */}
                        <div className='client-quotes'>

                            <p className='clientName'>Dear {clientName || 'Client'},</p>
                            <p className='clientName1'>
                                We are pleased to provide you with a detailed {title || 'title'} ( {counterpass || 'projectID'}) At Trispider Innovation Labs, we are
                                excited about the opportunity to collaborate with you on this project. Our team is confident that our expertise
                                in development and AI-driven solutions will meet your requirements.
                            </p>
                            <p className='clientName2'>
                                Please find the attached quotation, which outlines the scope of work, technology stack, pricing details, and
                                payment terms. Should you have any questions or require further clarifications, feel free to reach out. We are
                                more than happy to schedule a call or meeting to discuss any concerns.
                            </p>
                            <p className='clientName3'>
                                Thank you for considering Trispider Innovation Labs for your project. We look forward to working together to
                                bring {title || 'title'} .
                            </p>
                            <p className='companysign'>
                                <p> Best regards:</p>
                                <p>Trispider Innovation Labs</p>
                                <p>Authorized Signature</p>
                            </p>
                            <p>

                            </p>
                            <p className='companysign3'>
                                (MD of Trispider Innovation Labs)
                            </p>
                        </div>
                    </div>
                    <div className="quotation-footer">
                        <div className="footer-left"></div>
                        <div className="footer-right"></div>
                    </div>
                </div>

            </div>
            <div className="page1">
                <div className="quotation-header">
                    <div className="header-left"></div>
                    <div className="header-right"></div>
                </div>

                <div className="middle-content1">
                    <div className='middle-part1'>

                        <div className='logo-number'>
                            <div className="company-logo">
                                <img className="ImgLogo1" src={ImgLogo} alt="Company Logo" />
                            </div>

                            <div className="quotation-number">
                                <p><span className='p1'>Quotation Number:</span> <span className='p2'>TIL-25112024-{counterpass || 'projectID'}</span></p>
                            </div>
                        </div>
                        <div className="project-overview">
                            <p>Project Overview:{projectDescription}</p>
                            <div className="project-details">
                                <p>Project Name: {title || 'title'} ({counterpass || 'projectID'})</p>
                                <p>Project Description: As discussed, the project involves the design and development {title || 'title'} ({counterpass || 'projectID'})</p>
                            </div>
                        </div>
                    </div>
                    <div className="scope-of-work">
                        <p className="section-title">Scope of Work:</p>
                        {scopeOfWork && (
                            <div className='scope-of'>

                                {scopeOfWork.split('\n').map((item, index) => (
                                    <p key={index}>{item}</p>
                                ))}
                            </div>
                        )}
                        
                        {/* <div className="section">
                            <h3>1. Mechanical System Design & Integration</h3>
                            <div className="subsection">
                                <h4>1.1 {projectName} Structure</h4>
                                <ul>
                                    <li>• Customized Frame Design: Develop a lightweight, ergonomic structure tailored to user-specific dimensions</li>
                                    <li>• Joint Integration:
                                        <ul>
                                            <li>○ Incorporate modular joint systems with multi-axis movement</li>
                                            <li>○ Use 3D-printed or CNC-machined parts</li>
                                        </ul>
                                    </li>
                                </ul>
                            </div>
                        </div> */}
                    </div>
                </div>
                <div className='total-terms'>
                    <p className='cost'>Complete project development cost ={totalPayment} </p>
                    <p className='note'>Note: if any materials already have, we cutdown price according to the prices of the material</p>
                    <p className='terms'>Payment Terms: 30% upfront payment is required to begin the project.</p>
                </div>
                <div className="quotation-footer">
                    <div className="footer-left"></div>
                    <div className="footer-right"></div>
                </div>
            </div>
        </div>
    );
};

export default TrispiderQuotation;
