import { useState, useCallback, useEffect, useRef } from 'react';
import type { MedicalHistory } from '@/types';

export const useMedicalHistoryForm = (
  patientId: string,
  patientGender?: 'Masculino' | 'Femenino' | 'Otro',
  existingHistory?: MedicalHistory
) => {
  const previousHistoryId = useRef<string | undefined>(existingHistory?.id);
  
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

  // Efecto para actualizar formData cuando existingHistory cambia (después de guardar)
  useEffect(() => {
    // Solo actualizar si el ID de la historia cambió (nueva historia guardada)
    if (existingHistory?.id && existingHistory.id !== previousHistoryId.current) {
      previousHistoryId.current = existingHistory.id;
      // Actualizar el formulario con los datos guardados
      setFormData({
        patientId,
        doctorId: existingHistory.doctorId || '',
        doctorName: existingHistory.doctorName || '',
        identification: {
          occupation: existingHistory.identification?.occupation || '',
          maritalStatus: existingHistory.identification?.maritalStatus || '',
          education: existingHistory.identification?.education || '',
          placeOfBirth: existingHistory.identification?.placeOfBirth || '',
          currentResidence: existingHistory.identification?.currentResidence || '',
        },
        familyHistory: {
          diabetes: existingHistory.familyHistory?.diabetes || false,
          hypertension: existingHistory.familyHistory?.hypertension || false,
          cancer: existingHistory.familyHistory?.cancer || false,
          heartDisease: existingHistory.familyHistory?.heartDisease || false,
          neurologicalDisorders: existingHistory.familyHistory?.neurologicalDisorders || false,
          mentalDisorders: existingHistory.familyHistory?.mentalDisorders || false,
          other: existingHistory.familyHistory?.other || '',
        },
        pathologicalHistory: {
          allergies: existingHistory.pathologicalHistory?.allergies || [],
          chronicDiseases: existingHistory.pathologicalHistory?.chronicDiseases || [],
          previousSurgeries: existingHistory.pathologicalHistory?.previousSurgeries || [],
          traumas: existingHistory.pathologicalHistory?.traumas || '',
          transfusions: existingHistory.pathologicalHistory?.transfusions || '',
          hospitalizations: existingHistory.pathologicalHistory?.hospitalizations || [],
          addictions: {
            smoking: existingHistory.pathologicalHistory?.addictions?.smoking || false,
            smokingDetails: existingHistory.pathologicalHistory?.addictions?.smokingDetails || '',
            alcohol: existingHistory.pathologicalHistory?.addictions?.alcohol || false,
            alcoholDetails: existingHistory.pathologicalHistory?.addictions?.alcoholDetails || '',
            drugs: existingHistory.pathologicalHistory?.addictions?.drugs || false,
            drugsDetails: existingHistory.pathologicalHistory?.addictions?.drugsDetails || '',
          },
        },
        nonPathologicalHistory: {
          housing: {
            basicServices: existingHistory.nonPathologicalHistory?.housing?.basicServices ?? true,
            overcrowding: existingHistory.nonPathologicalHistory?.housing?.overcrowding || false,
            pets: existingHistory.nonPathologicalHistory?.housing?.pets || '',
          },
          diet: existingHistory.nonPathologicalHistory?.diet || '',
          physicalActivity: existingHistory.nonPathologicalHistory?.physicalActivity || '',
          hygiene: existingHistory.nonPathologicalHistory?.hygiene || '',
          immunizations: existingHistory.nonPathologicalHistory?.immunizations || '',
        },
        gynecologicalHistory: patientGender === 'Femenino' ? {
          menarche: existingHistory.gynecologicalHistory?.menarche || undefined,
          menstrualCycle: existingHistory.gynecologicalHistory?.menstrualCycle || '',
          lastMenstrualPeriod: existingHistory.gynecologicalHistory?.lastMenstrualPeriod || '',
          pregnancies: existingHistory.gynecologicalHistory?.pregnancies || 0,
          births: existingHistory.gynecologicalHistory?.births || 0,
          cesareans: existingHistory.gynecologicalHistory?.cesareans || 0,
          abortions: existingHistory.gynecologicalHistory?.abortions || 0,
          contraception: existingHistory.gynecologicalHistory?.contraception || '',
          lastPapSmear: existingHistory.gynecologicalHistory?.lastPapSmear || '',
          lastMammogram: existingHistory.gynecologicalHistory?.lastMammogram || '',
        } : null,
        systemsReview: {
          general: existingHistory.systemsReview?.general || '',
          respiratory: existingHistory.systemsReview?.respiratory || '',
          cardiovascular: existingHistory.systemsReview?.cardiovascular || '',
          digestive: existingHistory.systemsReview?.digestive || '',
          urinary: existingHistory.systemsReview?.urinary || '',
          musculoskeletal: existingHistory.systemsReview?.musculoskeletal || '',
          neurological: existingHistory.systemsReview?.neurological || '',
        },
      });
    }
  }, [existingHistory, patientId, patientGender]);

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

  // Función para resetear el formulario con datos de historia existente
  const resetForm = useCallback((history: MedicalHistory) => {
    setFormData({
      patientId,
      doctorId: history.doctorId || '',
      doctorName: history.doctorName || '',
      identification: {
        occupation: history.identification?.occupation || '',
        maritalStatus: history.identification?.maritalStatus || '',
        education: history.identification?.education || '',
        placeOfBirth: history.identification?.placeOfBirth || '',
        currentResidence: history.identification?.currentResidence || '',
      },
      familyHistory: {
        diabetes: history.familyHistory?.diabetes || false,
        hypertension: history.familyHistory?.hypertension || false,
        cancer: history.familyHistory?.cancer || false,
        heartDisease: history.familyHistory?.heartDisease || false,
        neurologicalDisorders: history.familyHistory?.neurologicalDisorders || false,
        mentalDisorders: history.familyHistory?.mentalDisorders || false,
        other: history.familyHistory?.other || '',
      },
      pathologicalHistory: {
        allergies: history.pathologicalHistory?.allergies || [],
        chronicDiseases: history.pathologicalHistory?.chronicDiseases || [],
        previousSurgeries: history.pathologicalHistory?.previousSurgeries || [],
        traumas: history.pathologicalHistory?.traumas || '',
        transfusions: history.pathologicalHistory?.transfusions || '',
        hospitalizations: history.pathologicalHistory?.hospitalizations || [],
        addictions: {
          smoking: history.pathologicalHistory?.addictions?.smoking || false,
          smokingDetails: history.pathologicalHistory?.addictions?.smokingDetails || '',
          alcohol: history.pathologicalHistory?.addictions?.alcohol || false,
          alcoholDetails: history.pathologicalHistory?.addictions?.alcoholDetails || '',
          drugs: history.pathologicalHistory?.addictions?.drugs || false,
          drugsDetails: history.pathologicalHistory?.addictions?.drugsDetails || '',
        },
      },
      nonPathologicalHistory: {
        housing: {
          basicServices: history.nonPathologicalHistory?.housing?.basicServices ?? true,
          overcrowding: history.nonPathologicalHistory?.housing?.overcrowding || false,
          pets: history.nonPathologicalHistory?.housing?.pets || '',
        },
        diet: history.nonPathologicalHistory?.diet || '',
        physicalActivity: history.nonPathologicalHistory?.physicalActivity || '',
        hygiene: history.nonPathologicalHistory?.hygiene || '',
        immunizations: history.nonPathologicalHistory?.immunizations || '',
      },
      gynecologicalHistory: patientGender === 'Femenino' ? {
        menarche: history.gynecologicalHistory?.menarche || undefined,
        menstrualCycle: history.gynecologicalHistory?.menstrualCycle || '',
        lastMenstrualPeriod: history.gynecologicalHistory?.lastMenstrualPeriod || '',
        pregnancies: history.gynecologicalHistory?.pregnancies || 0,
        births: history.gynecologicalHistory?.births || 0,
        cesareans: history.gynecologicalHistory?.cesareans || 0,
        abortions: history.gynecologicalHistory?.abortions || 0,
        contraception: history.gynecologicalHistory?.contraception || '',
        lastPapSmear: history.gynecologicalHistory?.lastPapSmear || '',
        lastMammogram: history.gynecologicalHistory?.lastMammogram || '',
      } : null,
      systemsReview: {
        general: history.systemsReview?.general || '',
        respiratory: history.systemsReview?.respiratory || '',
        cardiovascular: history.systemsReview?.cardiovascular || '',
        digestive: history.systemsReview?.digestive || '',
        urinary: history.systemsReview?.urinary || '',
        musculoskeletal: history.systemsReview?.musculoskeletal || '',
        neurological: history.systemsReview?.neurological || '',
      },
    });
  }, [patientId, patientGender]);

  return {
    formData,
    setFormData,
    updateField,
    updateNestedField,
    addToArray,
    removeFromArray,
    updateArrayItem,
    resetForm,
  };
};
