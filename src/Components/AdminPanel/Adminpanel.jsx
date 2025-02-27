import { useState, useEffect, useRef, useCallback } from 'react';
import { database, auth, storage } from '../../firebase';
import { ref, set, get, getDatabase, onValue } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import './Adminpanel.css';
import Quotation from '../Quotation/Quotation';
import Splitslayout from '../Splitslayout/Splitslayout';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { ref as storageRef, getDownloadURL, uploadString, uploadBytes, listAll } from 'firebase/storage';
import { FileText, X } from 'lucide-react';

const AdminPanel = () => {
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const workerRef = useRef(null);
    const quotationRef = useRef(null);
    const editorRef = useRef(null); // Ref for rich text editor

    const [formStage, setFormStage] = useState('basic');
    const [pdfUrl, setPdfUrl] = useState(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [inputMode, setInputMode] = useState('keyboard');
    const [context, setContext] = useState(null);
    const [lastX, setLastX] = useState(0);
    const [lastY, setLastY] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [recognizedText, setRecognizedText] = useState('');
    const [counterpass, setCounterpass] = useState('');
    const [assignments, setAssignments] = useState([{ id: 1, assignee: '', description: '', percentage: '100', taskOrder: '' }]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [useSameNumber, setUseSameNumber] = useState(false);
    const [showPdfList, setShowPdfList] = useState(false);
    const [pdfList, setPdfList] = useState([]);
    const [pdfLoading, setPdfLoading] = useState(false);
    const [quotationActions, setQuotationActions] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [editingId, setEditingId] = useState(null);

    const [projectData, setProjectData] = useState({
        title: '',
        description: '',
        scopeOfWork: '', // Will store HTML content
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
        discount: '0',
        totalRemaining: '',
        timeline: '',
        Assign_To: '',
        assignments: [],
    });

    // Helper function to calculate even percentage splits
    const calculateEvenSplit = (numberOfPeople) => {
        return (100 / numberOfPeople).toFixed(0);
    };

    // Formatting functions for rich text editor
    const formatText = (command, value = null) => {
        document.execCommand(command, false, value);
        editorRef.current.focus();
        updateScopeOfWork();
    };

    const updateScopeOfWork = useCallback(() => {
        if (editorRef.current) {
            const content = editorRef.current.innerHTML;
            setProjectData(prev => ({
                ...prev,
                scopeOfWork: content
            }));
        }
    }, []);
    const handleInput = useCallback(() => {
        // Prevent default if needed for specific input scenarios
        // e.preventDefault();

        // Ensure the input updates the project data
        updateScopeOfWork();
    }, [updateScopeOfWork]);
    const handleKeyDown = useCallback((e) => {
        // Optional: Handle specific key events
        // For example, prevent default tab behavior
        if (e.key === 'Tab') {
            e.preventDefault();
            document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;');
        }

        // Optional: Limit max length
        const maxLength = 1000; // Adjust as needed
        if (editorRef.current && editorRef.current.textContent.length >= maxLength &&
            e.key !== 'Backspace' && e.key !== 'Delete') {
            e.preventDefault();
        }
    }, []);

    const handlePaste = useCallback((e) => {
        // Prevent default paste behavior
        e.preventDefault();

        // Get plain text from clipboard
        const pastedText = e.clipboardData.getData('text/plain');

        // Insert plain text at cursor position
        document.execCommand('insertHTML', false, pastedText);

        // Update project data
        updateScopeOfWork();
    }, [updateScopeOfWork]);
    // Reset editor alignment and content on mode switch or initialization
    useEffect(() => {
        if (inputMode === 'keyboard' && editorRef.current) {
            // Ensure no forced alignment
            editorRef.current.style.textAlign = '';

            // Load content without disturbing alignment
            editorRef.current.innerHTML = projectData.scopeOfWork || '';
        }
    }, [inputMode, projectData.scopeOfWork]);

    const handleAddAssignment = () => {
        const newAssignments = [...assignments, { id: assignments.length + 1, assignee: '', description: '' }];
        const evenPercentage = calculateEvenSplit(newAssignments.length);
        newAssignments.forEach(assignment => assignment.percentage = evenPercentage);
        setAssignments(newAssignments);
        setProjectData(prev => ({ ...prev, assignments: newAssignments }));
        setMessage(`Work split evenly: ${evenPercentage}% per person`);
        setTimeout(() => setMessage(''), 3000);
    };

    const handleRemoveAssignment = (id) => {
        if (assignments.length > 1) {
            const newAssignments = assignments.filter(assignment => assignment.id !== id);
            const evenPercentage = calculateEvenSplit(newAssignments.length);
            newAssignments.forEach(assignment => assignment.percentage = evenPercentage);
            setAssignments(newAssignments);
            setProjectData(prev => ({ ...prev, assignments: newAssignments }));
            setMessage(`Work split evenly: ${evenPercentage}% per person`);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    // const handleAssignmentChange = (id, field, value) => {
    //     const updatedAssignments = assignments.map(assignment =>
    //         assignment.id === id ? { ...assignment, [field]: value } : assignment
    //     );
    //     setAssignments(updatedAssignments);
    //     const assigneeNames = updatedAssignments
    //         .map(a => a.assignee)
    //         .filter(name => name.trim() !== '')
    //         .join(', ');
    //     setProjectData(prev => ({ ...prev, assignments: updatedAssignments, Assign_To: assigneeNames }));
    // };

    const handleAssignmentChange = (id, field, value) => {
        const updatedAssignments = [...assignments];

        // If changing task order, clear any other assignment with the same order
        if (field === 'taskOrder') {
            // Clear any existing assignment with this order
            updatedAssignments.forEach((a) => {
                if (a.id !== id && a.taskOrder === value) {
                    a.taskOrder = '';
                }
            });
        }

        // Update the specific assignment
        const index = updatedAssignments.findIndex(a => a.id === id);
        updatedAssignments[index] = {
            ...updatedAssignments[index],
            [field]: value
        };

        setAssignments(updatedAssignments);

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
    const handleStageChange = () => {
        if (formStage === 'basic') {
            const errors = validateBasicForm();
            if (errors.length > 0) {
                setMessage(errors.join('\n'));
                return;
            }
            setFormStage('details');
        } else {
            setFormStage('basic');
        }
        setMessage('');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let newValue = value;

        switch (name) {
            case 'phoneNumber':
            case 'whatsappNumber':
            case 'alternativeNumber':
                newValue = value.replace(/\D/g, '').slice(0, 10);
                break;
            case 'totalPayment':
            case 'advancePayment':
            case 'discount':
                if (value === '') newValue = '0';
                else if (parseFloat(value) < 0) newValue = '0';
                break;
            case 'email':
                newValue = value.toLowerCase();
                break;
            default:
                if (name !== 'description' && name !== 'scopeOfWork') newValue = value.trimStart();
        }

        setProjectData(prevState => {
            const newState = { ...prevState, [name]: newValue };
            if (['totalPayment', 'advancePayment', 'discount'].includes(name)) {
                const total = parseFloat(name === 'totalPayment' ? newValue : newState.totalPayment) || 0;
                const advance = parseFloat(name === 'advancePayment' ? newValue : newState.advancePayment) || 0;
                const discount = parseFloat(name === 'discount' ? newValue : newState.discount) || 0;
                newState.totalRemaining = Math.max(0, total - advance - discount).toString();
            }
            return newState;
        });
    };

    const handleChangeNumber = (e) => {
        const { name, value, checked } = e.target;

        if (name === 'useSameNumber') {
            setUseSameNumber(checked);
            setProjectData(prevState => ({
                ...prevState,
                whatsappNumber: checked ? prevState.phoneNumber : ''
            }));
            return;
        }

        let newValue = value.replace(/\D/g, '').slice(0, 10);

        if (name === 'phoneNumber') {
            setProjectData(prevState => ({
                ...prevState,
                phoneNumber: newValue,
                ...(useSameNumber && { whatsappNumber: newValue })
            }));
        } else {
            setProjectData(prevState => ({ ...prevState, [name]: newValue }));
        }
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
        const x = e.type.includes('mouse') ? e.clientX - rect.left : e.touches[0].clientX - rect.left;
        const y = e.type.includes('mouse') ? e.clientY - rect.top : e.touches[0].clientY - rect.top;
        setIsDrawing(true);
        setLastX(x);
        setLastY(y);
    };

    const draw = (e) => {
        if (!isDrawing || !context) return;
        e.preventDefault();
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.type.includes('mouse') ? e.clientX - rect.left : e.touches[0].clientX - rect.left;
        const y = e.type.includes('mouse') ? e.clientY - rect.top : e.touches[0].clientY - rect.top;
        context.beginPath();
        context.moveTo(lastX, lastY);
        context.lineTo(x, y);
        context.stroke();
        context.closePath();
        setLastX(x);
        setLastY(y);
    };

    const stopDrawing = () => setIsDrawing(false);

    const clearCanvas = () => {
        if (context && canvasRef.current) {
            context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            setRecognizedText('');
        }
    };

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
                    if (projectNumbers.length > 0) counter = Math.max(...projectNumbers) + 1;
                }
            }
            const counterpass = `KS${counter}`;
            setCounterpass(counterpass);
            return counterpass;
        } catch (error) {
            console.error('Error generating project ID:', error);
            return 'KS5000';
        }
    };

    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    //     const errors = validateDetailsForm();
    //     if (errors.length > 0) {
    //         setMessage(errors.join('\n'));
    //         return;
    //     }

    //     setIsLoading(true);
    //     setMessage('');

    //     try {
    //         const projectId = editingId || await generateProjectId();
    //         const projectRef = ref(database, `projects/${projectId}`);
    //         const timestamp = new Date().toISOString();
    //         const validAssignments = assignments.filter(a => a.assignee.trim() !== '');
    //         const finalProjectData = { ...projectData, assignments: validAssignments, timestamp, projectId };
    //         await set(projectRef, finalProjectData);

    //         if (!quotationRef.current) throw new Error('Quotation component reference is missing');

    //         try {
    //             const canvas = await html2canvas(quotationRef.current, {
    //                 scale: 2,
    //                 useCORS: true,
    //                 logging: true,
    //                 backgroundColor: '#ffffff'
    //             });
    //             const imgData = canvas.toDataURL('image/png');
    //             const pdf = new jsPDF('p', 'mm', 'a4');
    //             const imgWidth = 110;
    //             const imgHeight = 300;
    //             pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    //             const pdfData = pdf.output('datauristring');

    //             const pdfRef = storageRef(storage, `quotations/${projectId}.pdf`);
    //             await uploadString(pdfRef, pdfData, 'data_url');
    //             await new Promise(resolve => setTimeout(resolve, 1000));

    //             let attempts = 0;
    //             const maxAttempts = 3;
    //             let downloadUrl = null;
    //             while (attempts < maxAttempts && !downloadUrl) {
    //                 try {
    //                     downloadUrl = await getDownloadURL(pdfRef);
    //                 } catch (error) {
    //                     attempts++;
    //                     if (attempts === maxAttempts) throw error;
    //                     await new Promise(resolve => setTimeout(resolve, 1000));
    //                 }
    //             }

    //             setPdfUrl(downloadUrl);
    //             alert(`Order ${projectId} created successfully! PDF is available for viewing.`);
    //             setMessage('Order created successfully!');
    //             setTimeout(() => {
    //                 resetForm();
    //                 setMessage('');
    //             }, 2000);
    //         } catch (pdfError) {
    //             console.error('PDF generation/upload error:', pdfError);
    //             setMessage('Order saved but PDF generation failed. Please try viewing the PDF later.');
    //             alert(`Order ${projectId} created successfully, but PDF generation failed. You can try viewing it later.`);
    //         }
    //     } catch (error) {
    //         console.error('Submission error:', error);
    //         setMessage(`Error: ${error.message}`);
    //         alert(`Failed to create order: ${error.message}`);
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errors = validateDetailsForm();
        if (errors.length > 0) {
            setMessage(errors.join('\n'));
            return;
        }

        setIsLoading(true);
        setMessage('');

        try {
            const projectId = editingId || await generateProjectId();
            const projectRef = ref(database, `projects/${projectId}`);
            const timestamp = new Date().toISOString();
            const validAssignments = assignments.filter(a => a.assignee.trim() !== '');
            const finalProjectData = { ...projectData, assignments: validAssignments, timestamp, projectId };
            await set(projectRef, finalProjectData);

            if (!quotationRef.current) throw new Error('Quotation component reference is missing');

            try {
                // Wait a moment for any state updates to reflect in the DOM
                await new Promise(resolve => setTimeout(resolve, 100));

                // Get the individual page elements
                const page1Element = quotationRef.current.querySelector('.page');
                const page2Element = quotationRef.current.querySelector('.page1');

                if (!page1Element || !page2Element) {
                    throw new Error('Could not find page elements in the quotation');
                }

                // Create PDF with A4 dimensions
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pageWidth = 210; // A4 width

                // Capture first page
                const canvas1 = await html2canvas(page1Element, {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: '#ffffff'
                });
                const imgData1 = canvas1.toDataURL('image/png');
                const imgHeight1 = canvas1.height * pageWidth / canvas1.width;
                pdf.addImage(imgData1, 'PNG', 0, 0, pageWidth, imgHeight1);

                // Add second page
                pdf.addPage();
                const canvas2 = await html2canvas(page2Element, {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: '#ffffff'
                });
                const imgData2 = canvas2.toDataURL('image/png');
                const imgHeight2 = canvas2.height * pageWidth / canvas2.width;
                pdf.addImage(imgData2, 'PNG', 0, 0, pageWidth, imgHeight2);

                const pdfData = pdf.output('datauristring');

                const pdfRef = storageRef(storage, `quotations/${projectId}.pdf`);
                await uploadString(pdfRef, pdfData, 'data_url');

                // Wait a moment for the upload to complete
                await new Promise(resolve => setTimeout(resolve, 1000));

                let attempts = 0;
                const maxAttempts = 3;
                let downloadUrl = null;

                while (attempts < maxAttempts && !downloadUrl) {
                    try {
                        downloadUrl = await getDownloadURL(pdfRef);
                    } catch (error) {
                        attempts++;
                        if (attempts === maxAttempts) throw error;
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }

                setPdfUrl(downloadUrl);
                alert(`Order ${projectId} created successfully! PDF is available for viewing.`);
                setMessage('Order created successfully!');
                setTimeout(() => {
                    resetForm();
                    setMessage('');
                }, 2000);
            } catch (pdfError) {
                console.error('PDF generation/upload error:', pdfError);
                setMessage('Order saved but PDF generation failed. Please try viewing the PDF later.');
                alert(`Order ${projectId} created successfully, but PDF generation failed. You can try viewing it later.`);
            }
        } catch (error) {
            console.error('Submission error:', error);
            setMessage(`Error: ${error.message}`);
            alert(`Failed to create order: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewPdf = () => {
        if (pdfUrl) window.open(pdfUrl, '_blank');
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
            discount: '0',
            totalRemaining: '',
            timeline: '',
            Assign_To: '',
        });
        setAssignments([{ id: 1, assignee: '', percentage: '100' }]);
        setEditingId(null);
        setFormStage('basic');
        setRecognizedText('');
        if (inputMode === 'pen') clearCanvas();
        if (editorRef.current) {
            editorRef.current.innerHTML = '';
            editorRef.current.style.textAlign = ''; // Reset alignment on form reset
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
            setProjectData(prev => ({ ...prev, scopeOfWork: recognizedText }));
            if (editorRef.current) {
                editorRef.current.innerHTML = recognizedText;
                editorRef.current.style.textAlign = ''; // Ensure no alignment on switch
            }
        }
    };

    const handleCanvasContent = async () => {
        if (canvasRef.current && workerRef.current) {
            try {
                const imageData = canvasRef.current.toDataURL();
                const { data: { text } } = await workerRef.current.recognize(imageData);
                setRecognizedText(text);
                setProjectData(prev => ({ ...prev, scopeOfWork: text }));
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

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const db = getDatabase();
                const employeesRef = ref(db, 'employeesList/employees');
                onValue(employeesRef, (snapshot) => {
                    const data = snapshot.val();
                    if (data) {
                        const employeeList = Object.values(data).map((employee, index) => ({
                            id: employee.employeeId || index,
                            name: employee.name
                        }));
                        setEmployees(employeeList);
                    }
                    setLoading(false);
                }, (error) => {
                    setError('Failed to fetch employees');
                    setLoading(false);
                    console.error('Error fetching employees:', error);
                });
            } catch (error) {
                setError('Failed to fetch employees');
                setLoading(false);
                console.error('Error setting up Firebase listener:', error);
            }
        };
        fetchEmployees();
    }, []);

    const validateBasicForm = () => {
        const errors = [];
        if (!projectData.title.trim()) errors.push('Project title is required');
        else if (projectData.title.length < 3) errors.push('Project title must be at least 3 characters');
        if (!projectData.description.trim()) errors.push('Project description is required');
        else if (projectData.description.length < 10) errors.push('Project description must be at least 10 characters');
        if (inputMode === 'keyboard' && !projectData.scopeOfWork.trim()) errors.push('Scope of work is required');
        return errors;
    };

    const validateDetailsForm = () => {
        const errors = [];
        if (!projectData.clientName.trim()) errors.push('Client name is required');
        else if (projectData.clientName.length < 3) errors.push('Client name must be at least 3 characters');
        if (!projectData.phoneNumber) errors.push('Phone number is required');
        else if (!/^\d{10}$/.test(projectData.phoneNumber)) errors.push('Phone number must be 10 digits');
        if (!projectData.whatsappNumber) errors.push('WhatsApp number is required');
        else if (!/^\d{10}$/.test(projectData.whatsappNumber)) errors.push('WhatsApp number must be 10 digits');
        if (projectData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(projectData.email)) errors.push('Please enter a valid email address');
        if (!projectData.collegeName.trim()) errors.push('College name is required');
        if (!projectData.ProjectType) errors.push('Please select a project type');
        if (!projectData.projectSelection) errors.push('Please select project selection');
        if (!projectData.totalPayment || projectData.totalPayment <= 0) errors.push('Total payment must be greater than 0');
        if (!projectData.advancePayment || projectData.advancePayment < 0) errors.push('Advance payment cannot be negative');
        if (parseFloat(projectData.advancePayment) > parseFloat(projectData.totalPayment)) errors.push('Advance payment cannot be greater than total payment');
        if (projectData.discount && parseFloat(projectData.discount) < 0) errors.push('Discount cannot be negative');
        if (projectData.discount && parseFloat(projectData.discount) > parseFloat(projectData.totalPayment)) errors.push('Discount cannot be greater than total payment');
        if (!projectData.timeline) errors.push('Project timeline is required');
        else {
            const selectedDate = new Date(projectData.timeline);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selectedDate < today) errors.push('Project timeline cannot be in the past');
        }
        // const validAssignments = assignments.filter(a => a.assignee.trim() !== '');
        // if (validAssignments.length === 0) errors.push('At least one assignee is required');
        // validAssignments.forEach(assignment => {
        //     if (!assignment.description || assignment.description.trim() === '') errors.push(`Task description is required for assignee ${assignment.assignee}`);
        // });
        const validAssignments = assignments.filter(a => a.assignee.trim() !== '');
        if (validAssignments.length === 0) {
            errors.push('At least one assignee is required');
        }
        
        validAssignments.forEach(assignment => {
            if (!assignment.description || assignment.description.trim() === '') {
                errors.push(`Task description is required for assignee ${assignment.assignee}`);
            }
            if (!assignment.taskOrder) {
                errors.push(`Task order is required for assignee ${assignment.assignee}`);
            }
        });
        return errors;
    };

    const handleSaveQuotation = async (projectId) => {
        try {
            setMessage('Saving quotation...');
            const cleanProjectId = projectId.replace('.pdf', '');
            const quotationRef = storageRef(storage, `quotations/${cleanProjectId}.pdf`);
            const projectRef = ref(database, `projects/${cleanProjectId}`);
            const snapshot = await get(projectRef);
            if (!snapshot.exists()) throw new Error(`Project ${cleanProjectId} not found in database`);
            const projectDataFromDb = snapshot.val();

            const pdf = new jsPDF('p', 'mm', 'a4');
            // const imgWidth = 110;
            // const imgHeight = 300;
            pdf.setFontSize(12);
            pdf.text(`Project ID: ${cleanProjectId}`, 10, 10);
            pdf.text(`Title: ${projectDataFromDb.title || ''}`, 10, 20);
            pdf.text(`Client: ${projectDataFromDb.clientName || ''}`, 10, 30);
            pdf.text(`Scope of Work: ${projectDataFromDb.scopeOfWork || ''}`, 10, 40, { maxWidth: 190 });
            pdf.text(`Total Payment: ${projectDataFromDb.totalPayment || ''}`, 10, 60);
            pdf.text(`Advance: ${projectDataFromDb.advancePayment || ''}`, 10, 70);
            pdf.text(`Remaining: ${projectDataFromDb.totalRemaining || ''}`, 10, 80);
            const pdfData = pdf.output('blob');

            await uploadBytes(quotationRef, pdfData, { contentType: 'application/pdf' });
            setQuotationActions(prev => ({ ...prev, [`${cleanProjectId}.pdf`]: 'saved' }));
            setPdfList(prevList =>
                prevList.map(pdf => pdf.name === `${cleanProjectId}.pdf` ? { ...pdf, action: 'saved' } : pdf)
            );
            alert(`Quotation ${cleanProjectId}.pdf has been saved to the quotations folder.`);
            setMessage('Quotation saved successfully!');
            await fetchPdfList();
        } catch (error) {
            console.error('Error saving quotation:', error);
            setMessage(`Error: Failed to save quotation - ${error.message}`);
        }
    };

    const fetchPdfList = async () => {
        setPdfLoading(true);
        try {
            const listRef = storageRef(storage, 'quotations');
            const result = await listAll(listRef);
            const finalRef = storageRef(storage, 'finalquotation');
            const finalResult = await listAll(finalRef);
            const finalFiles = finalResult.items.map(item => item.name);

            const pdfs = await Promise.all(
                result.items.map(async itemRef => {
                    try {
                        const url = await getDownloadURL(itemRef);
                        const fileName = itemRef.name;
                        return {
                            name: fileName,
                            url,
                            isFinal: finalFiles.includes(fileName),
                            action: quotationActions[fileName] || (finalFiles.includes(fileName) ? 'saved' : 'pending'),
                        };
                    } catch (error) {
                        console.error(`Error fetching metadata for ${itemRef.name}:`, error);
                        return null;
                    }
                })
            );

            const validPdfs = pdfs.filter(pdf => pdf !== null).sort((a, b) => {
                const numA = parseInt(a.name.replace('KS', '').replace('.pdf', '')) || 0;
                const numB = parseInt(b.name.replace('KS', '').replace('.pdf', '')) || 0;
                return numB - numA;
            });

            setPdfList(validPdfs);
            if (validPdfs.length === 0) setMessage('No PDFs found');
        } catch (error) {
            console.error('Error fetching PDF list:', error);
            setMessage('Error loading PDF list. Please try again.');
        } finally {
            setPdfLoading(false);
        }
    };

    const handleCancelQuotation = (projectId) => {
        setQuotationActions(prev => ({ ...prev, [`${projectId}.pdf`]: 'canceled' }));
        setPdfList(prevList => prevList.filter(pdf => pdf.name !== `${projectId}.pdf`));
        setMessage(`Quotation ${projectId} removed from list.`);
    };

    const handleOpenPdfList = () => {
        setShowPdfList(true);
        fetchPdfList();
    };

    if (loading) return <select disabled className="assignee-dropdown"><option>Loading...</option></select>;
    if (error) return <select disabled className="assignee-dropdown"><option>{error}</option></select>;

    return (
        <Splitslayout
            quotationPreview={<div ref={quotationRef}><Quotation {...projectData} counterpass={counterpass} /></div>}
        >
            <div className="admin-container">
                {isLoading && (
                    <div className="loading-overlay">
                        <div className="spinner-container">
                            <div className="spinner"></div>
                            <p>Creating Order...</p>
                        </div>
                    </div>
                )}
                <div className="admin-header">
                    <div className="header-titles">
                        <h1 className="h1">{formStage === 'basic' ? 'Admin Panel' : 'Quotation Creation'}</h1>
                        <h3 className="h3">{formStage === 'basic' ? (editingId ? 'Edit Project' : 'Add New Project') : 'Client Profile'}</h3>
                    </div>
                    <button onClick={handleSignOut} className="sign-out-button">Sign Out</button>
                </div>
                <form onSubmit={handleSubmit} className="admin-panel-project-form">
                    {formStage === 'basic' ? (
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
                            <div className="form-group">
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
                                    <div className="rich-text-editor">
                                        <div className="editor-toolbar">
                                            <button type="button" onClick={() => formatText('bold')} title="Bold"><b>B</b></button>
                                            <button type="button" onClick={() => formatText('italic')} title="Italic"><i>I</i></button>
                                            <button type="button" onClick={() => formatText('underline')} title="Underline"><u>U</u></button>
                                            <button type="button" onClick={() => formatText('insertUnorderedList')} title="Bullets">•</button>
                                            <button type="button" onClick={() => formatText('insertOrderedList')} title="Numbering">1.</button>
                                            <button type="button" onClick={() => formatText('justifyLeft')} title="Align Left">←</button>
                                            <button type="button" onClick={() => formatText('justifyCenter')} title="Align Center">↔</button>
                                            <button type="button" onClick={() => formatText('justifyRight')} title="Align Right">→</button>

                                        </div>
                                        <div
                                            ref={editorRef}
                                            contentEditable
                                            className="editor-content"
                                            spellCheck="true"
                                            role="textbox"
                                            aria-multiline="true"
                                            onInput={handleInput}
                                            onKeyDown={handleKeyDown}
                                            onPaste={handlePaste}
                                            data-placeholder="Enter scope of work"
                                            dangerouslySetInnerHTML={{ __html: projectData.scopeOfWork }}
                                        />

                                    </div>
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
                                            <button type="button" className="clear-canvas" onClick={clearCanvas} disabled={isProcessing}>
                                                Clear Drawing
                                            </button>
                                            <button type="button" className="save-drawing" onClick={handleSaveDrawing} disabled={isProcessing}>
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
                                    onChange={handleChangeNumber}
                                    required
                                    placeholder="Enter phone number"
                                    className="phone-input"
                                />
                            </div>
                            <div className="same-number-toggle">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="useSameNumber"
                                        checked={useSameNumber}
                                        onChange={handleChangeNumber}
                                    />
                                    Use same number for WhatsApp
                                </label>
                            </div>
                            {!useSameNumber && (
                                <div className="form-group">
                                    <label htmlFor="whatsappNumber">WhatsApp Number:</label>
                                    <input
                                        type="tel"
                                        id="whatsappNumber"
                                        name="whatsappNumber"
                                        value={projectData.whatsappNumber}
                                        onChange={handleChangeNumber}
                                        required
                                        placeholder="Enter WhatsApp number"
                                        className="whatsapp-input"
                                    />
                                </div>
                            )}
                            <div className="form-group">
                                <label htmlFor="alternativeNumber">Alternative Number:</label>
                                <input
                                    type="tel"
                                    id="alternativeNumber"
                                    name="alternativeNumber"
                                    value={projectData.alternativeNumber}
                                    onChange={handleChangeNumber}
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
                                    placeholder="Enter email ID (optional)"
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
                            <div className="form-group-advance">
                                <div className="payment-method-group">
                                    <label className="payment-method-label">
                                        <input
                                            type="radio"
                                            name="advancePaymentMethod"
                                            value="cash"
                                            checked={projectData.advancePaymentMethod === "cash"}
                                            onChange={handleChange}
                                        />
                                        Cash
                                    </label>
                                    <label className="payment-method-label">
                                        <input
                                            type="radio"
                                            name="advancePaymentMethod"
                                            value="upi"
                                            checked={projectData.advancePaymentMethod === "upi"}
                                            onChange={handleChange}
                                        />
                                        UPI
                                    </label>
                                </div>
                                <div className="form-group-advance1">
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
                            </div>
                            <div className="form-group">
                                <label htmlFor="discount">Discount:</label>
                                <input
                                    type="number"
                                    id="discount"
                                    name="discount"
                                    value={projectData.discount}
                                    onChange={handleChange}
                                    placeholder="0"
                                    min="0"
                                />
                            </div>
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
                            <div className="form-group assignments-section">
                                <div className="part1">
                                    <label htmlFor="Assign_To">Task Assignments: <span className="assignment-info"></span></label>
                                    {assignments.map(assignment => (
                                        // <div key={assignment.id} className="assignment-row">
                                        //     <select
                                        //         value={assignment.assignee}
                                        //         onChange={e => handleAssignmentChange(assignment.id, 'assignee', e.target.value)}
                                        //         className="assignee-dropdown"
                                        //     >
                                        //         <option value="">Select Assignee</option>
                                        //         {employees.map(employee => (
                                        //             <option key={employee.id} value={employee.name}>{employee.name}</option>
                                        //         ))}
                                        //     </select>
                                        //     <textarea
                                        //         placeholder="Task description"
                                        //         value={assignment.description || ''}
                                        //         onChange={e => handleAssignmentChange(assignment.id, 'description', e.target.value)}
                                        //         className="description-input"
                                        //         rows="3"
                                        //     />
                                        //     <div className="percentage-display">{assignment.percentage}%</div>
                                        //     {assignments.length > 1 && (
                                        //         <button
                                        //             type="button"
                                        //             onClick={() => handleRemoveAssignment(assignment.id)}
                                        //             className="remove-assignment-btn"
                                        //         >
                                        //             Remove
                                        //         </button>
                                        //     )}
                                        // </div>
                                        <div key={assignment.id} className="assignment-row">
                                            <div className="assignment-inputs">
                                                <div className="assignment-main-inputs">
                                                    <select
                                                        value={assignment.assignee}
                                                        onChange={e => handleAssignmentChange(assignment.id, 'assignee', e.target.value)}
                                                        className="assignee-dropdown"
                                                    >
                                                        <option value="">Select Assignee</option>
                                                        {employees.map(employee => (
                                                            <option key={employee.id} value={employee.name}>{employee.name}</option>
                                                        ))}
                                                    </select>

                                                    {assignment.assignee && (
                                                        <select
                                                            value={assignment.taskOrder || ''}
                                                            onChange={e => handleAssignmentChange(assignment.id, 'taskOrder', e.target.value)}
                                                            className={`task-order-select ${!assignment.taskOrder ? 'required' : ''}`}
                                                        >
                                                            <option value="">Select Task Order *</option>
                                                            {[...Array(assignments.length)].map((_, i) => (
                                                                <option key={i + 1} value={(i + 1).toString()}>
                                                                    {i === 0 ? '1st - Do First' :
                                                                        i === 1 ? '2nd - Do Second' :
                                                                            i === 2 ? '3rd - Do Third' :
                                                                                `${i + 1}th - Do ${i + 1}th`}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    )}
                                                </div>

                                                <textarea
                                                    placeholder="Task description"
                                                    value={assignment.description || ''}
                                                    onChange={e => handleAssignmentChange(assignment.id, 'description', e.target.value)}
                                                    className="description-input"
                                                    rows="3"
                                                />

                                                <div className="task-info">
                                                    <div className="percentage-display">
                                                        Percentage: {assignment.percentage}%
                                                    </div>
                                                    {assignment.taskOrder && (
                                                        <div className="order-display">
                                                            Task Order: #{assignment.taskOrder}
                                                        </div>
                                                    )}
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
                                        </div>
                                    ))}
                                </div>
                                <div className="part2">
                                    <button type="button" onClick={handleAddAssignment} className="add-assignment-btn">Add Assignee</button>
                                </div>
                            </div>
                        </div>
                    )}
                    {message && (
                        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>{message}</div>
                    )}
                    <div className="adminpanel-buttons">
                        <div className="button-group">
                            <button type="button" className="stage-button" onClick={handleStageChange}>
                                {formStage === 'basic' ? 'Next' : 'Back'}
                            </button>
                            <button type="button" className="pdf-list-button" onClick={handleOpenPdfList}>
                                <FileText size={16} /> PDF List
                            </button>
                            {formStage === 'details' && (
                                <button type="submit" className="submit-button" disabled={isLoading || isProcessing}>
                                    {isLoading ? 'Saving...' : (editingId ? 'Update Project' : 'Create Order')}
                                </button>
                            )}
                            {pdfUrl && (
                                <button type="button" className="view-button" onClick={handleViewPdf}>View PDF</button>
                            )}
                            {editingId && (
                                <button type="button" className="cancel-button" onClick={resetForm}>Cancel Edit</button>
                            )}
                        </div>
                    </div>
                </form>
                {showPdfList && (
                    <div className="modal-overlay">
                        <div className="modal-content pdf-list-modal">
                            <div className="modal-header">
                                <h2>Saved Quotations</h2>
                                <button onClick={() => setShowPdfList(false)} className="close-button"><X size={20} /></button>
                            </div>
                            <div className="pdf-list-container">
                                {pdfLoading ? (
                                    <div className="loading-spinner">
                                        <div className="spinner"></div>
                                        <p>Loading PDFs...</p>
                                    </div>
                                ) : pdfList.length === 0 ? (
                                    <div className="no-pdfs">No PDFs found</div>
                                ) : (
                                    <div className="pdf-grid">
                                        {pdfList.map((pdf, index) => (
                                            <div key={index} className="pdf-item">
                                                <FileText size={24} />
                                                <span className="pdf-name">{pdf.name.replace('.pdf', '')}</span>
                                                <div className="pdf-actions">
                                                    <button onClick={() => window.open(pdf.url, '_blank')} className="view-pdf-button">View PDF</button>
                                                    {!pdf.isFinal && (
                                                        <div className="action-buttons">
                                                            <button
                                                                onClick={() => handleSaveQuotation(pdf.name.replace('.pdf', ''))}
                                                                className="save-button"
                                                                disabled={pdf.action === 'saved'}
                                                            >
                                                                Save to Final
                                                            </button>
                                                            <button
                                                                onClick={() => handleCancelQuotation(pdf.name.replace('.pdf', ''))}
                                                                className="cancel-button"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    )}
                                                    {pdf.isFinal && <span className="status-label saved">Already Saved</span>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {message && (
                                    <div className={`modal-message ${message.includes('Error') ? 'error' : 'success'}`}>{message}</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Splitslayout>
    );
};

export default AdminPanel;