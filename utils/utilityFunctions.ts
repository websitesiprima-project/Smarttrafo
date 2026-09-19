// src/utils/utilityFunctions.ts

// --- 1. EMAIL VALIDATOR ---
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// --- 2. PASSWORD VALIDATOR ---
export const validatePassword = (password: unknown): boolean => {
  return !!(typeof password === "string" && password.length >= 6);
};

export const validateStrongPassword = (password: string): boolean => {
  // Minimal 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
};

// --- 3. NUMBER PARSER ---
export const parseNumber = (value: unknown): number => {
  const num = parseFloat(String(value));
  return isNaN(num) ? 0 : num;
};

export const parseInteger = (value: unknown): number => {
  const num = parseInt(String(value), 10);
  return isNaN(num) ? 0 : num;
};

// --- 4. DATE VALIDATOR ---
export const isValidDate = (dateString: unknown): boolean => {
  if (!dateString) return false;
  const date = new Date(dateString as string | number | Date);
  return date instanceof Date && !isNaN(date.getTime());
};

export const formatDate = (date: string | number | Date): string => {
  return new Date(date).toISOString().split("T")[0];
};

// --- 5. UNIT NAME VALIDATOR ---
export const validateUnitName = (name: unknown): boolean => {
  return !!(
    typeof name === "string" &&
    name.trim().length > 0 &&
    name.trim().length <= 100
  );
};

export const sanitizeUnitName = (name: string): string => {
  return name.trim().replace(/\s+/g, " ");
};

// --- 6. GAS VALUE RANGE VALIDATOR ---
export const validateGasValue = (
  value: unknown,
  min = 0,
  max = 10000,
): boolean => {
  const num = parseFloat(String(value));
  return !isNaN(num) && num >= min && num <= max;
};

export const clampGasValue = (value: unknown, min = 0, max = 10000): number => {
  const num = parseFloat(String(value));
  if (isNaN(num)) return 0;
  return Math.max(min, Math.min(max, num));
};

// --- 7. STATUS CODE MAPPER ---
export const getStatusText = (code: number): string => {
  const statusMap: Record<number, string> = {
    1: "Normal",
    2: "Waspada",
    3: "Bahaya",
  };
  return statusMap[code] || "Unknown";
};

export const getStatusColor = (code: number): string => {
  const colorMap: Record<number, string> = {
    1: "#10b981", // green
    2: "#f59e0b", // amber
    3: "#ef4444", // red
  };
  return colorMap[code] || "#6b7280"; // gray
};

// --- 8. ARRAY UTILITIES ---
export const sortByProperty = <T extends Record<string, any>>(
  arr: T[],
  prop: keyof T,
  ascending = true,
): T[] => {
  return [...arr].sort((a, b) => {
    const aVal = a[prop];
    const bVal = b[prop];
    const comparison = aVal > bVal ? 1 : -1;
    return ascending ? comparison : -comparison;
  });
};

export const filterByRole = <T extends { role: string }>(
  users: T[],
  role: string,
): T[] => {
  return users.filter((user) => user.role === role);
};

export const groupByRole = <T extends { role: string }>(
  users: T[],
): Record<string, T[]> => {
  return users.reduce(
    (acc, user) => {
      if (!acc[user.role]) {
        acc[user.role] = [];
      }
      acc[user.role].push(user);
      return acc;
    },
    {} as Record<string, T[]>,
  );
};

// --- 9. OBJECT UTILITIES ---
export const mergeObjects = <A extends object, B extends object>(
  obj1: A,
  obj2: B,
): A & B => {
  return { ...obj1, ...obj2 };
};

export const pickProperties = <T extends object>(
  obj: T,
  keys: string[],
): Partial<T> => {
  return keys.reduce((acc, key) => {
    if (key in obj) {
      (acc as Record<string, unknown>)[key] = (obj as Record<string, unknown>)[key];
    }
    return acc;
  }, {} as Partial<T>);
};

export const hasAllProperties = <T extends object>(
  obj: T,
  keys: string[],
): boolean => {
  return keys.every((key) => key in obj);
};

// --- 10. STRING UTILITIES ---
export const capitalizeString = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const truncateString = (str: string, maxLength: number): string => {
  return str.length > maxLength ? str.substring(0, maxLength) + "..." : str;
};

export const escapeHTML = (str: string): string => {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return str.replace(/[&<>"']/g, (m) => map[m]);
};

// --- 11. ERROR HANDLING UTILITIES ---
export const safeExecute = <T>(fn: () => T, defaultValue: T): T => {
  try {
    return fn();
  } catch (error) {
    console.error(error); // Bisa diganti dengan logger service
    return defaultValue;
  }
};

export const validateInput = (input: unknown): boolean => {
  if (!input) {
    throw new Error("Input is required");
  }
  if (typeof input !== "string") {
    throw new Error("Input must be a string");
  }
  if (input.trim().length === 0) {
    throw new Error("Input cannot be empty");
  }
  return true;
};
