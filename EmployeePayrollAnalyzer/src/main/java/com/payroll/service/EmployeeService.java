package com.payroll.service;

import com.payroll.model.Employee;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Service managing employee payroll data in memory.
 * Employs Java Collections Framework (List, ArrayList, Set, Map) and Java 8 Stream API
 * (filter, map, reduce, distinct, sorted, Collectors.groupingBy, averagingDouble, counting, maxBy).
 * Thread-safe for concurrent servlet requests.
 */
public class EmployeeService {

    // In-memory master storage protected by synchronization
    private final List<Employee> employees = new ArrayList<>();

    public EmployeeService() {
    }

    /**
     * Adds an employee to the system.
     * Enforces uniqueness of employeeId.
     */
    public synchronized void addEmployee(Employee emp) throws IllegalArgumentException {
        if (emp == null) {
            throw new IllegalArgumentException("Employee cannot be null.");
        }
        boolean exists = employees.stream()
                .anyMatch(e -> e.getEmployeeId() == emp.getEmployeeId());
        if (exists) {
            throw new IllegalArgumentException("Employee with ID " + emp.getEmployeeId() + " already exists.");
        }
        employees.add(emp);
    }

    /**
     * Updates an existing employee.
     */
    public synchronized boolean updateEmployee(Employee updatedEmp) {
        if (updatedEmp == null) return false;
        for (int i = 0; i < employees.size(); i++) {
            if (employees.get(i).getEmployeeId() == updatedEmp.getEmployeeId()) {
                employees.set(i, updatedEmp);
                return true;
            }
        }
        return false;
    }

    /**
     * Deletes an employee by ID.
     */
    public synchronized boolean deleteEmployee(int employeeId) {
        return employees.removeIf(e -> e.getEmployeeId() == employeeId);
    }

    /**
     * Finds employee by ID using Stream API filter() and findFirst() returning Optional.
     */
    public synchronized Optional<Employee> findById(int employeeId) {
        return employees.stream()
                .filter(e -> e.getEmployeeId() == employeeId)
                .findFirst();
    }

    /**
     * Returns a copy of all employees.
     */
    public synchronized List<Employee> getAllEmployees() {
        return new ArrayList<>(employees);
    }

    /**
     * Returns total employee count.
     */
    public synchronized int getTotalEmployees() {
        return employees.size();
    }

    /**
     * Calculates total payroll expenditure using Stream map() and reduce().
     * Demonstrates: .map(Employee::getSalary).reduce(0.0, Double::sum)
     */
    public synchronized double getTotalPayroll() {
        return employees.stream()
                .map(Employee::getSalary)
                .reduce(0.0, Double::sum);
    }

    /**
     * Calculates average salary across all employees using Stream mapToDouble and average().
     */
    public synchronized double getAverageSalary() {
        return employees.stream()
                .mapToDouble(Employee::getSalary)
                .average()
                .orElse(0.0);
    }

    /**
     * Returns distinct sorted list of department names using map(), distinct(), sorted().
     */
    public synchronized List<String> getDistinctDepartments() {
        return employees.stream()
                .map(Employee::getDepartment)
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    /**
     * Returns the department count.
     */
    public synchronized int getDepartmentCount() {
        return getDistinctDepartments().size();
    }

    /**
     * Returns recent employees (limited to N most recent records).
     */
    public synchronized List<Employee> getRecentEmployees(int limit) {
        List<Employee> copy = new ArrayList<>(employees);
        Collections.reverse(copy);
        return copy.stream().limit(limit).collect(Collectors.toList());
    }

    /**
     * Searches employees by Employee ID or Name using Stream filter().
     */
    public synchronized List<Employee> searchEmployees(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllEmployees();
        }
        String q = query.trim().toLowerCase();
        return employees.stream()
                .filter(e -> String.valueOf(e.getEmployeeId()).contains(q) ||
                             e.getName().toLowerCase().contains(q))
                .collect(Collectors.toList());
    }

    /**
     * Filters employees whose salaries fall within [minSalary, maxSalary] using Stream filter() and sorted().
     */
    public synchronized List<Employee> filterBySalaryRange(double minSalary, double maxSalary) {
        return employees.stream()
                .filter(e -> e.getSalary() >= minSalary && e.getSalary() <= maxSalary)
                .sorted(Comparator.comparingDouble(Employee::getSalary))
                .collect(Collectors.toList());
    }

    /**
     * Sorts employees by name or salary using Stream sorted() with Comparator.
     */
    public synchronized List<Employee> getSortedEmployees(String field, boolean ascending) {
        Comparator<Employee> comparator;
        if ("salary".equalsIgnoreCase(field)) {
            comparator = Comparator.comparingDouble(Employee::getSalary);
        } else if ("id".equalsIgnoreCase(field)) {
            comparator = Comparator.comparingInt(Employee::getEmployeeId);
        } else if ("department".equalsIgnoreCase(field)) {
            comparator = Comparator.comparing(Employee::getDepartment, String.CASE_INSENSITIVE_ORDER);
        } else {
            comparator = Comparator.comparing(Employee::getName, String.CASE_INSENSITIVE_ORDER);
        }

        if (!ascending) {
            comparator = comparator.reversed();
        }

        return employees.stream()
                .sorted(comparator)
                .collect(Collectors.toList());
    }

    // ==========================================
    // Java 8 Stream Analytics
    // ==========================================

    /**
     * Counts employees by department using Collectors.groupingBy and Collectors.counting().
     */
    public synchronized Map<String, Long> countEmployeesByDepartment() {
        return employees.stream()
                .collect(Collectors.groupingBy(Employee::getDepartment, Collectors.counting()));
    }

    /**
     * Calculates average salary by department using Collectors.groupingBy and Collectors.averagingDouble().
     */
    public synchronized Map<String, Double> averageSalaryByDepartment() {
        return employees.stream()
                .collect(Collectors.groupingBy(Employee::getDepartment,
                        Collectors.averagingDouble(Employee::getSalary)));
    }

    /**
     * Calculates total salary expenditure by department using Collectors.groupingBy and Collectors.summingDouble().
     */
    public synchronized Map<String, Double> totalSalaryByDepartment() {
        return employees.stream()
                .collect(Collectors.groupingBy(Employee::getDepartment,
                        Collectors.summingDouble(Employee::getSalary)));
    }

    /**
     * Finds highest-paid employee per department using Collectors.groupingBy and Collectors.maxBy().
     */
    public synchronized Map<String, Optional<Employee>> highestPaidEmployeeByDepartment() {
        return employees.stream()
                .collect(Collectors.groupingBy(
                        Employee::getDepartment,
                        Collectors.maxBy(Comparator.comparingDouble(Employee::getSalary))
                ));
    }

    /**
     * Aggregated DTO summarizing department metrics for tabular display.
     */
    public static class DepartmentSummary {
        private final String department;
        private final long count;
        private final double totalSalary;
        private final double averageSalary;
        private final Employee highestPaidEmployee;

        public DepartmentSummary(String department, long count, double totalSalary, double averageSalary, Employee highestPaidEmployee) {
            this.department = department;
            this.count = count;
            this.totalSalary = totalSalary;
            this.averageSalary = averageSalary;
            this.highestPaidEmployee = highestPaidEmployee;
        }

        public String getDepartment() { return department; }
        public long getCount() { return count; }
        public double getTotalSalary() { return totalSalary; }
        public double getAverageSalary() { return averageSalary; }
        public Employee getHighestPaidEmployee() { return highestPaidEmployee; }
    }

    /**
     * Combines all department analytics into structured summary objects.
     */
    public synchronized List<DepartmentSummary> getDepartmentSummaries() {
        Map<String, Long> counts = countEmployeesByDepartment();
        Map<String, Double> averages = averageSalaryByDepartment();
        Map<String, Double> totals = totalSalaryByDepartment();
        Map<String, Optional<Employee>> highest = highestPaidEmployeeByDepartment();

        List<DepartmentSummary> summaries = new ArrayList<>();
        for (String dept : getDistinctDepartments()) {
            long count = counts.getOrDefault(dept, 0L);
            double total = totals.getOrDefault(dept, 0.0);
            double avg = averages.getOrDefault(dept, 0.0);
            Employee top = highest.getOrDefault(dept, Optional.empty()).orElse(null);
            summaries.add(new DepartmentSummary(dept, count, total, avg, top));
        }
        return summaries;
    }

    // ==========================================
    // Duplicate Detection & Removal
    // ==========================================

    /**
     * Detects all employee records that share duplicate employee IDs.
     */
    public synchronized Map<Integer, List<Employee>> detectDuplicateIds() {
        Map<Integer, List<Employee>> grouped = employees.stream()
                .collect(Collectors.groupingBy(Employee::getEmployeeId));

        Map<Integer, List<Employee>> duplicates = new LinkedHashMap<>();
        for (Map.Entry<Integer, List<Employee>> entry : grouped.entrySet()) {
            if (entry.getValue().size() > 1) {
                duplicates.put(entry.getKey(), entry.getValue());
            }
        }
        return duplicates;
    }

    /**
     * Removes duplicate employee records retaining the first occurrence per ID.
     * Uses Java Set and Java 8 filter() to deduplicate.
     *
     * @return count of removed duplicates
     */
    public synchronized int removeDuplicateRecords() {
        int initialSize = employees.size();
        Set<Integer> seenIds = new HashSet<>();
        List<Employee> uniqueList = employees.stream()
                .filter(e -> seenIds.add(e.getEmployeeId()))
                .collect(Collectors.toList());

        employees.clear();
        employees.addAll(uniqueList);
        return initialSize - uniqueList.size();
    }

    /**
     * Atomically imports new employee records.
     * If conflicts are encountered and overwrite is false, reports conflicting IDs.
     */
    public synchronized void batchImport(List<Employee> newEmployees, boolean overwriteExisting) {
        if (newEmployees == null || newEmployees.isEmpty()) {
            return;
        }

        if (overwriteExisting) {
            Map<Integer, Employee> map = new LinkedHashMap<>();
            // Retain existing
            for (Employee e : employees) {
                map.put(e.getEmployeeId(), e);
            }
            // Overwrite with imported
            for (Employee e : newEmployees) {
                map.put(e.getEmployeeId(), e);
            }
            employees.clear();
            employees.addAll(map.values());
        } else {
            // Check for conflicts first
            Set<Integer> existingIds = employees.stream()
                    .map(Employee::getEmployeeId)
                    .collect(Collectors.toSet());

            List<Integer> conflictingIds = newEmployees.stream()
                    .map(Employee::getEmployeeId)
                    .filter(existingIds::contains)
                    .collect(Collectors.toList());

            if (!conflictingIds.isEmpty()) {
                throw new IllegalArgumentException("Conflicting employee IDs detected: " + conflictingIds +
                        ". Enable overwrite or remove duplicate IDs.");
            }

            // Check for intra-batch duplicate IDs
            Set<Integer> batchIds = new HashSet<>();
            for (Employee e : newEmployees) {
                if (!batchIds.add(e.getEmployeeId())) {
                    throw new IllegalArgumentException("Import batch contains duplicate ID: " + e.getEmployeeId());
                }
            }

            employees.addAll(newEmployees);
        }
    }

    /**
     * Clears all employees (useful for testing and reset to initial state).
     */
    public synchronized void clear() {
        employees.clear();
    }
}
