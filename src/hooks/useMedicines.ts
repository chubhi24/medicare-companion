import { useApp } from '../context/AppContext';
import { Medicine } from '../models/Medicine';

export const useMedicines = () => {
  const {
    medicines,
    isLoading,
    error,
    addMedicine,
    updateMedicine,
    deleteMedicine
  } = useApp();

  // Filter medicines that are running low on stock
  const lowStockMedicines = medicines.filter(
    (med) => med.quantity <= med.refillThreshold
  );

  const searchMedicines = (query: string): Medicine[] => {
    if (!query) return medicines;
    const cleanQuery = query.toLowerCase().trim();
    return medicines.filter(
      (med) =>
        med.name.toLowerCase().includes(cleanQuery) ||
        med.notes?.toLowerCase().includes(cleanQuery) ||
        med.type.toLowerCase().includes(cleanQuery)
    );
  };

  return {
    medicines,
    lowStockMedicines,
    hasLowStock: lowStockMedicines.length > 0,
    isLoading,
    error,
    addMedicine,
    updateMedicine,
    deleteMedicine,
    searchMedicines,
  };
};
