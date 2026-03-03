import { validateInput, safeExecute } from "./utilityFunctions";

describe("White Box Testing - utilityFunctions.ts", () => {
  describe("validateInput()", () => {
    // Branch 1: if (!input)
    it("should throw an error if input is falsy (e.g., null, undefined, empty string)", () => {
      expect(() => validateInput(null)).toThrow("Input is required");
      expect(() => validateInput(undefined)).toThrow("Input is required");
      expect(() => validateInput("")).toThrow("Input is required");
    });

    // Branch 2: if (typeof input !== "string")
    it("should throw an error if input is not a string (but truthy)", () => {
      expect(() => validateInput(123)).toThrow("Input must be a string");
      expect(() => validateInput({})).toThrow("Input must be a string");
      expect(() => validateInput([])).toThrow("Input must be a string");
    });

    // Branch 3: if (input.trim().length === 0)
    it("should throw an error if input is a string of only whitespace", () => {
      expect(() => validateInput("   ")).toThrow("Input cannot be empty");
      expect(() => validateInput(" \t\n ")).toThrow("Input cannot be empty");
    });

    // Branch 4: default return true
    it("should return true if input is a valid string", () => {
      expect(validateInput("valid input")).toBe(true);
      expect(validateInput("  padded input  ")).toBe(true);
    });
  });

  describe("safeExecute()", () => {
    // Branch 1: try block succeeds
    it("should execute the function and return its result if no error is thrown", () => {
      const mockFn = jest.fn(() => "success");
      const result = safeExecute(mockFn, "default");

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(result).toBe("success");
    });

    // Branch 2: catch block executes
    it("should catch error, log it, and return the defaultValue if function throws", () => {
      // Mock console.error to avoid test output noise
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
