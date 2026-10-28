package com.payroll.util;

import com.payroll.model.Employee;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

/**
 * Utility for CSV parsing, validation, and serialization using standard Java I/O.
 * Enforces UTF-8 encoding and atomic verification.
 */
public class CsvUtil {

    public static final String EXPECTED_HEADER = "employeeId,name,department,salary";

    private CsvUtil() {
    }

    public static class CsvParseException extends Exception {
        private final int lineNumber;

        public CsvParseException(String message, int lineNumber) {
            super("Line " + lineNumber + ": " + message);
            this.lineNumber = lineNumber;
        }

        public int getLineNumber() {
            return lineNumber;
        }
    }

    /**
     * Parses and validates a CSV stream into Employee records.
     * Throws CsvParseException on the first invalid record so callers can abort atomically.
     *
     * @param inputStream UTF-8 encoded input stream
     * @return List of validated Employee objects
     * @throws IOException        on I/O failure
     * @throws CsvParseException on invalid header or corrupt records
     */
    public static List<Employee> parseCsv(InputStream inputStream) throws IOException, CsvParseException {
        List<Employee> records = new ArrayList<>();

        if (inputStream == null) {
            throw new CsvParseException("Input stream is null or empty.", 0);
        }

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {
            String headerLine = reader.readLine();
            if (headerLine == null) {
                throw new CsvParseException("CSV file is empty.", 1);
            }

            // Remove potential UTF-8 Byte Order Mark (BOM)
            if (headerLine.startsWith("\uFEFF")) {
                headerLine = headerLine.substring(1);
            }

            // Normalize header
            String normalizedHeader = headerLine.replaceAll("\\s+", "").toLowerCase();
            String normalizedExpected = EXPECTED_HEADER.toLowerCase();

            if (!normalizedHeader.equals(normalizedExpected)) {
                throw new CsvParseException(
                        "Invalid CSV header. Expected '" + EXPECTED_HEADER + "' but found '" + headerLine + "'.", 1);
            }

            String line;
            int lineNumber = 1;
            while ((line = reader.readLine()) != null) {
                lineNumber++;
                if (line.trim().isEmpty()) {
                    continue; // skip blank lines
                }

                String[] parts = line.split(",", -1);
                if (parts.length != 4) {
                    throw new CsvParseException(
                            "Expected 4 columns (employeeId, name, department, salary), found " + parts.length + ".", lineNumber);
                }

                String idStr = parts[0].trim();
                String name = parts[1].trim();
                String department = parts[2].trim();
                String salaryStr = parts[3].trim();

                List<String> errors = ValidationUtil.validateEmployeeInputs(idStr, name, department, salaryStr);
                if (!errors.isEmpty()) {
                    throw new CsvParseException(String.join("; ", errors), lineNumber);
                }

                int empId = Integer.parseInt(idStr);
                double salary = Double.parseDouble(salaryStr);
                records.add(new Employee(empId, name, department, salary));
            }
        }

        if (records.isEmpty()) {
            throw new CsvParseException("CSV contains no valid employee data rows.", 1);
        }

        return records;
    }

    /**
     * Serializes employee list to CSV format written to the output stream.
     *
     * @param employees    employee records
     * @param outputStream target output stream
     * @throws IOException on write error
     */
    public static void writeCsv(List<Employee> employees, OutputStream outputStream) throws IOException {
        try (PrintWriter writer = new PrintWriter(new BufferedWriter(
                new OutputStreamWriter(outputStream, StandardCharsets.UTF_8)))) {
            writer.println(EXPECTED_HEADER);
            if (employees != null) {
                for (Employee emp : employees) {
                    // Sanitize commas in text if any
                    String safeName = emp.getName().replace("\"", "\"\"");
                    if (safeName.contains(",")) {
                        safeName = "\"" + safeName + "\"";
                    }
                    String safeDept = emp.getDepartment().replace("\"", "\"\"");
                    if (safeDept.contains(",")) {
                        safeDept = "\"" + safeDept + "\"";
                    }
                    // Format salary: print clean integers without decimal trailing zeroes if whole
                    String salaryStr = (emp.getSalary() == Math.floor(emp.getSalary()))
                            ? String.format("%.0f", emp.getSalary())
                            : String.format("%.2f", emp.getSalary());

                    writer.println(emp.getEmployeeId() + "," + safeName + "," + safeDept + "," + salaryStr);
                }
            }
            writer.flush();
        }
    }
}
