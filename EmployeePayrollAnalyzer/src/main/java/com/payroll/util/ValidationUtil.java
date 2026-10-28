package com.payroll.util;

import java.util.ArrayList;
import java.util.List;

/**
 * Utility class for server-side validation of employee payroll inputs.
 * Ensures data integrity before records enter the service layer.
 */
public class ValidationUtil {

    private ValidationUtil() {
        // Prevent instantiation
    }

    /**
     * Validates employee fields and returns a list of error descriptions.
     * An empty list denotes successful validation.
     *
     * @param idStr       raw employee ID parameter
     * @param name        employee name
     * @param department  department name
     * @param salaryStr   raw salary parameter
     * @return List of error messages, if any
     */
    public static List<String> validateEmployeeInputs(String idStr, String name, String department, String salaryStr) {
        List<String> errors = new ArrayList<>();

        // Validate Employee ID
        if (idStr == null || idStr.trim().isEmpty()) {
            errors.add("Employee ID is required.");
        } else {
            try {
                int id = Integer.parseInt(idStr.trim());
                if (id <= 0) {
                    errors.add("Employee ID must be a positive integer greater than zero.");
                }
            } catch (NumberFormatException e) {
                errors.add("Employee ID must be a valid integer number.");
            }
        }

        // Validate Name
        if (name == null || name.trim().isEmpty()) {
            errors.add("Full Name is required.");
        } else {
            String trimmedName = name.trim();
            if (trimmedName.length() < 2 || trimmedName.length() > 100) {
                errors.add("Name must be between 2 and 100 characters.");
            }
            if (!trimmedName.matches("^[a-zA-Z\\s.'-]+$")) {
                errors.add("Name contains invalid characters (letters, spaces, dots, hyphens only).");
            }
        }

        // Validate Department
        if (department == null || department.trim().isEmpty()) {
            errors.add("Department is required.");
        } else {
            String trimmedDept = department.trim();
            if (trimmedDept.length() < 2 || trimmedDept.length() > 50) {
                errors.add("Department name must be between 2 and 50 characters.");
            }
        }

        // Validate Salary
        if (salaryStr == null || salaryStr.trim().isEmpty()) {
            errors.add("Salary is required.");
        } else {
            try {
                double salary = Double.parseDouble(salaryStr.trim());
                if (salary <= 0) {
                    errors.add("Salary must be greater than zero.");
                } else if (salary > 100_000_000) {
                    errors.add("Salary exceeds maximum allowable threshold ($100,000,000).");
                }
            } catch (NumberFormatException e) {
                errors.add("Salary must be a valid numerical value.");
            }
        }

        return errors;
    }

    /**
     * Validates minimum and maximum salary range boundaries.
     */
    public static List<String> validateSalaryRange(String minStr, String maxStr) {
        List<String> errors = new ArrayList<>();
        double min = 0;
        double max = Double.MAX_VALUE;

        if (minStr != null && !minStr.trim().isEmpty()) {
            try {
                min = Double.parseDouble(minStr.trim());
                if (min < 0) {
                    errors.add("Minimum salary cannot be negative.");
                }
            } catch (NumberFormatException e) {
                errors.add("Minimum salary must be a valid number.");
            }
        }

        if (maxStr != null && !maxStr.trim().isEmpty()) {
            try {
                max = Double.parseDouble(maxStr.trim());
                if (max < 0) {
                    errors.add("Maximum salary cannot be negative.");
                }
            } catch (NumberFormatException e) {
                errors.add("Maximum salary must be a valid number.");
            }
        }

        if (errors.isEmpty() && min > max) {
            errors.add("Minimum salary cannot exceed maximum salary.");
        }

        return errors;
    }
}
