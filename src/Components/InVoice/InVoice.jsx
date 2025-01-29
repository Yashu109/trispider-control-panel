import React, { useState, useEffect } from 'react';
import { database } from '../../firebase';
import { ref, push } from 'firebase/database';
import { X, Printer, Plus, Minus } from 'lucide-react';
import './Invoice.css';

const Invoice = ({ project, onClose }) => {
  // Validate project data and set defaults
  const [projectData] = useState(() => {
    if (!project) {
      console.error('Project data is missing');
      return {
        projectId: '',
        clientName: '',
        email: '',
        phoneNumber: '',
        collegeName: '',
      };
    }
    return {
      projectId: project.projectId || '',
      clientName: project.clientName || '',
      email: project.email || '',
      phoneNumber: project.phoneNumber || '',
      collegeName: project.collegeName || '',
    };
  });

  const [formData, setFormData] = useState({
    invoiceNumber: `INV-${Date.now()}`,
    items: [{ description: projectData.projectId ? `Project: ${projectData.projectId}` : '', quantity: 1, rate: 0 }],
    tax: 18,
    notes: '',
    termsAndConditions: '',
  });

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, rate: 0 }]
    });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((total, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const rate = parseFloat(item.rate) || 0;
      return total + (quantity * rate);
    }, 0);
  };

  const calculateTax = () => {
    return (calculateSubtotal() * formData.tax) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const invoiceData = {
        ...formData,
        projectId: projectData.projectId,
        clientName: projectData.clientName,
        clientEmail: projectData.email,
        clientPhone: projectData.phoneNumber,
        date: new Date().toISOString(),
        subtotal: calculateSubtotal(),
        tax: calculateTax(),
        total: calculateTotal()
      };

      const invoicesRef = ref(database, 'invoices');
      await push(invoicesRef, invoiceData);
      onClose();
    } catch (error) {
      console.error('Error saving invoice:', error);
    }
  };

  // If project data is completely missing, return early
  if (!project) {
    console.error('No project data provided');
    onClose();
    return null;
  }

  return (
    <div className="invoice-overlay">
      <div className="invoice-modal">
        <div className="invoice-header">
          <h2>Generate Invoice</h2>
          <button onClick={onClose} className="close-button">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="invoice-form">
          <div className="invoice-details">
            <div className="form-group">
              <label>Invoice Number</label>
              <input
                type="text"
                value={formData.invoiceNumber}
                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                readOnly
              />
            </div>

            <div className="client-details">
              <h3>Client Information</h3>
              <div className="info-grid">
                <div>
                  <label>Name:</label>
                  <span>{projectData.clientName || 'Not provided'}</span>
                </div>
                <div>
                  <label>Email:</label>
                  <span>{projectData.email || 'Not provided'}</span>
                </div>
                <div>
                  <label>Phone:</label>
                  <span>{projectData.phoneNumber || 'Not provided'}</span>
                </div>
                <div>
                  <label>College:</label>
                  <span>{projectData.collegeName || 'Not provided'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="items-section">
            <div className="items-header">
              <h3>Items</h3>
              <button type="button" onClick={addItem} className="add-item-btn">
                <Plus size={16} /> Add Item
              </button>
            </div>

            <div className="items-list">
              {formData.items.map((item, index) => (
                <div key={index} className="item-row">
                  <input
                    type="text"
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                    min="1"
                  />
                  <input
                    type="number"
                    placeholder="Rate"
                    value={item.rate}
                    onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                    min="0"
                  />
                  <div className="item-total">
                    ₹{((item.quantity || 0) * (item.rate || 0)).toFixed(2)}
                  </div>
                  {index > 0 && (
                    <button 
                      type="button" 
                      onClick={() => removeItem(index)}
                      className="remove-item-btn"
                    >
                      <Minus size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="invoice-footer">
            <div className="tax-section">
              <div className="form-group">
                <label>Tax Rate (%)</label>
                <input
                  type="number"
                  value={formData.tax}
                  onChange={(e) => setFormData({ ...formData, tax: parseFloat(e.target.value) || 0 })}
                  min="0"
                  max="100"
                />
              </div>
            </div>

            <div className="totals-section">
              <div className="total-row">
                <span>Subtotal:</span>
                <span>₹{calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="total-row">
                <span>Tax ({formData.tax}%):</span>
                <span>₹{calculateTax().toFixed(2)}</span>
              </div>
              <div className="total-row grand-total">
                <span>Total:</span>
                <span>₹{calculateTotal().toFixed(2)}</span>
              </div>
            </div>

            <div className="form-group full-width">
              <label>Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes..."
              />
            </div>

            <div className="form-group full-width">
              <label>Terms and Conditions</label>
              <textarea
                value={formData.termsAndConditions}
                onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
                placeholder="Terms and conditions..."
              />
            </div>

            <div className="button-group">
              <button type="button" onClick={onClose} className="cancel-btn">
                Cancel
              </button>
              <button type="submit" className="generate-btn">
                <Printer size={16} />
                Generate Invoice
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Invoice;