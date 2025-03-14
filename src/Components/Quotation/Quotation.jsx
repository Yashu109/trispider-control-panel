
// import React, { useState, useRef, useEffect } from 'react';
// import './Quotation.css';
// import ImgLogo from '../../assets/Spherenex-Logo1.jpg';
// import Sign from '../../assets/Signature.png'
// const TrispiderQuotation = ({
//     date = new Date().toLocaleDateString(),
//     quotationRef = '',
//     title = '',
//     description = '',
//     scopeOfWork = '',
//     clientName = '',
//     phoneNumber = '',
//     email = '',
//     totalPayment = '',
//     advancePayment = '',
//     discount = '',
//     totalRemaining = '',
//     timeline = '',
//     counterpass = '',
//     onScopeOfWorkChange = (newScopeOfWork) => { } // Callback function to handle scope changes
// }) => {
//     // State for edit mode and current scope of work
//     const [isEditingScope, setIsEditingScope] = useState(false);
//     const [currentScopeOfWork, setCurrentScopeOfWork] = useState(scopeOfWork);
//     const editorRef = useRef(null);

//     // Toggle edit mode
//     const toggleEditMode = () => {
//         setIsEditingScope(!isEditingScope);
//     };

//     // Apply formatting to editor content
//     const formatText = (command, value = null) => {
//         if (editorRef.current) {
//             document.execCommand(command, false, value);
//             editorRef.current.focus();
//         }
//     };

//     // Save changes to scope of work
//     const saveScopeChanges = () => {
//         if (editorRef.current) {
//             const formattedContent = editorRef.current.innerHTML;
//             setCurrentScopeOfWork(formattedContent);
//             onScopeOfWorkChange(formattedContent);
//             setIsEditingScope(false);
//         }
//     };

//     // Cancel editing and revert to original scope
//     const cancelEditing = () => {
//         setIsEditingScope(false);
//     };

//     // Set initial content when entering edit mode
//     useEffect(() => {
//         if (isEditingScope && editorRef.current) {
//             editorRef.current.innerHTML = currentScopeOfWork;
//         }
//     }, [isEditingScope, currentScopeOfWork]);

//     return (
//         <div className='quotation-main-container'>
//             <div className="quotation-container">
//                 <div className="page">
//                     <div className="quotation-header">
//                         <div className="header-left"></div>
//                         <div className="header-right"></div>
//                     </div>
//                     {/* Company Details */}



//                     <div className='middle-content'>
//                         <div className="company-details">
//                             <div className='company-details-part1'>
//                                 {/* <p>GSTIN: 29AAJCT68A1Z3</p> */}
//                                 <p>Contact info- 91+ 88619-38913</p>
//                                 <p>Email: <a href="mailto:info@spherenex.com">info@spherenex.com</a></p>
//                                 {/* <p>Website: <a href="http://www.Trispider.com">www.Trispider.com</a></p> */}
//                             </div>
//                             <div className='company-details-part2'>
//                                 <img className='ImgLogo' src={ImgLogo}></img>
//                                 <p>#46 / 58 chunchghatta main road,</p>
//                                 <p>JP Nagar 7th Phase Bengaluru - 560062</p>

//                             </div>

//                         </div>

//                         {/* Quotation Details */}
//                         <div className="quotation-details">
//                             <p>Date - {date}</p> : <p>{counterpass || 'ProjectID'}</p>
//                             {/* <div className='quot-ref'>
//                             <p className='quotationRef'>Quotation Reference:</p> 
//                             </div> */}
//                         </div>

//                         {/* Main Content */}
//                         <div className='client-quotes'>
//                             <p className='clientName'>Dear <strong>{clientName || 'Client'}</strong></p>
//                             <p className='clientName1'>
//                                 We are writing to provide you with a detailed quotation for <strong>{title || 'title'} ( {counterpass || 'projectID'})</strong>, our team at Spherenex Innovation Labs
//                                 is excited about the opportunity to work with you on    this project and we believe that our expertise and experience in the development field will make us a great fit for your needs
//                             </p>
//                             <p className='clientName2'>
//                                 Attached is a detailed quotation outlining the scope of work, technologies, pricing   information, and payment terms.
//                             </p>
//                             <p className='clientName12'>
//                                 If you have any questions or concerns regarding the quotation, please don't hesitate to  reach out to us.
//                                 We would be more than happy to schedule a call or meeting to discuss  the project further and address any questions you may have.
//                             </p>

//                             <p className='clientName3'>
//                                 Thank you for considering Spherenex Innovation Labs for your  <strong>{title || 'title'} - {counterpass || 'projectID'}</strong>
//                                 we look forward to the opportunity to work with you.
//                             </p>
//                             <p className='companysign'>
//                                 <p> Warm regards,:</p>
//                                 {/* <p>Trispider Innovation Labs</p>
//                                 <p>Authorized Signature</p> */}
//                             </p>
//                             <p className='companysign3'>
//                                 <img src={Sign}></img>
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
//                         {/* <div className='logo-number'>
//                         <div>QUOTATION</div>

//                             <div className="company-logo">
//                                 <img className="ImgLogo1" src={ImgLogo} alt="Company Logo" />
//                             </div>
//                             <div className="quotation-number">
//                                 <p><span className='p1'>Quotation Number:</span> <span className='p2'>TIL-25112024-{counterpass || 'projectID'}</span></p>
//                             </div>
//                         </div> */}
//                         <div className='logo-number'>
//                             <div className="quotation-title">
//                                 <span className="quot-part">QUOT</span><span className="ation-part">ATION</span>
//                             </div>

//                             <div className="company-logo">
//                                 <img className="ImgLogo1" src={ImgLogo} alt="Company Logo" />
//                             </div>
//                             <div className="quotation-number">
//                                 <p><span className='p1'>Quotation Number:</span> <span className='p2'>TIL-25112024-{counterpass || 'projectID'}</span></p>
//                             </div>
//                         </div>
//                         <div className="project-overview">
//                             <p>Project Overview:{description}</p>
//                             <div className="project-details">
//                                 <p>Project Name: {title || 'title'} ({counterpass || 'projectID'})</p>
//                                 <p>Project Description: As discussed, the project involves the design and development {title || 'title'} ({counterpass || 'projectID'})</p>
//                             </div>
//                         </div>
//                     </div>
//                     <div className="scope-of-work">
//                         <div className="section-title-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                             <p className="section-title">Scope of Work:</p>
//                             {!isEditingScope ? (
//                                 <button
//                                     onClick={toggleEditMode}
//                                     style={{
//                                         padding: '4px 8px',
//                                         backgroundColor: '#4682B4',
//                                         color: 'white',
//                                         border: 'none',
//                                         borderRadius: '4px',
//                                         cursor: 'pointer'
//                                     }}
//                                 >
//                                     Edit
//                                 </button>
//                             ) : (
//                                 <div>
//                                     <button
//                                         onClick={saveScopeChanges}
//                                         style={{
//                                             padding: '4px 8px',
//                                             backgroundColor: '#4CAF50',
//                                             color: 'white',
//                                             border: 'none',
//                                             borderRadius: '4px',
//                                             cursor: 'pointer',
//                                             marginRight: '5px'
//                                         }}
//                                     >
//                                         Save
//                                     </button>
//                                     <button
//                                         onClick={cancelEditing}
//                                         style={{
//                                             padding: '4px 8px',
//                                             backgroundColor: '#f44336',
//                                             color: 'white',
//                                             border: 'none',
//                                             borderRadius: '4px',
//                                             cursor: 'pointer'
//                                         }}
//                                     >
//                                         Cancel
//                                     </button>
//                                 </div>
//                             )}
//                         </div>

//                         {!isEditingScope ? (
//                             // Display mode
//                             <div
//                                 className='scope-of'
//                                 dangerouslySetInnerHTML={{ __html: currentScopeOfWork }}
//                                 style={{
//                                     lineHeight: '1.5',
//                                     padding: '10px',
//                                 }}
//                             ></div>
//                         ) : (
//                             // Rich text editor mode
//                             <div>
//                                 {/* Formatting toolbar */}
//                                 <div className="rich-text-toolbar" style={{ marginBottom: '10px', padding: '5px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
//                                     <button type="button" onClick={() => formatText('bold')} style={{ margin: '0 5px', padding: '4px 8px' }}>
//                                         <strong>B</strong>
//                                     </button>
//                                     <button type="button" onClick={() => formatText('italic')} style={{ margin: '0 5px', padding: '4px 8px' }}>
//                                         <em>I</em>
//                                     </button>
//                                     <button type="button" onClick={() => formatText('underline')} style={{ margin: '0 5px', padding: '4px 8px' }}>
//                                         <u>U</u>
//                                     </button>
//                                     <button type="button" onClick={() => formatText('justifyLeft')} style={{ margin: '0 5px', padding: '4px 8px' }}>
//                                         ←
//                                     </button>
//                                     <button type="button" onClick={() => formatText('justifyCenter')} style={{ margin: '0 5px', padding: '4px 8px' }}>
//                                         ↔
//                                     </button>
//                                     <button type="button" onClick={() => formatText('justifyRight')} style={{ margin: '0 5px', padding: '4px 8px' }}>
//                                         →
//                                     </button>
//                                     <button type="button" onClick={() => formatText('justifyFull')} style={{ margin: '0 5px', padding: '4px 8px' }}>
//                                         ≡
//                                     </button>
//                                     <button type="button" onClick={() => formatText('insertUnorderedList')} style={{ margin: '0 5px', padding: '4px 8px' }}>
//                                         • List
//                                     </button>
//                                     <button type="button" onClick={() => formatText('insertOrderedList')} style={{ margin: '0 5px', padding: '4px 8px' }}>
//                                         1. List
//                                     </button>
//                                     <select
//                                         onChange={(e) => formatText('formatBlock', e.target.value)}
//                                         style={{ margin: '0 5px', padding: '4px' }}
//                                     >
//                                         <option value="">Format</option>
//                                         <option value="h1">Heading 1</option>
//                                         <option value="h2">Heading 2</option>
//                                         <option value="h3">Heading 3</option>
//                                         <option value="p">Paragraph</option>
//                                     </select>
//                                 </div>

//                                 {/* Editable content area */}
//                                 <div
//                                     ref={editorRef}
//                                     contentEditable={true}
//                                     style={{
//                                         width: '100%',
//                                         minHeight: '95vh',
//                                         padding: '21px',
//                                         border: '1px solid #ccc',
//                                         borderRadius: '4px',
//                                         fontFamily: 'inherit',
//                                         fontSize: 'inherit',
//                                         lineHeight: '1.5',
//                                         overflowY: 'auto'
//                                     }}
//                                 />
//                             </div>
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


// import React, { useState, useRef, useEffect } from 'react';
// import './Quotation.css';
// import ImgLogo from '../../assets/Spherenex-Logo1.jpg';
// import Sign from '../../assets/Signature.png';

// const TrispiderQuotation = ({
//     date = new Date().toLocaleDateString(),
//     quotationRef = '',
//     title = '',
//     description = '',
//     scopeOfWork = '',
//     clientName = '',
//     phoneNumber = '',
//     email = '',
//     totalPayment = '',
//     advancePayment = '',
//     discount = '',
//     totalRemaining = '',
//     timeline = '',
//     counterpass = '',
//     onScopeOfWorkChange = (newScopeOfWork) => { }
// }) => {
//     const [isEditingScope, setIsEditingScope] = useState(false);
//     const [currentScopeOfWork, setCurrentScopeOfWork] = useState(scopeOfWork);
//     const [pages, setPages] = useState([scopeOfWork]); // State to manage multiple pages
//     const editorRef = useRef(null);

//     const toggleEditMode = () => {
//         setIsEditingScope(!isEditingScope);
//     };

//     const formatText = (command, value = null) => {
//         if (editorRef.current) {
//             document.execCommand(command, false, value);
//             editorRef.current.focus();
//         }
//     };

//     const saveScopeChanges = () => {
//         if (editorRef.current) {
//             const formattedContent = editorRef.current.innerHTML;
//             setCurrentScopeOfWork(formattedContent);
//             onScopeOfWorkChange(formattedContent);
//             setIsEditingScope(false);

//             // Split content into pages if it exceeds a certain length
//                 const maxCharsPerPage = 2000; // Adjust this value based on your page size
//                 const newPages = [];
//                 for (let i = 0; i < formattedContent.length; i += maxCharsPerPage) {
//                     newPages.push(formattedContent.slice(i, i + maxCharsPerPage));
//                 }
//             setPages(newPages);
//         }
//     };

//     const cancelEditing = () => {
//         setIsEditingScope(false);
//     };

//     useEffect(() => {
//         if (isEditingScope && editorRef.current) {
//             editorRef.current.innerHTML = currentScopeOfWork;
//         }
//     }, [isEditingScope, currentScopeOfWork]);

//     return (
//         <div className='quotation-main-container'>
//             <div className="quotation-container">
//                 {/* Page 1 */}
//                 <div className="page">
//                     <div className="quotation-header">
//                         <div className="header-left"></div>
//                         <div className="header-right"></div>
//                     </div>
//                     <div className='middle-content'>
//                         <div className="company-details">
//                             <div className='company-details-part1'>
//                                 <p>Contact info- 91+ 88619-38913</p>
//                                 <p>Email: <a href="mailto:info@spherenex.com">info@spherenex.com</a></p>
//                             </div>
//                             <div className='company-details-part2'>
//                                 <img className='ImgLogo' src={ImgLogo} alt="Company Logo" />
//                                 <p>#46 / 58 chunchghatta main road,</p>
//                                 <p>JP Nagar 7th Phase Bengaluru - 560062</p>
//                             </div>
//                         </div>
//                         <div className="quotation-details">
//                             <p>Date - {date}</p> : <p>{counterpass || 'ProjectID'}</p>
//                         </div>
//                         <div className='client-quotes'>
//                             <p className='clientName'>Dear <strong>{clientName || 'Client'}</strong></p>
//                             <p className='clientName1'>
//                                 We are writing to provide you with a detailed quotation for <strong>{title || 'title'} ( {counterpass || 'projectID'})</strong>, our team at Spherenex Innovation Labs
//                                 is excited about the opportunity to work with you on this project and we believe that our expertise and experience in the development field will make us a great fit for your needs
//                             </p>
//                             <p className='clientName2'>
//                                 Attached is a detailed quotation outlining the scope of work, technologies, pricing information, and payment terms.
//                             </p>
//                             <p className='clientName12'>
//                                 If you have any questions or concerns regarding the quotation, please don't hesitate to reach out to us.
//                                 We would be more than happy to schedule a call or meeting to discuss the project further and address any questions you may have.
//                             </p>
//                             <p className='clientName3'>
//                                 Thank you for considering Spherenex Innovation Labs for your <strong>{title || 'title'} - {counterpass || 'projectID'}</strong>
//                                 we look forward to the opportunity to work with you.
//                             </p>
//                             <p className='companysign'>
//                                 <p> Warm regards,:</p>
//                             </p>
//                             <p className='companysign3'>
//                                 <img src={Sign} alt="Signature" />
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

//                 {/* Page 2 and Additional Pages */}
//                 {pages.map((pageContent, index) => (
//                     <div key={index} className={index > 0 ? 'page new-page' : 'page1'}>
//                         <div className="quotation-header">
//                             <div className="header-left"></div>
//                             <div className="header-right"></div>
//                         </div>
//                         <div className="middle-content1">
//                             {/* Conditionally render the header sections only on the first page */}
//                             {index === 0 && (
//                                 <div className='middle-part1'>
//                                     <div className='logo-number'>
//                                         <div className="quotation-title">
//                                             <span className="quot-part">QUOT</span><span className="ation-part">ATION</span>
//                                         </div>
//                                         <div className="company-logo">
//                                             <img className="ImgLogo1" src={ImgLogo} alt="Company Logo" />
//                                         </div>
//                                         <div className="quotation-number">
//                                             <p><span className='p1'>Quotation Number:</span> <span className='p2'>TIL-25112024-{counterpass || 'projectID'}</span></p>
//                                         </div>
//                                     </div>
//                                     <div className="project-overview">
//                                         <p>Project Overview:{description}</p>
//                                         <div className="project-details">
//                                             <p>Project Name: {title || 'title'} ({counterpass || 'projectID'})</p>
//                                             <p>Project Description: As discussed, the project involves the design and development {title || 'title'} ({counterpass || 'projectID'})</p>
//                                         </div>
//                                     </div>
//                                 </div>
//                             )}

//                             {/* Scope of Work Section */}
//                             <div className="scope-of-work">
//                                 <div className="section-title-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                                     <p className="section-title">Scope of Work:</p>
//                                     {!isEditingScope && index === 0 ? ( // Show Edit button only on the first page
//                                         <button
//                                             onClick={toggleEditMode}
//                                             style={{
//                                                 padding: '4px 8px',
//                                                 backgroundColor: '#4682B4',
//                                                 color: 'white',
//                                                 border: 'none',
//                                                 borderRadius: '4px',
//                                                 cursor: 'pointer'
//                                             }}
//                                         >
//                                             Edit
//                                         </button>
//                                     ) : isEditingScope && index === 0 ? ( // Show Save and Cancel buttons only on the first page
//                                         <div>
//                                             <button
//                                                 onClick={saveScopeChanges}
//                                                 style={{
//                                                     padding: '4px 8px',
//                                                     backgroundColor: '#4CAF50',
//                                                     color: 'white',
//                                                     border: 'none',
//                                                     borderRadius: '4px',
//                                                     cursor: 'pointer',
//                                                     marginRight: '5px'
//                                                 }}
//                                             >
//                                                 Save
//                                             </button>
//                                             <button
//                                                 onClick={cancelEditing}
//                                                 style={{
//                                                     padding: '4px 8px',
//                                                     backgroundColor: '#f44336',
//                                                     color: 'white',
//                                                     border: 'none',
//                                                     borderRadius: '4px',
//                                                     cursor: 'pointer'
//                                                 }}
//                                             >
//                                                 Cancel
//                                             </button>
//                                         </div>
//                                     ) : null}
//                                 </div>
//                                 {!isEditingScope ? (
//                                     <div
//                                         className='scope-of'
//                                         dangerouslySetInnerHTML={{ __html: pageContent }}
//                                         style={{
//                                             lineHeight: '1.5',
//                                             padding: '10px',
//                                         }}
//                                     ></div>
//                                 ) : index === 0 ? ( // Show the editor only on the first page
//                                     <div>
//                                         <div className="rich-text-toolbar" style={{ marginBottom: '10px', padding: '5px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
//                                             <button type="button" onClick={() => formatText('bold')} style={{ margin: '0 5px', padding: '4px 8px' }}>
//                                                 <strong>B</strong>
//                                             </button>
//                                             <button type="button" onClick={() => formatText('italic')} style={{ margin: '0 5px', padding: '4px 8px' }}>
//                                                 <em>I</em>
//                                             </button>
//                                             <button type="button" onClick={() => formatText('underline')} style={{ margin: '0 5px', padding: '4px 8px' }}>
//                                                 <u>U</u>
//                                             </button>
//                                             <button type="button" onClick={() => formatText('justifyLeft')} style={{ margin: '0 5px', padding: '4px 8px' }}>
//                                                 ←
//                                             </button>
//                                             <button type="button" onClick={() => formatText('justifyCenter')} style={{ margin: '0 5px', padding: '4px 8px' }}>
//                                                 ↔
//                                             </button>
//                                             <button type="button" onClick={() => formatText('justifyRight')} style={{ margin: '0 5px', padding: '4px 8px' }}>
//                                                 →
//                                             </button>
//                                             <button type="button" onClick={() => formatText('justifyFull')} style={{ margin: '0 5px', padding: '4px 8px' }}>
//                                                 ≡
//                                             </button>
//                                             <button type="button" onClick={() => formatText('insertUnorderedList')} style={{ margin: '0 5px', padding: '4px 8px' }}>
//                                                 • List
//                                             </button>
//                                             <button type="button" onClick={() => formatText('insertOrderedList')} style={{ margin: '0 5px', padding: '4px 8px' }}>
//                                                 1. List
//                                             </button>
//                                             <select
//                                                 onChange={(e) => formatText('formatBlock', e.target.value)}
//                                                 style={{ margin: '0 5px', padding: '4px' }}
//                                             >
//                                                 <option value="">Format</option>
//                                                 <option value="h1">Heading 1</option>
//                                                 <option value="h2">Heading 2</option>
//                                                 <option value="h3">Heading 3</option>
//                                                 <option value="p">Paragraph</option>
//                                             </select>
//                                         </div>
//                                         <div
//                                             ref={editorRef}
//                                             contentEditable={true}
//                                             style={{
//                                                 width: '100%',
//                                                 minHeight: '45vh',
//                                                 padding: '21px',
//                                                 border: '1px solid #ccc',
//                                                 borderRadius: '4px',
//                                                 fontFamily: 'inherit',
//                                                 fontSize: 'inherit',
//                                                 lineHeight: '1.5',
//                                                 overflowY: 'auto'
//                                             }}
//                                         />
//                                     </div>
//                                 ) : null}
//                             </div>
//                         </div>
//                         <div className='total-terms'>
//                             <p className='cost'>Complete project development cost ={totalPayment} </p>
//                             <p className='note'>Note: if any materials already have, we cutdown price according to the prices of the material</p>
//                             <p className='terms'>Payment Terms: 30% upfront payment is required to begin the project.</p>
//                         </div>
//                         <div className="quotation-footer">
//                             <div className="footer-left"></div>
//                             <div className="footer-right"></div>
//                         </div>
//                     </div>
//                 ))}

//                 {/* Final Page */}
//                 {/* <div className="page new-page">
//                     <div className="quotation-header">
//                         <div className="header-left"></div>
//                         <div className="header-right"></div>
//                     </div>
//                     <div className="middle-content1">
//                         <div className="final-page-content">
//                             <h2>Pricing for Hands on Learning and Development</h2>
//                             <p>RS 1099 /- per person + 0 (GST)</p>
//                             <p>Workshop online meet will be commences from 28-10-2024 to 10-11-2024</p>
//                             <p>In between 30-10-2024, 31-10-2024, 1-10-2024 No classes during this time</p>
//                             <p>Payment Term: 100% of payment should be fully filled by the Client.</p>

//                             <h2>Features:</h2>
//                             <ul>
//                                 <li>Certificate will be provided after the completion of workshop authorized by MSME and Udyaam with AICTE Approved.</li>
//                                 <li>15-17 Hour of workshop will be conducted based on the client’s timeline.</li>
//                                 <li>Moto of workshop is to educate the client from basic to project understanding level.</li>
//                                 <li>Materials and components will be provided.</li>
//                                 <li>Multiple sensor integration</li>
//                                 <li>Different method of communication integration</li>
//                                 <li>Hands on experience with various controller</li>
//                                 <li>Multiple software platform integration</li>
//                                 <li>Mechanical CAD design</li>
//                                 <li>3D printing</li>
//                                 <li>PCB hardware integration and many more.</li>
//                             </ul>

//                             <h2>Terms and Conditions:</h2>
//                             <ul>
//                                 <li>No free Replacement in case of physical damage caused after delivery.</li>
//                                 <li>It is client responsibility to ensure everything is working at the time of delivery.</li>
//                                 <li>Any minor error will be resolved based on schedule timeline.</li>
//                                 <li>It is client responsibility to ensure to collect the project by specified time, in case of any delay in collecting the project we may not guarantee the delivery of project.</li>
//                                 <li>No refund and return policy.</li>
//                                 <li>Any customization of the project other than current working model cost you additional charges.</li>
//                             </ul>

//                             <div className="authorized-signature">
//                                 <p>Authorized Signature</p>
//                                 <img src={Sign} alt="Signature" />
//                                 <p>(MD of Spherenex Innovation Labs)</p>
//                             </div>
//                         </div>
//                     </div>
//                     <div className="quotation-footer">
//                         <div className="footer-left"></div>
//                         <div className="footer-right"></div>
//                     </div>
//                 </div> */}
//                 <div className="page new-page">
//                     <div className="quotation-header">
//                         <div className="header-left"></div>
//                         <div className="header-right"></div>
//                     </div>
//                     <div className="middle-content1">
//                         <div className="final-page-content">
//                             {/* Terms and Conditions Section */}
//                             <div className="terms-section">
//                                 <h2>Terms and Conditions:</h2>
//                                 <ul>
//                                     <li>No free Replacement in case of <strong>physical damage</strong> caused after delivery.</li>
//                                     <li>It is <strong>client responsibility</strong> to ensure everything is working at the time of delivery.</li>
//                                     <li>Any minor error will be resolved based on <strong>schedule timeline</strong>.</li>
//                                     <li>It is <strong>client responsibility</strong> to ensure to collect the project by specified time, in case of any delay in collecting the project we may not guarantee the delivery of project.</li>
//                                     <li><strong>No refund and return policy</strong>.</li>
//                                     <li>Any customization of the project other than current working model cost you <strong>additional charges</strong>.</li>
//                                 </ul>
//                             </div>

//                             {/* Authorized Signature Section */}
//                             <div className="authorized-signature">
//                                 <p>Authorized Signature</p>
//                                 <img src={Sign} alt="Signature" />
//                                 <p>[MD of Spherenex Innovation Labs]</p>
//                             </div>
//                         </div>
//                     </div>
//                     <div className="quotation-footer">
//                         <div className="footer-left"></div>
//                         <div className="footer-right"></div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default TrispiderQuotation;
import React, { useState, useRef, useEffect } from 'react';
import './Quotation.css';
import ImgLogo from '../../assets/Spherenex-Logo1.jpg';
import Sign from '../../assets/Signature.png';

const TrispiderQuotation = ({
    date = new Date().toLocaleDateString(),
    quotationRef = '',
    title = '',
    description = '',
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
    onScopeOfWorkChange = (newScopeOfWork) => { }
}) => {
    const [isEditingScope, setIsEditingScope] = useState(false);
    const [currentScopeOfWork, setCurrentScopeOfWork] = useState(scopeOfWork);
    const [pages, setPages] = useState([scopeOfWork]); // State to manage multiple pages
    const editorRef = useRef(null);
    const scopeOfWorkSectionRef = useRef(null);

    const toggleEditMode = () => {
        setIsEditingScope(!isEditingScope);

        // Scroll to the editing section after a short delay to ensure the DOM has updated
        setTimeout(() => {
            if (scopeOfWorkSectionRef.current) {
                scopeOfWorkSectionRef.current.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }, 100);
    };

    const formatText = (command, value = null) => {
        if (editorRef.current) {
            document.execCommand(command, false, value);
            editorRef.current.focus();
        }
    };

    // const saveScopeChanges = () => {
    //     if (editorRef.current) {
    //         const formattedContent = editorRef.current.innerHTML;
    //         setCurrentScopeOfWork(formattedContent);
    //         onScopeOfWorkChange(formattedContent);
    //         setIsEditingScope(false);

    //         // Split content into pages if it exceeds a certain length
    //         const maxCharsPerPage = 3500; // Adjust this value based on your page size
    //         const newPages = [];
    //         for (let i = 0; i < formattedContent.length; i += maxCharsPerPage) {
    //             newPages.push(formattedContent.slice(i, i + maxCharsPerPage));
    //         }
    //         setPages(newPages);
    //     }
    // };
    const splitContentIntoPages = (htmlContent) => {
        // Split the content into logical blocks (e.g., paragraphs, headings, lists)
        const blocks = htmlContent.split(/(<\/p>|<\/h\d>|<\/ul>|<\/ol>)/g);

        const pages = [];
        let currentPage = '';
        let currentLength = 0;
        const maxCharsPerPage = 4000; // Adjust this value based on your page size

        blocks.forEach((block) => {
            const blockLength = block.length;

            // If adding the block exceeds the max characters per page, start a new page
            if (currentLength + blockLength > maxCharsPerPage && currentPage !== '') {
                pages.push(currentPage); // Push the current page
                currentPage = ''; // Start a new page
                currentLength = 0;
            }

            // Add the block to the current page
            currentPage += block;
            currentLength += blockLength;
        });

        // Push the last page if it has content
        if (currentPage) {
            pages.push(currentPage);
        }

        return pages;
    };
    const saveScopeChanges = () => {
        if (editorRef.current) {
            const formattedContent = editorRef.current.innerHTML;

            // Clean and format the content
            const cleanedContent = formattedContent
                .replace(/&amp;/g, '&') // Fix double-escaped ampersands
                .replace(/&lt;/g, '<') // Fix double-escaped less than
                .replace(/&gt;/g, '>') // Fix double-escaped greater than
                .replace(/<\/?pre>/g, '') // Remove pre tags
                .trim();

            // Set the current scope of work
            setCurrentScopeOfWork(cleanedContent);
            onScopeOfWorkChange(cleanedContent);
            setIsEditingScope(false);

            // Split content into pages based on logical blocks
            const newPages = splitContentIntoPages(cleanedContent);
            setPages(newPages);
        }
    };
    const cancelEditing = () => {
        setIsEditingScope(false);
    };

    useEffect(() => {
        if (isEditingScope && editorRef.current) {
            editorRef.current.innerHTML = currentScopeOfWork;

            // Scroll to the editor if text is long
            setTimeout(() => {
                if (scopeOfWorkSectionRef.current) {
                    scopeOfWorkSectionRef.current.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }, 100);
        }
    }, [isEditingScope, currentScopeOfWork]);

    return (
        <div className='quotation-main-container'>
            <div className="quotation-container">
                {/* Page 1 */}
                <div className="page">
                    <div className="quotation-header">
                        <div className="header-left"></div>
                        <div className="header-right"></div>
                    </div>
                    <div className='middle-content'>
                        <div className="company-details">
                            <div className='company-details-part1'>
                                <p>Contact info- 91+ 88619-38913</p>
                                <p>Email: <a href="mailto:info@spherenex.com">info@spherenex.com</a></p>
                            </div>
                            <div className='company-details-part2'>
                                <img className='ImgLogo' src={ImgLogo} alt="Company Logo" />
                                <p>#46 / 58 chunchghatta main road,</p>
                                <p>JP Nagar 7th Phase Bengaluru - 560062</p>
                            </div>
                        </div>
                        <div className="quotation-details">
                            <p>Date - {date}</p> : <p>{counterpass || 'ProjectID'}</p>
                        </div>
                        <div className='client-quotes'>
                            <p className='clientName'>Dear <strong>{clientName || 'Client'}</strong></p>
                            <p className='clientName1'>
                                We are writing to provide you with a detailed quotation for <strong>{title || 'title'} ( {counterpass || 'projectID'})</strong>, our team at Spherenex Innovation Labs
                                is excited about the opportunity to work with you on this project and we believe that our expertise and experience in the development field will make us a great fit for your needs
                            </p>
                            <p className='clientName2'>
                                Attached is a detailed quotation outlining the scope of work, technologies, pricing information, and payment terms.
                            </p>
                            <p className='clientName12'>
                                If you have any questions or concerns regarding the quotation, please don't hesitate to reach out to us.
                                We would be more than happy to schedule a call or meeting to discuss the project further and address any questions you may have.
                            </p>
                            <p className='clientName3'>
                                Thank you for considering Spherenex Innovation Labs for your <strong>{title || 'title'} - {counterpass || 'projectID'}</strong>
                                we look forward to the opportunity to work with you.
                            </p>
                            <p className='companysign'>
                                <p> Warm regards,:</p>
                            </p>
                            <p className='companysign3'>
                                <img src={Sign} alt="Signature" />
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

                {/* Page 2 and Additional Pages */}
                {pages.map((pageContent, index) => (
                    <div key={index} className={index > 0 ? 'page new-page' : 'page1'}>
                        <div className="quotation-header">
                            <div className="header-left"></div>
                            <div className="header-right"></div>
                        </div>
                        <div className="middle-content1">
                            {/* Conditionally render the header sections only on the first page */}
                            {index === 0 && (
                                <div className='middle-part1'>
                                    <div className='logo-number'>
                                        <div className="quotation-title">
                                            <span className="quot-part">QUOT</span><span className="ation-part">ATION</span>
                                        </div>
                                        <div className="company-logo">
                                            <img className="ImgLogo1" src={ImgLogo} alt="Company Logo" />
                                        </div>
                                        <div className="quotation-number">
                                            <p><span className='p1'>Quotation Number:</span> <span className='p2'>TIL-25112024-{counterpass || 'projectID'}</span></p>
                                        </div>
                                    </div>
                                    <div className="project-overview">
                                        <p>Project Overview:{description}</p>
                                        <div className="project-details">
                                            <p>Project Name: {title || 'title'} ({counterpass || 'projectID'})</p>
                                            <p>Project Description: As discussed, the project involves the design and development {title || 'title'} ({counterpass || 'projectID'})</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Scope of Work Section */}
                            <div
                                ref={scopeOfWorkSectionRef}
                                className="scope-of-work"
                            >
                                <div className="section-title-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <p className="section-title">Scope of Work:</p>
                                    {!isEditingScope && index === 0 ? ( // Show Edit button only on the first page
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
                                    ) : isEditingScope && index === 0 ? ( // Show Save and Cancel buttons only on the first page
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
                                    ) : null}
                                </div>
                                {!isEditingScope ? (
                                    <div
                                        className='scope-of'
                                        dangerouslySetInnerHTML={{ __html: pageContent }}
                                        style={{
                                            lineHeight: '1.5',
                                            padding: '10px',
                                        }}
                                    ></div>
                                ) : index === 0 ? ( // Show the editor only on the first page
                                    <div>
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
                                        <div
                                            ref={editorRef}
                                            contentEditable={true}
                                            style={{
                                                width: '100%',
                                                minHeight: '45vh',
                                                maxHeight: '65vh', // Added max height for scrolling
                                                overflowY: 'auto', // Added vertical scrolling
                                                padding: '21px',
                                                border: '1px solid #ccc',
                                                borderRadius: '4px',
                                                fontFamily: 'inherit',
                                                fontSize: 'inherit',
                                                lineHeight: '1.5',
                                            }}
                                        />
                                    </div>
                                ) : null}
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
                ))}

                {/* Final Page with Terms and Conditions */}
                <div className="page new-page">
                    <div className="quotation-header">
                        <div className="header-left"></div>
                        <div className="header-right"></div>
                    </div>
                    <div className="middle-content1">
                        <div className="final-page-content">
                            {/* Terms and Conditions Section */}
                            <div className="terms-section">
                                <h2>Terms and Conditions:</h2>
                                <ul>
                                    <li>No free Replacement in case of <strong>physical damage</strong> caused after delivery.</li>
                                    <li>It is<strong>client responsibility</strong> to ensure everything is working at the time of delivery.</li>
                                    <li>Any minor error will be resolved based on <strong>schedule timeline</strong>.</li>
                                    <li>It is <strong>client responsibility</strong> to ensure to collect the project by specified time, in case of any delay in collecting the project we may not guarantee the delivery of project.</li>
                                    <li><strong>No refund and return policy</strong>.</li>
                                    <li>Any customization of the project other than current working model cost you <strong>additional charges</strong>.</li>
                                </ul>
                            </div>

                            {/* Authorized Signature Section */}
                            <div className="authorized-signature">
                                <p>Authorized Signature</p>
                                <img src={Sign} alt="Signature" />
                                <p>[MD of Spherenex Innovation Labs]</p>
                            </div>
                        </div>
                    </div>
                    <div className="quotation-footer">
                        <div className="footer-left"></div>
                        <div className="footer-right"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrispiderQuotation;