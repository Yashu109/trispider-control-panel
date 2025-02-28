// import React from 'react';
// import './Quotation.css';
// import ImgLogo from '../../assets/Trispider-Logo-removebg-preview.png'

// const TrispiderQuotation = ({
//     date = new Date().toLocaleDateString(),
//     quotationRef = '',
//     title = '',
//     projectDescription = '',
//     scopeOfWork = '',
//     clientName = '',
//     phoneNumber = '',
//     email = '',
//     totalPayment = '',
//     advancePayment = '',
//     discount = '',
//     totalRemaining = '',
//     timeline = '',
//     counterpass = ''
// }) => {
//     return (
//         <div className='quotation-main-container'>
//             <div className="quotation-container">
//                 {/* Header Section */}
//                 {/* <div className="header">
//                 <div className="header-left"></div>
//                 <div className="header-right"></div>
//             </div> */}

//                 <div className="page">
//                     <div className="quotation-header">
//                         <div className="header-left"></div>
//                         <div className="header-right"></div>
//                     </div>
//                     {/* Company Details */}
//                     <div className='middle-content'>


//                         <div className="company-details">
//                             <div className='company-details-part1'>
//                                 <p>GSTIN: 29AAJCT68A1Z3</p>
//                                 <p>Contact: +91 88619-38913</p>
//                                 <p>Email: <a href="mailto:info@trispiders.com">info@trispiders.com</a></p>
//                                 <p>Website: <a href="http://www.Trispider.com">www.Trispider.com</a></p>
//                             </div>
//                             <div className='company-details-part2'>
//                                 <img className='ImgLogo' src={ImgLogo}></img>
//                                 <p>Dodhmane complex, 1st floor,</p>
//                                 <p>Muddinaplaya main road, Vishwaneedam</p>
//                                 <p>Post, Bangalore-560091</p>
//                             </div>
//                         </div>

//                         {/* Quotation Details */}
//                         <div className="quotation-details">
//                             <p>Date: {date}</p>
//                             <p className='quotationRef'>Quotation Reference: {counterpass || 'projectID'}</p>
//                             {/* <p>Project Name: {title}</p> */}
//                         </div>

//                         {/* Main Content */}
//                         <div className='client-quotes'>

//                             <p className='clientName'>Dear {clientName || 'Client'},</p>
//                             <p className='clientName1'>
//                                 We are pleased to provide you with a detailed {title || 'title'} ( {counterpass || 'projectID'}) At Trispider Innovation Labs, we are
//                                 excited about the opportunity to collaborate with you on this project. Our team is confident that our expertise
//                                 in development and AI-driven solutions will meet your requirements.
//                             </p>
//                             <p className='clientName2'>
//                                 Please find the attached quotation, which outlines the scope of work, technology stack, pricing details, and
//                                 payment terms. Should you have any questions or require further clarifications, feel free to reach out. We are
//                                 more than happy to schedule a call or meeting to discuss any concerns.
//                             </p>
//                             <p className='clientName3'>
//                                 Thank you for considering Trispider Innovation Labs for your project. We look forward to working together to
//                                 bring {title || 'title'} .
//                             </p>
//                             <p className='companysign'>
//                                 <p> Best regards:</p>
//                                 <p>Trispider Innovation Labs</p>
//                                 <p>Authorized Signature</p>
//                             </p>
//                             <p>

//                             </p>
//                             <p className='companysign3'>
//                                 (MD of Trispider Innovation Labs)
//                             </p>
//                         </div>
//                     </div>
//                     <div className="quotation-footer">
//                         <div className="footer-left"></div>
//                         <div className="footer-right"></div>
//                     </div>
//                 </div>

//             </div>
//             <div className="page1">
//                 <div className="quotation-header">
//                     <div className="header-left"></div>
//                     <div className="header-right"></div>
//                 </div>

//                 <div className="middle-content1">
//                     <div className='middle-part1'>

//                         <div className='logo-number'>
//                             <div className="company-logo">
//                                 <img className="ImgLogo1" src={ImgLogo} alt="Company Logo" />
//                             </div>

//                             <div className="quotation-number">
//                                 <p><span className='p1'>Quotation Number:</span> <span className='p2'>TIL-25112024-{counterpass || 'projectID'}</span></p>
//                             </div>
//                         </div>
//                         <div className="project-overview">
//                             <p>Project Overview:{projectDescription}</p>
//                             <div className="project-details">
//                                 <p>Project Name: {title || 'title'} ({counterpass || 'projectID'})</p>
//                                 <p>Project Description: As discussed, the project involves the design and development {title || 'title'} ({counterpass || 'projectID'})</p>
//                             </div>
//                         </div>
//                     </div>
//                     <div className="scope-of-work">
//                         <p className="section-title">Scope of Work:</p>
//                         {scopeOfWork && (
//                             <div className='scope-of' dangerouslySetInnerHTML={{ __html: scopeOfWork }}></div>
//                         )}

//                     </div>
//                 </div>
//                 <div className='total-terms'>
//                     <p className='cost'>Complete project development cost ={totalPayment} </p>
//                     <p className='note'>Note: if any materials already have, we cutdown price according to the prices of the material</p>
//                     <p className='terms'>Payment Terms: 30% upfront payment is required to begin the project.</p>
//                 </div>
//                 <div className="quotation-footer">
//                     <div className="footer-left"></div>
//                     <div className="footer-right"></div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default TrispiderQuotation;
import React, { useState, useRef, useEffect } from 'react';
import './Quotation.css';
import ImgLogo from '../../assets/Trispider-Logo-removebg-preview.png';

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
    counterpass = '',
    onScopeOfWorkChange = (newScopeOfWork) => {} // Callback function to handle scope changes
}) => {
    // State for edit mode and current scope of work
    const [isEditingScope, setIsEditingScope] = useState(false);
    const [currentScopeOfWork, setCurrentScopeOfWork] = useState(scopeOfWork);
    const editorRef = useRef(null);
    
    // Toggle edit mode
    const toggleEditMode = () => {
        setIsEditingScope(!isEditingScope);
    };

    // Apply formatting to editor content
    const formatText = (command, value = null) => {
        if (editorRef.current) {
            document.execCommand(command, false, value);
            editorRef.current.focus();
        }
    };

    // Save changes to scope of work
    const saveScopeChanges = () => {
        if (editorRef.current) {
            const formattedContent = editorRef.current.innerHTML;
            setCurrentScopeOfWork(formattedContent);
            onScopeOfWorkChange(formattedContent);
            setIsEditingScope(false);
        }
    };

    // Cancel editing and revert to original scope
    const cancelEditing = () => {
        setIsEditingScope(false);
    };

    // Set initial content when entering edit mode
    useEffect(() => {
        if (isEditingScope && editorRef.current) {
            editorRef.current.innerHTML = currentScopeOfWork;
        }
    }, [isEditingScope, currentScopeOfWork]);

    return (
        <div className='quotation-main-container'>
            <div className="quotation-container">
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
                            <p></p>
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
                        <div className="section-title-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <p className="section-title">Scope of Work:</p>
                            {!isEditingScope ? (
                                <button 
                                    onClick={toggleEditMode}
                                    style={{
                                        padding: '4px 8px',
                                        backgroundColor: '#4682B4',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Edit
                                </button>
                            ) : (
                                <div>
                                    <button 
                                        onClick={saveScopeChanges}
                                        style={{
                                            padding: '4px 8px',
                                            backgroundColor: '#4CAF50',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            marginRight: '5px'
                                        }}
                                    >
                                        Save
                                    </button>
                                    <button 
                                        onClick={cancelEditing}
                                        style={{
                                            padding: '4px 8px',
                                            backgroundColor: '#f44336',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                        
                        {!isEditingScope ? (
                            // Display mode
                            <div 
                                className='scope-of' 
                                dangerouslySetInnerHTML={{ __html: currentScopeOfWork }}
                                style={{
                                    lineHeight: '1.5',
                                    padding: '10px',
                                }}
                            ></div>
                        ) : (
                            // Rich text editor mode
                            <div>
                                {/* Formatting toolbar */}
                                <div className="rich-text-toolbar" style={{ marginBottom: '10px', padding: '5px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                                    <button type="button" onClick={() => formatText('bold')} style={{ margin: '0 5px', padding: '4px 8px' }}>
                                        <strong>B</strong>
                                    </button>
                                    <button type="button" onClick={() => formatText('italic')} style={{ margin: '0 5px', padding: '4px 8px' }}>
                                        <em>I</em>
                                    </button>
                                    <button type="button" onClick={() => formatText('underline')} style={{ margin: '0 5px', padding: '4px 8px' }}>
                                        <u>U</u>
                                    </button>
                                    <button type="button" onClick={() => formatText('justifyLeft')} style={{ margin: '0 5px', padding: '4px 8px' }}>
                                        ←
                                    </button>
                                    <button type="button" onClick={() => formatText('justifyCenter')} style={{ margin: '0 5px', padding: '4px 8px' }}>
                                        ↔
                                    </button>
                                    <button type="button" onClick={() => formatText('justifyRight')} style={{ margin: '0 5px', padding: '4px 8px' }}>
                                        →
                                    </button>
                                    <button type="button" onClick={() => formatText('justifyFull')} style={{ margin: '0 5px', padding: '4px 8px' }}>
                                        ≡
                                    </button>
                                    <button type="button" onClick={() => formatText('insertUnorderedList')} style={{ margin: '0 5px', padding: '4px 8px' }}>
                                        • List
                                    </button>
                                    <button type="button" onClick={() => formatText('insertOrderedList')} style={{ margin: '0 5px', padding: '4px 8px' }}>
                                        1. List
                                    </button>
                                    <select 
                                        onChange={(e) => formatText('formatBlock', e.target.value)} 
                                        style={{ margin: '0 5px', padding: '4px' }}
                                    >
                                        <option value="">Format</option>
                                        <option value="h1">Heading 1</option>
                                        <option value="h2">Heading 2</option>
                                        <option value="h3">Heading 3</option>
                                        <option value="p">Paragraph</option>
                                    </select>
                                </div>
                                
                                {/* Editable content area */}
                                <div
                                    ref={editorRef}
                                    contentEditable={true}
                                    style={{
                                        width: '100%',
                                        minHeight: '200px',
                                        padding: '10px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        fontFamily: 'inherit',
                                        fontSize: 'inherit',
                                        lineHeight: '1.5',
                                        overflowY: 'auto'
                                    }}
                                />
                            </div>
                        )}
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