import React, { useState } from 'react';
import { dispatchCall, extractTextFromImage } from './apiService';

const ComplaintForm = () => {
  const [formData, setFormData] = useState({
    customerName: '',
    phoneNumber: '',
    complaintId: '',
    issueSummary: '',
    screenshot: null,
    fraudMessage: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [isExtractingText, setIsExtractingText] = useState(false);

  // Generate a random complaint ID
  const generateComplaintId = () => {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `COMPLAINT-${randomStr}-${timestamp.toString().slice(-6)}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check if file is an image
      if (file.type.startsWith('image/')) {
        setFormData(prev => ({
          ...prev,
          screenshot: file
        }));

        // Automatically extract text from the image using real OCR
        setIsExtractingText(true);
        setSubmitMessage(''); // Clear any previous messages
        
        try {
          console.log('Starting OCR extraction for:', file.name);
          const result = await extractTextFromImage(file);
          
          if (result.success) {
            setFormData(prev => ({
              ...prev,
              fraudMessage: result.extractedText
            }));
            console.log('OCR extraction completed successfully');
          } else {
            console.error('Error extracting text:', result.error);
            setSubmitMessage(`OCR Error: ${result.error}`);
          }
        } catch (error) {
          console.error('Error extracting text:', error);
          setSubmitMessage('Error extracting text from image. Please try again or enter fraud details manually.');
        } finally {
          setIsExtractingText(false);
        }
      } else {
        alert('Please select an image file (PNG, JPG, JPEG, WEBP, etc.)');
        e.target.value = '';
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      // Auto-generate complaint ID if not provided
      const complaintId = formData.complaintId || generateComplaintId();
      
      // Prepare the data for the API call (matching your Python script format)
      const callInformation = {
        customer_name: formData.customerName,
        complaint_id: complaintId,
        issue_summary: formData.issueSummary,
        phone_number: formData.phoneNumber
      };

      // Add fraud message if available (from OCR or manual input)
      if (formData.fraudMessage.trim()) {
        callInformation.fraud_message = formData.fraudMessage.trim();
      }

      // Make the API call to dispatch the call
      const result = await dispatchCall(callInformation);
      
      if (result.success) {
        setSubmitMessage('Complaint submitted successfully! Our FraudGuard agent will contact you shortly.');
        console.log('Call dispatched successfully:', result.data);
        
        // Reset form
        setFormData({
          customerName: '',
          phoneNumber: '',
          complaintId: '',
          issueSummary: '',
          screenshot: null,
          fraudMessage: ''
        });
        
        // Clear file input
        const fileInput = document.getElementById('screenshot');
        if (fileInput) fileInput.value = '';
      } else {
        setSubmitMessage(`Error submitting complaint: ${result.error}`);
      }
      
    } catch (error) {
      console.error('Error submitting complaint:', error);
      setSubmitMessage('Error submitting complaint. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white flex items-center">
              <span className="mr-3">📋</span>
              Customer Complaint Form
            </h1>
            <p className="text-blue-100 mt-2">
              Please fill out the form below to submit your complaint. Our FraudGuard agent will contact you shortly.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Customer Name */}
            <div className="space-y-2">
              <label htmlFor="customerName" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="customerName"
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                required
                placeholder="Enter your full name"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <label htmlFor="phoneNumber" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                required
                placeholder="+1234567890"
                pattern="^\+?[1-9]\d{1,14}$"
                title="Please enter a valid phone number with country code"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
              />
            </div>

            {/* Complaint ID */}
            <div className="space-y-2">
              <label htmlFor="complaintId" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Complaint ID <span className="text-sm font-normal text-slate-500 dark:text-slate-400">(auto-generated if empty)</span>
              </label>
              <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-3 sm:space-y-0">
                <input
                  type="text"
                  id="complaintId"
                  name="complaintId"
                  value={formData.complaintId}
                  onChange={handleInputChange}
                  placeholder="Leave empty for auto-generation"
                  className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                />
                <button 
                  type="button" 
                  onClick={() => setFormData(prev => ({...prev, complaintId: generateComplaintId()}))}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 whitespace-nowrap"
                >
                  🎲 Generate ID
                </button>
              </div>
            </div>

            {/* Screenshot Upload */}
            <div className="space-y-2">
              <label htmlFor="screenshot" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Screenshot <span className="text-sm font-normal text-slate-500 dark:text-slate-400">(optional - text will be auto-extracted)</span>
              </label>
              <div className="space-y-3">
                <input
                  type="file"
                  id="screenshot"
                  name="screenshot"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                />
                {formData.screenshot && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                          <span className="text-blue-600 dark:text-blue-400">📎</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                            {formData.screenshot.name}
                          </p>
                          {isExtractingText && (
                            <div className="flex items-center space-x-2 mt-1">
                              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                              <span className="text-xs text-blue-700 dark:text-blue-300">
                                🔍 Extracting text using OCR...
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => {
                          setFormData(prev => ({...prev, screenshot: null, fraudMessage: ''}));
                          document.getElementById('screenshot').value = '';
                          setSubmitMessage('');
                        }}
                        className="w-8 h-8 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center transition-colors duration-200"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Fraud Message */}
            <div className="space-y-2">
              <label htmlFor="fraudMessage" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Fraud Message <span className="text-sm font-normal text-slate-500 dark:text-slate-400">(auto-extracted from image or manual entry)</span>
              </label>
              <textarea
                id="fraudMessage"
                name="fraudMessage"
                value={formData.fraudMessage}
                onChange={handleInputChange}
                placeholder="Additional fraud-related information will appear here when you upload an image, or you can enter it manually..."
                rows="4"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 resize-vertical"
              />
              {formData.fraudMessage && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-amber-600 dark:text-amber-400">💡</span>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      This information will be sent to the agent as additional context about potential fraud.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Issue Summary */}
            <div className="space-y-2">
              <label htmlFor="issueSummary" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Issue Summary <span className="text-red-500">*</span>
              </label>
              <textarea
                id="issueSummary"
                name="issueSummary"
                value={formData.issueSummary}
                onChange={handleInputChange}
                required
                placeholder="Please describe your issue in detail..."
                rows="6"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 resize-vertical"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className={`
                  w-full px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 
                  text-white font-bold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 
                  transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 
                  dark:focus:ring-offset-slate-900 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none
                  ${isSubmitting ? 'bg-gradient-to-r from-slate-400 to-slate-500' : ''}
                `}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Submitting Complaint...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-3">
                    <span>📤</span>
                    <span>Submit Complaint</span>
                  </div>
                )}
              </button>
            </div>

            {/* Status Message */}
            {submitMessage && (
              <div className={`
                p-4 rounded-lg border-2 ${
                  submitMessage.includes('Error') || submitMessage.includes('OCR Error')
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
                    : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
                }
              `}>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">
                    {submitMessage.includes('Error') || submitMessage.includes('OCR Error') ? '❌' : '✅'}
                  </span>
                  <p className="font-medium">{submitMessage}</p>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ComplaintForm;
