// Create a new file called invoiceAPI.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_INVOICE_API_URL;
const API_KEY = process.env.REACT_APP_INVOICE_API_KEY;

export const generateInvoice = async (invoiceData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/invoices`, 
            invoiceData,
            {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to generate invoice');
    }
};

export const getInvoiceStatus = async (invoiceId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/invoices/${invoiceId}`, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`
            }
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to get invoice status');
    }
};