import { useState, useEffect, useRef } from 'react';
import { database, auth } from '../../firebase';
import { ref, set, get } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
// import { createWorker } from 'tesseract.js';
import './Adminpanel.css';

const AdminPanel = () => {
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const workerRef = useRef(null);

    // Form stage state
    const [formStage, setFormStage] = useState('basic'); // 'basic' or '    details'

    // Basic form states
    const [isDrawing, setIsDrawing] = useState(false);
    const [inputMode, setInputMode] = useState('keyboard');
    const [context, setContext] = useState(null);
    const [lastX, setLastX] = useState(0);
    const [lastY, setLastY] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false)
    // const [isProcessing] = useState(false);
    const [recognizedText, setRecognizedText] = useState('');

    // Combined project data state
    const [projectData, setProjectData] = useState({
        // Basic form fields
        title: '',
        description: '',
        scopeOfWork: '',
        // timestamp: '',

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

    });

    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [editingId, setEditingId] = useState(null);

    // ... (keep all existing useEffect hooks and canvas-related functions)

    const handleStageChange = () => {
        if (formStage === 'basic') {
            // Validate basic form fields before proceeding
            if (!projectData.title || !projectData.description) {
                setMessage('Please fill in title and description');
                return;
            }

            // Check if either keyboard input or pen input is present
            if (inputMode === 'keyboard' && !projectData.scopeOfWork) {
                setMessage('Please enter scope of work');
                return;
            }

            if (inputMode === 'pen' && !canvasRef.current) {
                setMessage('Please draw or write scope of work');
                return;
            }

            // If using pen input, handle the canvas content
            if (inputMode === 'pen') {
                handleCanvasContent();
            }

            setFormStage('details');
        } else {
            setFormStage('basic');
        }
        setMessage('');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProjectData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };
    useEffect(() => {
        if (inputMode === 'pen' && canvasRef.current) {
            const canvas = canvasRef.current;
            // Set canvas dimensions properly
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;

            const ctx = canvas.getContext('2d');
            // Set drawing styles
            ctx.strokeStyle = '#000000'; // Black color
            ctx.lineWidth = 2; // Line thickness
            ctx.lineCap = 'round'; // Round line endings
            ctx.lineJoin = 'round'; // Round line joints
            setContext(ctx);
        }
    }, [inputMode]);
    const startDrawing = (e) => {
        e.preventDefault();
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();

        // Get correct coordinates for both mouse and touch events
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

        // Get correct coordinates for both mouse and touch events
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
    }; const clearCanvas = () => {
        if (context && canvasRef.current) {
            context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            setRecognizedText('');
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        try {
            // Validate all required fields
            const requiredFields = ['title', 'description', 'scopeOfWork', 'clientName', 'phoneNumber', 'whatsappNumber', 'alternativeNumber', 'collegeName', 'referredBy', 'collegeName',
                'ProjectType', 'projectSelection', 'totalPayment', 'advancePayment', 'discount', 'totalRemaining', 'timeline'];
            const missingFields = requiredFields.filter(field => !projectData[field]);

            if (missingFields.length > 0) {
                throw new Error('Please fill in all required fields');
            }

            const projectId = editingId || await generateProjectId();
            const projectRef = ref(database, `projects/${projectId}`);

            const timestamp = new Date().toISOString().split("T")[0]
            const finalProjectData = {
                ...projectData,
                timestamp,
                projectId
            };

            await set(projectRef, finalProjectData);
            // setMessage('Project saved successfully!');
            alert(`Order Created Successfully!\nProject ID: ${projectId}`);
            // navigate('/admin-profile')
            resetForm();
        } catch (error) {
            setMessage(error.message || 'Error saving project. Please try again.');
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
        }
    };
    const generateProjectId = async () => {
        const counterRef = ref(database, 'projectCounter');
        try {
            const snapshot = await get(counterRef);
            let counter = 5000;
            if (snapshot.exists()) {
                counter = snapshot.val() + 1;
            }
            await set(counterRef, counter);
            return `KS${counter}`;
        } catch (error) {
            console.error('Error generating project ID:', error);
            throw error;
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
        });
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
        // Save the current content before switching
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

                // Perform OCR on the canvas content
                const { data: { text } } = await workerRef.current.recognize(imageData);

                // Update the recognizedText state and project data
                setRecognizedText(text);
                setProjectData(prev => ({
                    ...prev,
                    scopeOfWork: text // Save the recognized text instead of image data
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
    const handleNextPage = () => {
        navigate('/admin-profile')
    }
    return (
        <div className="admin-container">
            <div className="admin-header">
                <div className="header-titles">
                    <h1 className='h1'>{formStage === 'basic' ? 'Admin Panel' : 'Quotation Creation'}</h1>
                    <h3 className='h3'>{formStage === 'basic' ?
                        (editingId ? 'Edit Project' : 'Add New Project') :
                        'Client Profile'}
                    </h3>
                </div>
                <button onClick={handleSignOut} className="sign-out-button">
                    Sign Out
                </button>
            </div>

            <form onSubmit={handleSubmit} className="project-form">
                {formStage === 'basic' ? (
                    // Basic Project Information Form
                    <>
                        <div className="form-group-Project-Title">
                            <label htmlFor="title">Project Title :</label>
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

                        <div className="form-group">
                            <label htmlFor="description">Project Description :</label>
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
                            <label htmlFor="scopeOfWork">Scope of Work :</label>
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
                                <label htmlFor="clientName">Client Name :</label>
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
                                <label htmlFor="phoneNumber">Phone Number :</label>
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
                                <label htmlFor="whatsappNumber">WhatsApp Number :</label>
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
                                <label htmlFor="alternativeNumber">Alternative Number :</label>
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
                                <label htmlFor="email">Email ID :</label>
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
                                <label htmlFor="collegeName">College Name :</label>
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
                                <label htmlFor="referredBy">Referred By :</label>
                                <input
                                    type="text"
                                    id="referredBy"
                                    name="referredBy"
                                    value={projectData.referredBy}
                                    onChange={handleChange}
                                    placeholder="Enter referral name"
                                />
                            </div>

                            {/* Fix the ProjectType radio group */}
                            <div className="form-group">
                                <label htmlFor="ProjectType">Project Type :</label>
                                <div className="radio-group">
                                    <label>
                                        <input
                                            type="radio"
                                            name="ProjectType"  // Changed from projectType to ProjectType
                                            value="mini"
                                            checked={projectData.ProjectType === "mini"}
                                            onChange={handleChange}
                                        />
                                        Mini Project
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name="ProjectType"  // Changed from projectType to ProjectType
                                            value="major"
                                            checked={projectData.ProjectType === "major"}
                                            onChange={handleChange}
                                        />
                                        Major Project
                                    </label>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="projectSelection">Project Selection :</label>
                                <div className="radio-group">
                                    <label>
                                        <input
                                            type="radio"
                                            name="projectSelection"  // Changed from prototypeOrProduct to projectSelection
                                            value="project"
                                            checked={projectData.projectSelection === "project"}
                                            onChange={handleChange}
                                        />
                                        Project
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name="projectSelection"  // Changed from prototypeOrProduct to projectSelection
                                            value="prototype"
                                            checked={projectData.projectSelection === "prototype"}
                                            onChange={handleChange}
                                        />
                                        Prototype
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name="projectSelection"  // Changed from prototypeOrProduct to projectSelection
                                            value="product"
                                            checked={projectData.projectSelection === "product"}
                                            onChange={handleChange}
                                        />
                                        Product
                                    </label>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="totalPayment">Total Payment :</label>
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

                            <div className="form-group">
                                <label htmlFor="advancePayment">Advance Payment :</label>
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

                            <div className="form-group">
                                <label htmlFor="discount">Discount :</label>
                                <input
                                    type="number"
                                    id="discount"
                                    name="discount"
                                    value={projectData.discount}
                                    onChange={handleChange}
                                    placeholder="Enter discount amount"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="totalRemaining">Total Remaining :</label>
                                <input
                                    type="number"
                                    id="totalRemaining"
                                    name="totalRemaining"
                                    value={projectData.totalRemaining}
                                    onChange={handleChange}
                                    placeholder="Enter remaining amount"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="timeline">Project Timeline :</label>
                                <input
                                    type="date"
                                    id="timeline"
                                    name="timeline"
                                    value={projectData.timeline}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            {/* <div className="form-group">
                                <label htmlFor="currentDate">Current Timeline :</label>
                                <input
                                    type="date"
                                    id="currentDate"
                                    name="currentDate"
                                    value={projectData.currentDate || new Date().toISOString().split("T")[0]} // Default to current date
                                    onChange={handleChange}
                                    required
                                />
                            </div> */}

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
                    <button className='nextpage' onClick={handleNextPage}>Next page</button>
                </div>
            </form>
        </div>
    );
};

export default AdminPanel;