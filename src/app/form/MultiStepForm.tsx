'use client';

import { useState, useEffect } from 'react';
import { initialFormData, FormData } from './formData';
import { Step1, Step2, Step3, Step4, Step5, Step6, Step7 } from './StepComponents';

export default function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const totalSteps = 7;

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('mygastro_form_draft');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData({ ...initialFormData, ...parsed });
      } catch (e) {
        console.error('Failed to parse draft');
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to local storage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('mygastro_form_draft', JSON.stringify(formData));
    }
  }, [formData, isLoaded]);

  const updateData = (fields: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');
    
    // Convert arrays to JSON strings for Prisma schema compatibility
    const payload = {
      ...formData,
      previousSurgeries: JSON.stringify(formData.previousSurgeries),
      previousTreatmentsTried: JSON.stringify(formData.previousTreatmentsTried),
      comorbidities: JSON.stringify(formData.comorbidities),
      // Ensure numeric fields
      currentAge: Number(formData.currentAge) || 0,
      ageAtDiagnosis: Number(formData.ageAtDiagnosis) || 0,
    };

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Failed to submit form');
      }

      localStorage.removeItem('mygastro_form_draft');
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded) return <div className="text-center">Loading...</div>;

  if (success) {
    return (
      <div className="text-center animate-fade-in py-10">
        <h2 className="text-2xl text-success-color mb-4">Submission Successful!</h2>
        <p>Thank you for filling out the intake form.</p>
        <button onClick={() => window.location.href = '/'} className="btn btn-primary mt-6">Return to Home</button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="wizard-progress">
        {Array.from({ length: totalSteps }).map((_, idx) => {
          const stepNum = idx + 1;
          let className = 'wizard-step';
          if (stepNum === currentStep) className += ' active';
          else if (stepNum < currentStep) className += ' completed';
          return (
            <div key={idx} className={className}>
              {stepNum}
            </div>
          );
        })}
      </div>

      <div className="min-h-[400px]">
        {currentStep === 1 && <Step1 data={formData} updateData={updateData} />}
        {currentStep === 2 && <Step2 data={formData} updateData={updateData} />}
        {currentStep === 3 && <Step3 data={formData} updateData={updateData} />}
        {currentStep === 4 && <Step4 data={formData} updateData={updateData} />}
        {currentStep === 5 && <Step5 data={formData} updateData={updateData} />}
        {currentStep === 6 && <Step6 data={formData} updateData={updateData} />}
        {currentStep === 7 && <Step7 data={formData} updateData={updateData} />}
      </div>

      {error && <div className="text-red-500 mt-4 text-center">{error}</div>}

      <div className="flex justify-between mt-8 border-t border-white/10 pt-6">
        <button
          onClick={handleBack}
          disabled={currentStep === 1 || isSubmitting}
          className={`btn ${currentStep === 1 ? 'opacity-50 cursor-not-allowed bg-gray-600' : 'btn-secondary'}`}
        >
          Back
        </button>
        {currentStep < totalSteps ? (
          <button onClick={handleNext} className="btn btn-primary">
            Next
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={isSubmitting} className="btn btn-primary">
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        )}
      </div>
    </div>
  );
}
