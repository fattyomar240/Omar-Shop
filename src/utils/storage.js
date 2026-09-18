// LocalStorage helper utilities with initial demo data

const LOANS_KEY = 'omars_shop_loans';
const SUPPLIES_KEY = 'omars_shop_supplies';

const INITIAL_LOANS = [
  {
    id: 'loan-1',
    customerName: 'John Doe',
    phone: '555-0192',
    amount: 25.0,
    paidAmount: 10.0,
    date: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
    dueDate: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
    notes: 'Bought groceries & milk',
    status: 'Partially Paid',
    payments: [
      {
        id: 'pay-1',
        amount: 10.0,
        date: new Date(Date.now() - 86400000 * 1).toISOString(),
        note: 'Partial payment made',
      },
    ],
  },
  {
    id: 'loan-2',
    customerName: 'Sarah Smith',
    phone: '555-0144',
    amount: 15.5,
    paidAmount: 0.0,
    date: new Date(Date.now() - 86400000 * 1).toISOString(),
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    notes: '2 loaves of bread and snacks',
    status: 'Pending',
    payments: [],
  },
];

const INITIAL_SUPPLIES = [
  {
    id: 'sup-1',
    supplierName: 'Michael Baker',
    phone: '555-0888',
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    quantity: 50,
    unitPrice: 1.2,
    totalCost: 60.0,
    amountPaid: 60.0,
    status: 'Paid',
    notes: 'Fresh morning batch delivered',
  },
  {
    id: 'sup-2',
    supplierName: 'Michael Baker',
    phone: '555-0888',
    date: new Date().toISOString(),
    quantity: 60,
    unitPrice: 1.2,
    totalCost: 72.0,
    amountPaid: 40.0,
    status: 'Credit',
    notes: 'Partial payment given at delivery',
  },
];

export const getLoans = () => {
  try {
    const data = localStorage.getItem(LOANS_KEY);
    if (!data) {
      localStorage.setItem(LOANS_KEY, JSON.stringify(INITIAL_LOANS));
      return INITIAL_LOANS;
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading loans from localStorage:', error);
    return INITIAL_LOANS;
  }
};

export const saveLoans = (loans) => {
  try {
    localStorage.setItem(LOANS_KEY, JSON.stringify(loans));
  } catch (error) {
    console.error('Error saving loans to localStorage:', error);
  }
};

export const getSupplies = () => {
  try {
    const data = localStorage.getItem(SUPPLIES_KEY);
    if (!data) {
      localStorage.setItem(SUPPLIES_KEY, JSON.stringify(INITIAL_SUPPLIES));
      return INITIAL_SUPPLIES;
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading supplies from localStorage:', error);
    return INITIAL_SUPPLIES;
  }
};

export const saveSupplies = (supplies) => {
  try {
    localStorage.setItem(SUPPLIES_KEY, JSON.stringify(supplies));
  } catch (error) {
    console.error('Error saving supplies to localStorage:', error);
  }
};

export const exportAllData = () => {
  const loans = getLoans();
  const supplies = getSupplies();
  const backup = {
    exportDate: new Date().toISOString(),
    version: '1.0',
    loans,
    supplies,
  };
  return JSON.stringify(backup, null, 2);
};

export const importAllData = (jsonString) => {
  try {
    const data = JSON.parse(jsonString);
    if (Array.isArray(data.loans) && Array.isArray(data.supplies)) {
      saveLoans(data.loans);
      saveSupplies(data.supplies);
      return { success: true, countLoans: data.loans.length, countSupplies: data.supplies.length };
    } else {
      return { success: false, error: 'Invalid backup file format.' };
    }
  } catch (error) {
    return { success: false, error: 'Failed to parse JSON backup file.' };
  }
};

export const resetToDemoData = () => {
  localStorage.setItem(LOANS_KEY, JSON.stringify(INITIAL_LOANS));
  localStorage.setItem(SUPPLIES_KEY, JSON.stringify(INITIAL_SUPPLIES));
};
