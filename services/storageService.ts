
import { Employee } from '../types';

const DB_NAME = 'ChronosDB';
const DB_VERSION = 1;
const STORE_NAME = 'employees';

class StorageService {
  private db: IDBDatabase | null = null;

  // Initialize DB
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = (event) => {
        console.error("IndexedDB error:", event);
        reject("Database error");
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
    });
  }

  // Get all employees
  async getAllEmployees(): Promise<Employee[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result as Employee[]);
      };
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Save (Add or Update) employee
  async saveEmployee(employee: Employee): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(employee);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Bulk save (for import)
  async saveAll(employees: Employee[]): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      // Clear existing first? Or Merge? Let's clear to be safe on restore
      store.clear();

      let count = 0;
      employees.forEach(emp => {
        const request = store.put(emp);
        request.onsuccess = () => {
          count++;
          if (count === employees.length) resolve();
        };
        request.onerror = () => reject("Error importing item");
      });
      
      if (employees.length === 0) resolve(); // Handle empty array
    });
  }

  // Delete employee
  async deleteEmployee(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Migration Helper: Move LocalStorage to IndexedDB if exists
  async migrateFromLocalStorage(mockData: Employee[]): Promise<Employee[]> {
    await this.init();
    
    const existingDBData = await this.getAllEmployees();
    
    // If DB is empty, check LocalStorage
    if (existingDBData.length === 0) {
      const localDataStr = localStorage.getItem('chronos_data');
      
      if (localDataStr) {
        console.log("Migrating data from LocalStorage to IndexedDB...");
        try {
          const localData = JSON.parse(localDataStr);
          await this.saveAll(localData);
          localStorage.removeItem('chronos_data'); // Cleanup
          return localData;
        } catch (e) {
          console.error("Migration failed", e);
        }
      } 
      
      // If still empty (no localStorage), load Mock Data
      console.log("Loading Mock Data...");
      await this.saveAll(mockData);
      return mockData;
    }

    return existingDBData;
  }
}

export const dbService = new StorageService();
