import { useState, useCallback } from 'react';
import type { MedicalHistory } from '@/types';

export const useMedicalHistoryForm = (
  patientId: string,
  patientGender?: 'Masculino' | 'Femenino' | 'Otro',
  existingHistory?: MedicalHistory
) => {
  const [formData, setFormData] = useState<Omit<MedicalHistory, 'id' | 'createdAt' | 'updatedAt'>>({
    patientId,
    doctorId: '',
    doctorName: '',
    identification: {
      occupation: existingHistory?.identification?.occupation || '',
      maritalStatus: existingHistory?.identification?.maritalStatus || '',
      education: existingHistory?.identification?.education || '',
      placeOfBirth: existingHistory?.identification?.placeOfBirth || '',
      currentResidence: existingHistory?.identification?.currentResidence || '',
    },
    familyHistory: {
      diabetes: existingHistory?.familyHistory?.diabetes || false,
      hypertension: existingHistory?.familyHistory?.hypertension || false,
      cancer: existingHistory?.familyHistory?.cancer || false,
      heartDisease: existingHistory?.familyHistory?.heartDisease || false,
      neurologicalDisorders: existingHistory?.familyHistory?.neurologicalDisorders || false,
      mentalDisorders: existingHistory?.familyHistory?.mentalDisorders || false,
      other: existingHistory?.familyHistory?.other || '',
    },
    pathologicalHistory: {
      allergies: existingHistory?.pathologicalHistory?.allergies || [],
      chronicDiseases: existingHistory?.pathologicalHistory?.chronicDiseases || [],
      previousSurgeries: existingHistory?.pathologicalHistory?.previousSurgeries || [],
      traumas: existingHistory?.pathologicalHistory?.traumas || '',
      transfusions: existingHistory?.pathologicalHistory?.transfusions || '',
      hospitalizations: existingHistory?.pathologicalHistory?.hospitalizations || [],
      addictions: {
        smoking: existingHistory?.pathologicalHistory?.addictions?.smoking || false,
        smokingDetails: existingHistory?.pathologicalHistory?.addictions?.smokingDetails || '',
        alcohol: existingHistory?.pathologicalHistory?.addictions?.alcohol || false,
        alcoholDetails: existingHistory?.pathologicalHistory?.addictions?.alcoholDetails || '',
        drugs: existingHistory?.pathologicalHistory?.addictions?.drugs || false,
        drugsDetails: existingHistory?.pathologicalHistory?.addictions?.drugsDetails || '',
      },
    },
    nonPathologicalHistory: {
      housing: {
        basicServices: existingHistory?.nonPathologicalHistory?.housing?.basicServices ?? true,
        overcrowding: existingHistory?.nonPathologicalHistory?.housing?.overcrowding || false,
        pets: existingHistory?.nonPathologicalHistory?.housing?.pets || '',
      },
      diet: existingHistory?.nonPathologicalHistory?.diet || '',
      physicalActivity: existingHistory?.nonPathologicalHistory?.physicalActivity || '',
      hygiene: existingHistory?.nonPathologicalHistory?.hygiene || '',
      immunizations: existingHistory?.nonPathologicalHistory?.immunizations || '',
    },
    gynecologicalHistory: patientGender === 'Femenino' ? {
      menarche: existingHistory?.gynecologicalHistory?.menarche || undefined,
      menstrualCycle: existingHistory?.gynecologicalHistory?.menstrualCycle || '',
      lastMenstrualPeriod: existingHistory?.gynecologicalHistory?.lastMenstrualPeriod || '',
      pregnancies: existingHistory?.gynecologicalHistory?.pregnancies || 0,
      births: existingHistory?.gynecologicalHistory?.births || 0,
      cesareans: existingHistory?.gynecologicalHistory?.cesareans || 0,
      abortions: existingHistory?.gynecologicalHistory?.abortions || 0,
      contraception: existingHistory?.gynecologicalHistory?.contraception || '',
      lastPapSmear: existingHistory?.gynecologicalHistory?.lastPapSmear || '',
      lastMammogram: existingHistory?.gynecologicalHistory?.lastMammogram || '',
    } : null,
    systemsReview: {
      general: existingHistory?.systemsReview?.general || '',
      respiratory: existingHistory?.systemsReview?.respiratory || '',
      cardiovascular: existingHistory?.systemsReview?.cardiovascular || '',
      digestive: existingHistory?.systemsReview?.digestive || '',
      urinary: existingHistory?.systemsReview?.urinary || '',
      musculoskeletal: existingHistory?.systemsReview?.musculoskeletal || '',
      neurological: existingHistory?.systemsReview?.neurological || '',
    },
  });

  // Actualización genérica de campos
  const updateField = useCallback((
    section: keyof typeof formData,
    field: string,
    value: string | number | boolean | undefined
  ) => {
    setFormData(prev => {
      const currentSection = prev[section];
      if (typeof currentSection === 'object' && currentSection !== null) {
        return {
          ...prev,
          [section]: {
            ...currentSection,
            [field]: value,
          },
        };
      }
      return prev;
    });
  }, []);

  // Actualización de campos anidados
  const updateNestedField = useCallback((
    section: keyof typeof formData,
    subsection: string,
    field: string,
    value: string | number | boolean
  ) => {
    setFormData(prev => {
      const currentSection = prev[section];
      if (typeof currentSection === 'object' && currentSection !== null) {
        const currentSubsection = (currentSection as Record<string, unknown>)[subsection];
        if (typeof currentSubsection === 'object' && currentSubsection !== null) {
          return {
            ...prev,
            [section]: {
              ...currentSection,
              [subsection]: {
                ...currentSubsection,
                [field]: value,
              },
            },
          };
        }
      }
      return prev;
    });
  }, []);

  // Operaciones con arrays
  const addToArray = useCallback((
    section: keyof typeof formData,
    field: string,
    item: string | Record<string, string>
  ) => {
    setFormData(prev => {
      const currentSection = prev[section];
      if (typeof currentSection === 'object' && currentSection !== null) {
        const currentArray = (currentSection as Record<string, unknown>)[field];
        return {
          ...prev,
          [section]: {
            ...currentSection,
            [field]: Array.isArray(currentArray) ? [...currentArray, item] : [item],
          },
        };
      }
      return prev;
    });
  }, []);

  const removeFromArray = useCallback((section: keyof typeof formData, field: string, index: number) => {
    setFormData(prev => {
      const currentSection = prev[section];
      if (typeof currentSection === 'object' && currentSection !== null) {
        const currentArray = (currentSection as Record<string, unknown>)[field];
        if (Array.isArray(currentArray)) {
          const newArray = [...currentArray];
          newArray.splice(index, 1);
          return {
            ...prev,
            [section]: {
              ...currentSection,
              [field]: newArray,
            },
          };
        }
      }
      return prev;
    });
  }, []);

  const updateArrayItem = useCallback((
    section: keyof typeof formData,
    arrayField: string,
    index: number,
    itemField: string,
    value: string | number
  ) => {
    setFormData(prev => {
      const currentSection = prev[section];
      if (typeof currentSection === 'object' && currentSection !== null) {
        const currentArray = (currentSection as Record<string, unknown>)[arrayField];
        if (Array.isArray(currentArray)) {
          const newArray = [...currentArray];
          newArray[index] = { ...newArray[index], [itemField]: value };
          return {
            ...prev,
            [section]: {
              ...currentSection,
              [arrayField]: newArray,
            },
          };
        }
      }
      return prev;
    });
  }, []);

  return {
    formData,
    setFormData,
    updateField,
    updateNestedField,
    addToArray,
    removeFromArray,
    updateArrayItem,
  };
};
