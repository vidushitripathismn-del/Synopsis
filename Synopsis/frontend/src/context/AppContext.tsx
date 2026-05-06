import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User, Asset, InventoryItem, Transaction, MaintenanceRecord,
  USERS, ASSETS, INVENTORY_ITEMS, TRANSACTIONS, MAINTENANCE_RECORDS
} from '../data/seed';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  assets: Asset[];
  inventoryItems: InventoryItem[];
  transactions: Transaction[];
  maintenanceRecords: MaintenanceRecord[];
  login: (email: string) => boolean;
  logout: () => void;
  addAsset: (asset: Asset) => void;
  updateAsset: (id: string, asset: Partial<Asset>) => void;
  deleteAsset: (id: string) => void;
  addInventoryItem: (item: InventoryItem) => void;
  updateInventoryItem: (id: string, item: Partial<InventoryItem>) => void;
  deleteInventoryItem: (id: string) => void;
  recordTransaction: (tx: Transaction) => void;
  addMaintenance: (record: MaintenanceRecord) => void;
  updateMaintenance: (id: string, record: Partial<MaintenanceRecord>) => void;
  deleteMaintenance: (id: string) => void;
  addUser: (user: User) => void;
  updateUser: (id: string, user: Partial<User>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'smarttrack_data';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(USERS);
  const [assets, setAssets] = useState<Asset[]>(ASSETS);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(INVENTORY_ITEMS);
  const [transactions, setTransactions] = useState<Transaction[]>(TRANSACTIONS);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>(MAINTENANCE_RECORDS);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.currentUser) setCurrentUser(data.currentUser);
        if (data.users) setUsers(data.users);
        if (data.assets) {
          // Parse dates
          const parsedAssets = data.assets.map((a: any) => ({
            ...a,
            purchaseDate: new Date(a.purchaseDate),
            warrantyExpiry: a.warrantyExpiry ? new Date(a.warrantyExpiry) : null,
            createdAt: new Date(a.createdAt)
          }));
          setAssets(parsedAssets);
        }
        if (data.inventoryItems) setInventoryItems(data.inventoryItems);
        if (data.transactions) {
          const parsedTx = data.transactions.map((t: any) => ({
            ...t,
            date: new Date(t.date)
          }));
          setTransactions(parsedTx);
        }
        if (data.maintenanceRecords) {
          const parsedMaint = data.maintenanceRecords.map((m: any) => ({
            ...m,
            scheduledDate: new Date(m.scheduledDate),
            completedDate: m.completedDate ? new Date(m.completedDate) : null
          }));
          setMaintenanceRecords(parsedMaint);
        }
      } catch (e) {
        console.error('Failed to load from localStorage', e);
      }
    }
  }, []);

  // Save to localStorage on state change
  useEffect(() => {
    const data = {
      currentUser,
      users,
      assets,
      inventoryItems,
      transactions,
      maintenanceRecords
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [currentUser, users, assets, inventoryItems, transactions, maintenanceRecords]);

  const login = (email: string): boolean => {
    const user = users.find(u => u.email === email && u.isActive);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const addAsset = (asset: Asset) => {
    setAssets(prev => [...prev, asset]);
  };

  const updateAsset = (id: string, updates: Partial<Asset>) => {
    setAssets(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const deleteAsset = (id: string) => {
    setAssets(prev => prev.filter(a => a.id !== id));
  };

  const addInventoryItem = (item: InventoryItem) => {
    setInventoryItems(prev => [...prev, item]);
  };

  const updateInventoryItem = (id: string, updates: Partial<InventoryItem>) => {
    setInventoryItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  };

  const deleteInventoryItem = (id: string) => {
    setInventoryItems(prev => prev.filter(i => i.id !== id));
  };

  const recordTransaction = (tx: Transaction) => {
    setTransactions(prev => [tx, ...prev]);
    
    // Update inventory quantity
    const item = inventoryItems.find(i => i.id === tx.itemId);
    if (item) {
      let newQty = item.quantityOnHand;
      if (tx.type === 'INWARD') {
        newQty += tx.quantity;
      } else if (tx.type === 'OUTWARD') {
        newQty -= tx.quantity;
      }
      updateInventoryItem(tx.itemId, { quantityOnHand: newQty });
    }
  };

  const addMaintenance = (record: MaintenanceRecord) => {
    setMaintenanceRecords(prev => [...prev, record]);
  };

  const updateMaintenance = (id: string, updates: Partial<MaintenanceRecord>) => {
    setMaintenanceRecords(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const deleteMaintenance = (id: string) => {
    setMaintenanceRecords(prev => prev.filter(m => m.id !== id));
  };

  const addUser = (user: User) => {
    setUsers(prev => [...prev, user]);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    if (currentUser?.id === id) {
      setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      users,
      assets,
      inventoryItems,
      transactions,
      maintenanceRecords,
      login,
      logout,
      addAsset,
      updateAsset,
      deleteAsset,
      addInventoryItem,
      updateInventoryItem,
      deleteInventoryItem,
      recordTransaction,
      addMaintenance,
      updateMaintenance,
      deleteMaintenance,
      addUser,
      updateUser
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};