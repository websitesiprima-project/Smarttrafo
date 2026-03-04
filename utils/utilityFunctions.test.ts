import {
  validateEmail,
  validatePassword,
  validateStrongPassword,
  parseNumber,
  parseInteger,
  isValidDate,
  formatDate,
  validateUnitName,
  sanitizeUnitName,
  validateGasValue,
  clampGasValue,
  getStatusText,
  getStatusColor,
  sortByProperty,
  filterByRole,
  groupByRole,
  mergeObjects,
  pickProperties,
  hasAllProperties,
  capitalizeString,
  truncateString,
  escapeHTML,
  validateInput,
  safeExecute,
} from "./utilityFunctions";

describe("White Box Testing - utilityFunctions.ts", () => {
  describe("1. EMAIL VALIDATOR", () => {
    it("validateEmail should return true for valid emails", () => {
      expect(validateEmail("test@example.com")).toBe(true);
      expect(validateEmail("user.name@sub.domain.org")).toBe(true);
    });

    it("validateEmail should return false for invalid emails", () => {
      expect(validateEmail("test")).toBe(false);
      expect(validateEmail("test@")).toBe(false);
      expect(validateEmail("@example.com")).toBe(false);
      expect(validateEmail("test@example")).toBe(false);
      expect(validateEmail("test@.com")).toBe(false);
    });
  });

  describe("2. PASSWORD VALIDATOR", () => {
    it("validatePassword should require length >= 6", () => {
      expect(validatePassword("12345")).toBe(false);
      expect(validatePassword("123456")).toBe(true);
      expect(validatePassword("")).toBe(false);
      expect(validatePassword(null)).toBe(false);
    });

    it("validateStrongPassword should require complex conditions", () => {
      // Minimal 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
      expect(validateStrongPassword("Password123!")).toBe(true);
      expect(validateStrongPassword("weakpassword")).toBe(false);
      expect(validateStrongPassword("Short1!")).toBe(false); // < 8 chars
      expect(validateStrongPassword("NOLOWERCASE123!")).toBe(false);
      expect(validateStrongPassword("nouppercase123!")).toBe(false);
      expect(validateStrongPassword("NoSpecialChar123")).toBe(false);
      expect(validateStrongPassword("NoNumber!!!")).toBe(false);
    });
  });

  describe("3. NUMBER PARSER", () => {
    it("parseNumber should handle valid and invalid inputs", () => {
      expect(parseNumber("12.34")).toBe(12.34);
      expect(parseNumber(42)).toBe(42);
      expect(parseNumber("invalid")).toBe(0);
      expect(parseNumber(null)).toBe(0);
    });

    it("parseInteger should handle valid and invalid inputs", () => {
      expect(parseInteger("12.34")).toBe(12);
      expect(parseInteger("42")).toBe(42);
      expect(parseInteger("invalid")).toBe(0);
      expect(parseInteger(null)).toBe(0);
    });
  });

  describe("4. DATE VALIDATOR", () => {
    it("isValidDate should validate formatting boundaries", () => {
      expect(isValidDate("2026-03-03")).toBe(true);
      expect(isValidDate("2026-03-03T12:00:00Z")).toBe(true);
      expect(isValidDate("invalid data")).toBe(false);
      expect(isValidDate(null)).toBe(false);
    });

    it("formatDate should format to YYYY-MM-DD", () => {
      expect(formatDate("2026-03-03T12:30:00.000Z")).toBe("2026-03-03");
      expect(formatDate(new Date("2026-01-01T00:00:00.000Z"))).toBe(
        "2026-01-01",
      );
    });
  });

  describe("5. UNIT NAME VALIDATOR", () => {
    it("validateUnitName should require valid length", () => {
      expect(validateUnitName("Trafo 1")).toBe(true);
      expect(validateUnitName("   ")).toBe(false);
      expect(validateUnitName("")).toBe(false);
      expect(validateUnitName(null)).toBe(false);
      const longName = "A".repeat(101);
      expect(validateUnitName(longName)).toBe(false);

      const exactLong = "A".repeat(100);
      expect(validateUnitName(exactLong)).toBe(true);
    });

    it("sanitizeUnitName should trim and compress multiple spaces", () => {
      expect(sanitizeUnitName("  Trafo    1  ")).toBe("Trafo 1");
      expect(sanitizeUnitName("ULTG")).toBe("ULTG");
    });
  });

  describe("6. GAS VALUE RANGE VALIDATOR", () => {
    it("validateGasValue boundaries", () => {
      expect(validateGasValue("5000")).toBe(true); // default min 0 max 10000
      expect(validateGasValue("-1")).toBe(false);
      expect(validateGasValue("10001")).toBe(false);
      expect(validateGasValue("invalid")).toBe(false);

      // custom max
      expect(validateGasValue("50", 0, 100)).toBe(true);
      expect(validateGasValue("101", 0, 100)).toBe(false);
    });

    it("clampGasValue boundaries", () => {
      expect(clampGasValue("50")).toBe(50);
      expect(clampGasValue("-10")).toBe(0); // below min
      expect(clampGasValue("20000")).toBe(10000); // above max
      expect(clampGasValue("invalid")).toBe(0); // NaN check

      // Custom params
      expect(clampGasValue("105", 0, 100)).toBe(100);
      expect(clampGasValue("-5", 0, 100)).toBe(0);
    });
  });

  describe("7. STATUS CODE MAPPER", () => {
    it("getStatusText maps integers to string", () => {
      expect(getStatusText(1)).toBe("Normal");
      expect(getStatusText(2)).toBe("Waspada");
      expect(getStatusText(3)).toBe("Bahaya");
      expect(getStatusText(99)).toBe("Unknown");
    });

    it("getStatusColor maps integers to hex color", () => {
      expect(getStatusColor(1)).toBe("#10b981");
      expect(getStatusColor(2)).toBe("#f59e0b");
      expect(getStatusColor(3)).toBe("#ef4444");
      expect(getStatusColor(99)).toBe("#6b7280"); // fallback
    });
  });

  describe("8. ARRAY UTILITIES", () => {
    const users = [
      { id: 1, name: "Budi", role: "admin" },
      { id: 2, name: "Andi", role: "viewer" },
      { id: 3, name: "Cika", role: "admin" },
    ];

    it("sortByProperty sorts objects gracefully", () => {
      const sortedAsc = sortByProperty(users, "name", true);
      expect(sortedAsc[0].name).toBe("Andi");
      expect(sortedAsc[1].name).toBe("Budi");

      const sortedDesc = sortByProperty(users, "name", false);
      expect(sortedDesc[0].name).toBe("Cika");
      expect(sortedDesc[1].name).toBe("Budi");
    });

    it("filterByRole acts accordingly", () => {
      const admins = filterByRole(users, "admin");
      expect(admins.length).toBe(2);
      expect(admins[0].name).toBe("Budi");

      const viewers = filterByRole(users, "viewer");
      expect(viewers.length).toBe(1);
    });

    it("groupByRole maps cleanly", () => {
      const grouped = groupByRole(users);
      expect(grouped["admin"].length).toBe(2);
      expect(grouped["viewer"].length).toBe(1);
    });
  });

  describe("9. OBJECT UTILITIES", () => {
    it("mergeObjects", () => {
      expect(mergeObjects({ a: 1 }, { b: 2 })).toEqual({ a: 1, b: 2 });
      expect(mergeObjects({ a: 1 }, { a: 2 })).toEqual({ a: 2 });
    });

    it("pickProperties gracefully picks given keys", () => {
      const obj = { id: 1, name: "T1", status: "OK" };
      expect(pickProperties(obj, ["id", "status"])).toEqual({
        id: 1,
        status: "OK",
      });
      expect(pickProperties(obj, ["id", "missing"])).toEqual({ id: 1 });
    });

    it("hasAllProperties verifies subset of keys", () => {
      const obj = { id: 1, name: "T1", status: "OK" };
      expect(hasAllProperties(obj, ["id", "name"])).toBe(true);
      expect(hasAllProperties(obj, ["id", "value"])).toBe(false);
    });
  });

  describe("10. STRING UTILITIES", () => {
    it("capitalizeString", () => {
      expect(capitalizeString("hello")).toBe("Hello");
      expect(capitalizeString("World")).toBe("World");
    });

    it("truncateString cuts overflow", () => {
      expect(truncateString("1234567890", 5)).toBe("12345...");
      expect(truncateString("123", 5)).toBe("123");
    });

    it("escapeHTML replaces problematic chars", () => {
      expect(escapeHTML("<div>\"&'</div>")).toBe(
        "&lt;div&gt;&quot;&amp;&#039;&lt;/div&gt;",
      );
    });
  });

  describe("11. ERROR HANDLING UTILITIES", () => {
    describe("validateInput()", () => {
      it("should throw an error if input is falsy", () => {
        expect(() => validateInput(null)).toThrow("Input is required");
        expect(() => validateInput(undefined)).toThrow("Input is required");
        expect(() => validateInput("")).toThrow("Input is required");
      });

      it("should throw an error if input is not a string", () => {
        expect(() => validateInput(123)).toThrow("Input must be a string");
        expect(() => validateInput({})).toThrow("Input must be a string");
        expect(() => validateInput([])).toThrow("Input must be a string");
      });

      it("should throw an error if input is a string of only whitespace", () => {
        expect(() => validateInput("   ")).toThrow("Input cannot be empty");
      });

      it("should return true if input is a valid string", () => {
        expect(validateInput("valid input")).toBe(true);
      });
    });

    describe("safeExecute()", () => {
      it("should execute the function and return its result if no error is thrown", () => {
        const mockFn = jest.fn(() => "success");
        const result = safeExecute(mockFn, "default");

        expect(mockFn).toHaveBeenCalledTimes(1);
        expect(result).toBe("success");
      });

      it("should catch error, log it, and return the defaultValue if function throws", () => {
        const consoleSpy = jest
          .spyOn(console, "error")
          .mockImplementation(() => {});
        const mockFn = jest.fn(() => {
          throw new Error("Some expected error");
        });

        const result = safeExecute(mockFn, "default");

        expect(mockFn).toHaveBeenCalledTimes(1);
        expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
        expect(result).toBe("default");

        consoleSpy.mockRestore();
      });
    });
  });
});
