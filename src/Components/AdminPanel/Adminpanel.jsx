import { useState, useEffect, useRef } from 'react';
import { database, auth, storage } from '../../firebase';
import { ref, set, get } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import './Adminpanel.css';
import Quotation from '../Quotation/Quotation'
import Splitslayout from '../Splitslayout/Splitslayout'
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { uploadString, ref as storageRef, getDownloadURL } from 'firebase/storage';

const AdminPanel = () => {
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const workerRef = useRef(null);
    const quotationRef = useRef(null);
    // const [projectCounter, setProjectCounter] = useState(5000);
    // Form stage state
    const [formStage, setFormStage] = useState('basic'); // 'basic' or 'details'
    const [pdfUrl, setPdfUrl] = useState(null);
    // Basic form states
    const [isDrawing, setIsDrawing] = useState(false);
    const [inputMode, setInputMode] = useState('keyboard');
    const [context, setContext] = useState(null);
    const [lastX, setLastX] = useState(0);
    const [lastY, setLastY] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [recognizedText, setRecognizedText] = useState('');
    const [counterpass, setCounterpass] = useState('');
    // Task assignment state with initial 100% for first person
    const [assignments, setAssignments] = useState([
        { id: 1, assignee: '', description: '', percentage: '100' }
    ]);

    // Helper function to calculate even percentage splits
    const calculateEvenSplit = (numberOfPeople) => {
        const percentage = (100 / numberOfPeople).toFixed(0);
        return percentage;
    };

    // Combined project data state
    const [projectData, setProjectData] = useState({
        // Basic form fields
        title: '',
        description: '',
        scopeOfWork: '',

        // Detail form fields
        clientName: '',
        email: '',
        phoneNumber: '',
        whatsappNumber: '',
        alternativeNumber: '',
        collegeName: '',
        referredBy: '',
        ProjectType: '',
        projectSelection: '',
        totalPayment: '',
        advancePayment: '',
        discount: '',
        totalRemaining: '',
        timeline: '',
        Assign_To: '',

        // Assignments
        assignments: [],
    });

    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [editingId, setEditingId] = useState(null);

    // Assignment handlers
    // const handleAddAssignment = () => {
    //     const newAssignments = [
    //         ...assignments,
    //         { id: assignments.length + 1, assignee: '' }
    //     ];

    //     // Calculate even split for all assignees
    //     const evenPercentage = calculateEvenSplit(newAssignments.length);
    //     newAssignments.forEach(assignment => {
    //         assignment.percentage = evenPercentage;
    //     });

    //     setAssignments(newAssignments);
    //     setProjectData(prev => ({
    //         ...prev,
    //         assignments: newAssignments
    //     }));

    //     // Display message showing the split
    //     setMessage(`Work split evenly: ${evenPercentage}% per person`);
    //     setTimeout(() => setMessage(''), 3000);
    // };
    const handleAddAssignment = () => {
        const newAssignments = [
            ...assignments,
            { id: assignments.length + 1, assignee: '', description: '' }
        ];

        // Calculate even split for all assignees
        const evenPercentage = calculateEvenSplit(newAssignments.length);
        newAssignments.forEach(assignment => {
            assignment.percentage = evenPercentage;
        });

        setAssignments(newAssignments);
        setProjectData(prev => ({
            ...prev,
            assignments: newAssignments
        }));

        // Display message showing the split
        setMessage(`Work split evenly: ${evenPercentage}% per person`);
        setTimeout(() => setMessage(''), 3000);
    };
    //  
    //     if (assignments.length > 1) {
    //         const newAssignments = assignments.filter(assignment => assignment.id !== id);

    //         // Recalculate even split for remaining assignees
    //         const evenPercentage = calculateEvenSplit(newAssignments.length);
    //         newAssignments.forEach(assignment => {
    //             assignment.percentage = evenPercentage;
    //         });

    //         setAssignments(newAssignments);
    //         setProjectData(prev => ({
    //             ...prev,
    //             assignments: newAssignments
    //         }));

    //         // Display message showing the new split
    //         setMessage(`Work split evenly: ${evenPercentage}% per person`);
    //         setTimeout(() => setMessage(''), 3000);
    //     }
    // };
    const handleRemoveAssignment = (id) => {
        if (assignments.length > 1) {
            const newAssignments = assignments.filter(assignment => assignment.id !== id);

            // Recalculate even split for remaining assignees
            const evenPercentage = calculateEvenSplit(newAssignments.length);
            newAssignments.forEach(assignment => {
                assignment.percentage = evenPercentage;
            });

            setAssignments(newAssignments);
            setProjectData(prev => ({
                ...prev,
                assignments: newAssignments
            }));

            // Display message showing the new split
            setMessage(`Work split evenly: ${evenPercentage}% per person`);
            setTimeout(() => setMessage(''), 3000);
        }
    };
    // const handleAssignmentChange = (id, field, value) => {
    //     if (field === 'assignee') {
    //         const updatedAssignments = assignments.map(assignment => {
    //             if (assignment.id === id) {
    //                 return { ...assignment, assignee: value };
    //             }
    //             return assignment;
    //         });

    //         setAssignments(updatedAssignments);

    //         // Update both assignments array and Assign_To field
    //         const assigneeNames = updatedAssignments
    //             .map(a => a.assignee)
    //             .filter(name => name.trim() !== '')
    //             .join(', ');

    //         setProjectData(prev => ({
    //             ...prev,
    //             assignments: updatedAssignments,
    //             Assign_To: assigneeNames
    //         }));
    //     }
    // };

    const handleAssignmentChange = (id, field, value) => {
        const updatedAssignments = assignments.map(assignment => {
            if (assignment.id === id) {
                return { ...assignment, [field]: value };
            }
            return assignment;
        });

        setAssignments(updatedAssignments);

        // Update both assignments array and Assign_To field
        const assigneeNames = updatedAssignments
            .map(a => a.assignee)
            .filter(name => name.trim() !== '')
            .join(', ');

        setProjectData(prev => ({
            ...prev,
            assignments: updatedAssignments,
            Assign_To: assigneeNames
        }));
    };
    // Form stage handlers
    const handleStageChange = () => {
        if (formStage === 'basic') {
            if (!projectData.title || !projectData.description) {
                setMessage('Please fill in title and description');
                return;
            }

            if (inputMode === 'keyboard' && !projectData.scopeOfWork) {
                setMessage('Please enter scope of work');
                return;
            }

            if (inputMode === 'pen' && !canvasRef.current) {
                setMessage('Please draw or write scope of work');
                return;
            }

            if (inputMode === 'pen') {
                handleCanvasContent();
            }

            setFormStage('details');
        } else {
            setFormStage('basic');
        }
        setMessage('');
    };

    // const handleChange = (e) => {
    //     const { name, value } = e.target;
    //     setProjectData(prevState => ({
    //         ...prevState,
    //         [name]: value
    //     }));
    // };
    const handleChange = (e) => {
        const { name, value } = e.target;
        
        setProjectData(prevState => {
            const newState = {
                ...prevState,
                [name]: value
            };
    
            // Auto-calculate remaining amount when total, advance, or discount changes
            if (['totalPayment', 'advancePayment', 'discount'].includes(name)) {
                const total = parseFloat(name === 'totalPayment' ? value : newState.totalPayment) || 0;
                const advance = parseFloat(name === 'advancePayment' ? value : newState.advancePayment) || 0;
                const discount = parseFloat(name === 'discount' ? value : newState.discount) || 0;
                
                // Calculate remaining amount
                const remaining = total - advance - discount;
                
                // Update the remaining amount, ensuring it's not negative
                newState.totalRemaining = Math.max(0, remaining).toString();
            }
    
            return newState;
        });
    };
    // Canvas handlers
    useEffect(() => {
        if (inputMode === 'pen' && canvasRef.current) {
            const canvas = canvasRef.current;
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;

            const ctx = canvas.getContext('2d');
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            setContext(ctx);
        }
    }, [inputMode]);

    const startDrawing = (e) => {
        e.preventDefault();
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();

        const x = e.type.includes('mouse')
            ? e.clientX - rect.left
            : e.touches[0].clientX - rect.left;
        const y = e.type.includes('mouse')
            ? e.clientY - rect.top
            : e.touches[0].clientY - rect.top;

        setIsDrawing(true);
        setLastX(x);
        setLastY(y);
    };

    const draw = (e) => {
        if (!isDrawing || !context) return;
        e.preventDefault();

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();

        const x = e.type.includes('mouse')
            ? e.clientX - rect.left
            : e.touches[0].clientX - rect.left;
        const y = e.type.includes('mouse')
            ? e.clientY - rect.top
            : e.touches[0].clientY - rect.top;

        context.beginPath();
        context.moveTo(lastX, lastY);
        context.lineTo(x, y);
        context.stroke();
        context.closePath();

        setLastX(x);
        setLastY(y);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        if (context && canvasRef.current) {
            context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            setRecognizedText('');
        }
    };

    // Form submission and related handlers
    const generateProjectId = async () => {
        try {
            const projectsRef = ref(database, 'projects');
            const snapshot = await get(projectsRef);

            let counter = 5000;
            if (snapshot.exists()) {
                const projects = Object.keys(snapshot.val());
                if (projects.length > 0) {
                    const projectNumbers = projects
                        .filter(id => id.startsWith('KS'))
                        .map(id => parseInt(id.substring(2)))
                        .filter(num => !isNaN(num));

                    if (projectNumbers.length > 0) {
                        counter = Math.max(...projectNumbers) + 1;
                    }
                }
            }
            console.log(`KS${counter}`, 'counter')
            const counterpass = `KS${counter}`;
            setCounterpass(counterpass);
            return counterpass;

        } catch (error) {
            console.error('Error generating project ID:', error);
            return `KS5000`; // Fallback to KS5000 if error
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        try {
            // Generate project ID and save to main database
            const projectId = editingId || await generateProjectId();
            const projectRef = ref(database, `projects/${projectId}`);
            const timestamp = new Date().toISOString().split("T")[0];

            const finalProjectData = {
                ...projectData,
                assignments: assignments.filter(a => a.assignee.trim() !== ''),
                timestamp,
                projectId,
            };

            await set(projectRef, finalProjectData);

            // Generate PDF from quotation component
            if (!quotationRef.current) {
                throw new Error('Quotation component reference is missing');
            }

            const canvas = await html2canvas(quotationRef.current, {
                scale: 2,
                useCORS: true,
                logging: true,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 120;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            const pdfData = pdf.output('datauristring');

            // Upload PDF to secondary storage
            const pdfRef = storageRef(storage, `quotations/${projectId}.pdf`);
            await uploadString(pdfRef, pdfData, 'data_url');
            const downloadUrl = await getDownloadURL(pdfRef);
            setPdfUrl(downloadUrl);
            alert(`Order Created Successfully!\nProject ID: ${projectId}`);
            resetForm();
        } catch (error) {
            console.error('Submission error:', error);
            setMessage(`Error: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    //    const handleSubmit = async (e) => {
    //     e.preventDefault();
    //     setIsLoading(true);
    //     setMessage('');

    //     try {
    //         const projectId = editingId || await generateProjectId();
    //         const projectRef = ref(database, `projects/${projectId}`);
    //         const timestamp = new Date().toISOString().split("T")[0];

    //         const finalProjectData = {
    //             ...projectData,
    //             assignments: assignments.filter(a => a.assignee.trim() !== ''),
    //             timestamp,
    //             projectId,
    //         };

    //         await set(projectRef, finalProjectData);

    //         if (!quotationRef.current) {
    //             throw new Error('Quotation component reference is missing.');
    //         }

    //         const options = {
    //             scale: 2,
    //             useCORS: true,
    //             logging: true,
    //             backgroundColor: '#ffffff',
    //         };

    //         // Debug logging
    //         console.log('Generating canvas for quotation');
    //         const canvas = await html2canvas(quotationRef.current, options);
    //         console.log('Canvas generation successful');

    //         const blob = await new Promise((resolve, reject) => {
    //             canvas.toBlob((blob) => {
    //                 if (blob) resolve(blob);
    //                 else reject(new Error('Failed to create PNG blob.'));
    //             }, 'image/png');
    //         });

    //         const imgData = await new Promise((resolve, reject) => {
    //             const reader = new FileReader();
    //             reader.onload = () => resolve(reader.result);
    //             reader.onerror = () => reject(new Error('Failed to read PNG blob.'));
    //             reader.readAsDataURL(blob);
    //         });

    //         const imgWidth = 210;
    //         const imgHeight = (canvas.height * imgWidth) / canvas.width;

    //         const pdf = new jsPDF('p', 'mm', 'a4');
    //         pdf.setFillColor(255, 255, 255);
    //         pdf.rect(0, 0, imgWidth, 297, 'F');
    //         pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight, '', 'FAST');

    //         const pdfBase64 = pdf.output('datauristring');

    //         // Debug logging for PDF upload
    //         console.log('Preparing to upload PDF to secondary database');
    //         const secondaryRef = ref(storage, `quotations/${projectId}`);

    //         try {
    //             await set(secondaryRef, {
    //                 quotationPDF: pdfBase64,
    //                 projectId,
    //                 timestamp,
    //             });
    //             console.log('PDF uploaded successfully');
    //         } catch (uploadError) {
    //             console.error('Error uploading PDF to secondary database:', uploadError);
    //             throw uploadError;
    //         }

    //         alert(`Order Created Successfully!\nProject ID: ${projectId}`);
    //         resetForm();
    //     } catch (error) {
    //         console.error('Full submission error:', error);
    //         setMessage(`Error: ${error.message}`);
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };

    const handleViewPdf = () => {
        if (pdfUrl) {
            window.open(pdfUrl, '_blank');
        }
    };

    const resetForm = () => {
        setProjectData({
            title: '',
            description: '',
            scopeOfWork: '',
            clientName: '',
            email: '',
            phoneNumber: '',
            whatsappNumber: '',
            alternativeNumber: '',
            collegeName: '',
            referredBy: '',
            ProjectType: '',
            projectSelection: '',
            totalPayment: '',
            advancePayment: '',
            discount: '',
            totalRemaining: '',
            timeline: '',
            Assign_To: '',
        });
        setAssignments([{ id: 1, assignee: '', percentage: '100' }]);
        setEditingId(null);
        setFormStage('basic');
        setRecognizedText('');
        if (inputMode === 'pen') {
            clearCanvas();
        }
    };

    const handleSignOut = async () => {
        try {
            await auth.signOut();
            navigate('/');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const handleInputModeChange = (mode) => {
        setInputMode(mode);
        if (mode === 'keyboard' && recognizedText) {
            setProjectData(prev => ({
                ...prev,
                scopeOfWork: recognizedText
            }));
        }
    };

    const handleCanvasContent = async () => {
        if (canvasRef.current && workerRef.current) {
            try {
                const imageData = canvasRef.current.toDataURL();
                const { data: { text } } = await workerRef.current.recognize(imageData);
                setRecognizedText(text);
                setProjectData(prev => ({
                    ...prev,
                    scopeOfWork: text
                }));
            } catch (error) {
                console.error('Error performing OCR:', error);
                setMessage('Error converting drawing to text. Please try again.');
            }
        }
    };

    const handleSaveDrawing = async () => {
        setIsProcessing(true);
        try {
            await handleCanvasContent();
        } finally {
            setIsProcessing(false);
        }
    };

    // const handleNextPage = () => {
    //     navigate('/admin-profile');
    // };

    return (
        <Splitslayout
            quotationPreview={
                <div ref={quotationRef} >
                    <Quotation
                        {...projectData}
                        counterpass={counterpass}
                    // Add other props as needed
                    />
                    
                </div>
            }
        >
            <div className="admin-container">
                <div className="admin-header">
                    <div className="header-titles">
                        <h1 className='h1'>{formStage === 'basic' ? 'Admin Panel' : 'Quotation Creation'}</h1>
                        <h3 className='h3'>
                            {formStage === 'basic' ?
                                (editingId ? 'Edit Project' : 'Add New Project') :
                                'Client Profile'}
                        </h3>
                    </div>
                    <button onClick={handleSignOut} className="sign-out-button">
                        Sign Out
                    </button>
                </div>
                <div className="quotation">
                    {/* <Quotation scopeOfWork={projectData.scopeOfWork} /> */}

                </div>
                <form onSubmit={handleSubmit} className="admin-panel-project-form ">
                    {formStage === 'basic' ? (
                        // Basic Project Information Form
                        <>
                            <div className="form-group-Project-Title">
                                <label htmlFor="title">Project Title:</label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={projectData.title}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter project title"
                                />
                            </div>

                            <div className="form-group ">
                                <label htmlFor="description">Project Description:</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={projectData.description}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter project description"
                                    rows="4"
                                />
                            </div>

                            <div className="form-group scope-of-work">
                                <label htmlFor="scopeOfWork">Scope of Work:</label>
                                <div className="input-mode-toggle">
                                    <button
                                        type="button"
                                        className={`mode-button ${inputMode === 'keyboard' ? 'active' : ''}`}
                                        onClick={() => handleInputModeChange('keyboard')}
                                    >
                                        Keyboard
                                    </button>
                                    <button
                                        type="button"
                                        className={`mode-button ${inputMode === 'pen' ? 'active' : ''}`}
                                        onClick={() => handleInputModeChange('pen')}
                                    >
                                        Pen
                                    </button>
                                </div>

                                {inputMode === 'keyboard' ? (
                                    <textarea
                                        id="scopeOfWork"
                                        name="scopeOfWork"
                                        value={projectData.scopeOfWork}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter scope of work"
                                        rows="6"
                                    />
                                ) : (
                                    <div className="canvas-container">
                                        <canvas
                                            ref={canvasRef}
                                            className="drawing-canvas"
                                            onMouseDown={startDrawing}
                                            onMouseMove={draw}
                                            onMouseUp={stopDrawing}
                                            onMouseOut={stopDrawing}
                                            onTouchStart={startDrawing}
                                            onTouchMove={draw}
                                            onTouchEnd={stopDrawing}
                                        />
                                        <div className="canvas-controls">
                                            <button
                                                type="button"
                                                className="clear-canvas"
                                                onClick={clearCanvas}
                                                disabled={isProcessing}
                                            >
                                                Clear Drawing
                                            </button>
                                            <button
                                                type="button"
                                                className="save-drawing"
                                                onClick={handleSaveDrawing}
                                                disabled={isProcessing}
                                            >
                                                {isProcessing ? 'Converting...' : 'Convert to Text'}
                                            </button>
                                        </div>

                                        {recognizedText && (
                                            <div className="recognized-text">
                                                <h4>Recognized Text:</h4>
                                                <p>{recognizedText}</p>
                                            </div>
                                        )}
                                        {isProcessing && (
                                            <div className="processing-overlay">
                                                <div className="spinner"></div>
                                                <p>Converting handwriting to text...</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        // Project Details Form
                        <>
                            <div className="scrollable-content">
                                <div className="form-group">
                                    <label htmlFor="clientName">Client Name:</label>
                                    <input
                                        type="text"
                                        id="clientName"
                                        name="clientName"
                                        value={projectData.clientName}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter client name"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="phoneNumber">Phone Number:</label>
                                    <input
                                        type="tel"
                                        id="phoneNumber"
                                        name="phoneNumber"
                                        value={projectData.phoneNumber}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter phone number"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="whatsappNumber">WhatsApp Number:</label>
                                    <input
                                        type="tel"
                                        id="whatsappNumber"
                                        name="whatsappNumber"
                                        value={projectData.whatsappNumber}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter WhatsApp number"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="alternativeNumber">Alternative Number:</label>
                                    <input
                                        type="tel"
                                        id="alternativeNumber"
                                        name="alternativeNumber"
                                        value={projectData.alternativeNumber}
                                        onChange={handleChange}
                                        placeholder="Enter alternative number"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email">Email ID:</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={projectData.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter email ID"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="collegeName">College Name:</label>
                                    <input
                                        type="text"
                                        id="collegeName"
                                        name="collegeName"
                                        value={projectData.collegeName}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter college name"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="referredBy">Referred By:</label>
                                    <input
                                        type="text"
                                        id="referredBy"
                                        name="referredBy"
                                        value={projectData.referredBy}
                                        onChange={handleChange}
                                        placeholder="Enter referral name"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="ProjectType">Project Type:</label>
                                    <div className="radio-group">
                                        <label>
                                            <input
                                                type="radio"
                                                name="ProjectType"
                                                value="mini"
                                                checked={projectData.ProjectType === "mini"}
                                                onChange={handleChange}
                                            />
                                            Mini Project
                                        </label>
                                        <label>
                                            <input
                                                type="radio"
                                                name="ProjectType"
                                                value="major"
                                                checked={projectData.ProjectType === "major"}
                                                onChange={handleChange}
                                            />
                                            Major Project
                                        </label>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="projectSelection">Project Selection:</label>
                                    <div className="radio-group">
                                        <label>
                                            <input
                                                type="radio"
                                                name="projectSelection"
                                                value="project"
                                                checked={projectData.projectSelection === "project"}
                                                onChange={handleChange}
                                            />
                                            Project
                                        </label>
                                        <label>
                                            <input
                                                type="radio"
                                                name="projectSelection"
                                                value="prototype"
                                                checked={projectData.projectSelection === "prototype"}
                                                onChange={handleChange}
                                            />
                                            Prototype
                                        </label>
                                        <label>
                                            <input
                                                type="radio"
                                                name="projectSelection"
                                                value="product"
                                                checked={projectData.projectSelection === "product"}
                                                onChange={handleChange}
                                            />
                                            Product
                                        </label>
                                    </div>
                                </div>

                                {/* Total Payment Field */}
                                <div className="form-group">
                                    <label htmlFor="totalPayment">Total Payment:</label>
                                    <input
                                        type="number"
                                        id="totalPayment"
                                        name="totalPayment"
                                        value={projectData.totalPayment}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter total payment"
                                    />
                                </div>

                                {/* Advance Payment Field */}
                                <div className="form-group">
                                    <label htmlFor="advancePayment">Advance Payment:</label>
                                    <input
                                        type="number"
                                        id="advancePayment"
                                        name="advancePayment"
                                        value={projectData.advancePayment}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter advance payment"
                                    />
                                </div>

                                {/* Discount Field */}
                                <div className="form-group">
                                    <label htmlFor="discount">Discount:</label>
                                    <input
                                        type="number"
                                        id="discount"
                                        name="discount"
                                        value={projectData.discount}
                                        onChange={handleChange}
                                        placeholder="Enter discount amount"
                                    />
                                </div>

                                {/* Total Remaining Field - Now read-only */}
                                <div className="form-group">
                                    <label htmlFor="totalRemaining">Total Remaining:</label>
                                    <input
                                        type="number"
                                        id="totalRemaining"
                                        name="totalRemaining"
                                        value={projectData.totalRemaining}
                                        readOnly
                                        placeholder="Auto-calculated remaining amount"
                                        style={{ backgroundColor: '#f5f5f5' }} 
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="timeline">Project Timeline:</label>
                                    <input
                                        type="date"
                                        id="timeline"
                                        name="timeline"
                                        value={projectData.timeline}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                {/* Task Assignment Section */}
                                <div className="form-group assignments-section">
                                    <div className='part1'>
                                        <label htmlFor="Assign_To">Task Assignments: <span className="assignment-info"></span></label>
                                        {/* {assignments.map((assignment) => (
                                                <div key={assignment.id} className="assignment-row">
                                                    <input
                                                        type="text"
                                                        id="Assign_To"
                                                        name="Assign_To"
                                                        placeholder="Assignee name"
                                                        value={assignment.assignee}
                                                        onChange={(e) => handleAssignmentChange(assignment.id, 'assignee', e.target.value)}
                                                        className="assignee-input"
                                                    />
                                                    <div className="percentage-display">
                                                        {assignment.percentage}%
                                                    </div>
                                                    {assignments.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveAssignment(assignment.id)}
                                                            className="remove-assignment-btn"
                                                        >
                                                            Remove
                                                        </button>
                                                    )}
                                                </div>
                                            ))} */}
                                        {assignments.map((assignment) => (
                                            <div key={assignment.id} className="assignment-row">
                                                <input
                                                    type="text"
                                                    placeholder="Assignee name"
                                                    value={assignment.assignee}
                                                    onChange={(e) => handleAssignmentChange(assignment.id, 'assignee', e.target.value)}
                                                    className="assignee-input"
                                                />
                                                <textarea
                                                    placeholder="Task description"
                                                    value={assignment.description || ''}
                                                    onChange={(e) => handleAssignmentChange(assignment.id, 'description', e.target.value)}
                                                    className="description-input"
                                                    rows="3"
                                                />
                                                <div className="percentage-display">
                                                    {assignment.percentage}%
                                                </div>
                                                {assignments.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveAssignment(assignment.id)}
                                                        className="remove-assignment-btn"
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <div className='part2'>
                                        <button
                                            type="button"
                                            onClick={handleAddAssignment}
                                            className="add-assignment-btn"
                                        >
                                            Add Assignee
                                        </button>
                                    </div>
                                </div>

                            </div>
                        </>
                    )}

                    {message && (
                        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
                            {message}
                        </div>
                    )}

                    <div className='adminpanel-buttons'>
                        <div className="button-group">
                            <button
                                type="button"
                                className="stage-button"
                                onClick={handleStageChange}
                            >
                                {formStage === 'basic' ? 'Next' : 'Back'}
                            </button>
                            {formStage === 'details' && (
                                <button
                                    type="submit"
                                    className="submit-button"
                                    disabled={isLoading || isProcessing}
                                >
                                    {isLoading ? 'Saving...' : (editingId ? 'Update Project' : 'Order Created')}
                                </button>
                            )}
                            {pdfUrl && (
                                <button
                                    type="button"
                                    className="view-button"
                                    onClick={handleViewPdf}
                                >
                                    View PDF
                                </button>
                            )}
                            {editingId && (
                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={resetForm}
                                >
                                    Cancel Edit
                                </button>
                            )}
                        </div>
                        
                    </div>
                </form>
            </div>
        </Splitslayout>
    );
};

export default AdminPanel;