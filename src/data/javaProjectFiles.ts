export interface ProjectFile {
  path: string;
  name: string;
  language: 'java' | 'xml' | 'jsp' | 'css' | 'javascript' | 'markdown' | 'csv';
  category: 'Model' | 'Service' | 'Servlet' | 'Listener' | 'Utility' | 'JSP View' | 'Config' | 'Documentation' | 'Data';
  description: string;
  streamConcepts?: string[];
  content: string;
}

export const JAVA_PROJECT_FILES: ProjectFile[] = [
  {
    path: 'pom.xml',
    name: 'pom.xml',
    language: 'xml',
    category: 'Config',
    description: 'Maven WAR project configuration targeting Java 8, javax.servlet-api 4.0.1, and Tomcat 9.',
    content: `<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.payroll</groupId>
    <artifactId>EmployeePayrollAnalyzer</artifactId>
    <version>1.0.0</version>
    <packaging>war</packaging>

    <name>Employee Payroll Analyzer</name>
    <description>College Project: Enterprise Payroll Analysis using Java 8, Servlets (javax.servlet), JSP, and Tomcat 9</description>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <maven.compiler.source>1.8</maven.compiler.source>
        <maven.compiler.target>1.8</maven.compiler.target>
        <failOnMissingWebXml>false</failOnMissingWebXml>
    </properties>

    <dependencies>
        <!-- Java Servlet API 4.0.1 (javax.servlet) for Apache Tomcat 9 -->
        <dependency>
            <groupId>javax.servlet</groupId>
            <artifactId>javax.servlet-api</artifactId>
            <version>4.0.1</version>
            <scope>provided</scope>
        </dependency>

        <!-- JavaServer Pages (JSP) API 2.3.3 for Apache Tomcat 9 -->
        <dependency>
            <groupId>javax.servlet.jsp</groupId>
            <artifactId>javax.servlet.jsp-api</artifactId>
            <version>2.3.3</version>
            <scope>provided</scope>
        </dependency>

        <!-- JavaServer Pages Standard Tag Library (JSTL) -->
        <dependency>
            <groupId>jstl</groupId>
            <artifactId>jstl</artifactId>
            <version>1.2</version>
        </dependency>

        <!-- JUnit 4 for unit testing Java 8 Stream calculations -->
        <dependency>
            <groupId>junit</groupId>
            <artifactId>junit</artifactId>
            <version>4.13.2</version>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <finalName>EmployeePayrollAnalyzer</finalName>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.8.1</version>
                <configuration>
                    <source>1.8</source>
                    <target>1.8</target>
                    <encoding>UTF-8</encoding>
                </configuration>
            </plugin>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-war-plugin</artifactId>
                <version>3.3.2</version>
                <configuration>
                    <warName>EmployeePayrollAnalyzer</warName>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>`
  },
  {
    path: 'employees.csv',
    name: 'employees.csv',
    language: 'csv',
    category: 'Data',
    description: 'Initial 6 sample records loaded into memory on application startup.',
    content: `employeeId,name,department,salary
101,Rahul,IT,50000
102,Priya,HR,40000
103,Amit,IT,60000
104,Sneha,Finance,45000
105,Kiran,HR,55000
106,Anjali,Finance,65000`
  },
  {
    path: 'src/main/java/com/payroll/model/Employee.java',
    name: 'Employee.java',
    language: 'java',
    category: 'Model',
    description: 'Serializable Java POJO representing an Employee entity with ID-based equals/hashCode.',
    content: `package com.payroll.model;

import java.io.Serializable;
import java.util.Objects;

/**
 * Model representing an Employee in the Payroll Analyzer system.
 * Implements Serializable for Java EE / Tomcat session support.
 */
public class Employee implements Serializable {
    private static final long serialVersionUID = 1L;

    private int employeeId;
    private String name;
    private String department;
    private double salary;

    public Employee() {
    }

    public Employee(int employeeId, String name, String department, double salary) {
        this.employeeId = employeeId;
        this.name = name != null ? name.trim() : "";
        this.department = department != null ? department.trim() : "";
        this.salary = salary;
    }

    public int getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(int employeeId) {
        this.employeeId = employeeId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name != null ? name.trim() : "";
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department != null ? department.trim() : "";
    }

    public double getSalary() {
        return salary;
    }

    public void setSalary(double salary) {
        this.salary = salary;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Employee employee = (Employee) o;
        return employeeId == employee.employeeId;
    }

    @Override
    public int hashCode() {
        return Objects.hash(employeeId);
    }

    @Override
    public String toString() {
        return "Employee{" +
                "employeeId=" + employeeId +
                ", name='" + name + '\'' +
                ", department='" + department + '\'' +
                ", salary=" + salary +
                '}';
    }
}`
  },
  {
    path: 'src/main/java/com/payroll/service/EmployeeService.java',
    name: 'EmployeeService.java',
    language: 'java',
    category: 'Service',
    description: 'Thread-safe in-memory business service demonstrating all Java 8 Collections & Stream API queries.',
    streamConcepts: [
      'filter()',
      'map()',
      'reduce()',
      'distinct()',
      'sorted()',
      'Collectors.groupingBy()',
      'Collectors.averagingDouble()',
      'Collectors.counting()',
      'Collectors.maxBy()',
      'Optional'
    ],
    content: `package com.payroll.service;

import com.payroll.model.Employee;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
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

    private final List<Employee> employees = new ArrayList<>();

    public EmployeeService() {
    }

    public synchronized void addEmployee(Employee emp) throws IllegalArgumentException {
        if (emp == null) throw new IllegalArgumentException("Employee cannot be null.");
        boolean exists = employees.stream()
                .anyMatch(e -> e.getEmployeeId() == emp.getEmployeeId());
        if (exists) {
            throw new IllegalArgumentException("Employee with ID " + emp.getEmployeeId() + " already exists.");
        }
        employees.add(emp);
    }

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

    public synchronized boolean deleteEmployee(int employeeId) {
        return employees.removeIf(e -> e.getEmployeeId() == employeeId);
    }

    public synchronized Optional<Employee> findById(int employeeId) {
        return employees.stream()
                .filter(e -> e.getEmployeeId() == employeeId)
                .findFirst();
    }

    public synchronized List<Employee> getAllEmployees() {
        return new ArrayList<>(employees);
    }

    public synchronized int getTotalEmployees() {
        return employees.size();
    }

    // Java 8 Stream: map() and reduce() for total expenditure
    public synchronized double getTotalPayroll() {
        return employees.stream()
                .map(Employee::getSalary)
                .reduce(0.0, Double::sum);
    }

    // Java 8 Stream: mapToDouble() and average()
    public synchronized double getAverageSalary() {
        return employees.stream()
                .mapToDouble(Employee::getSalary)
                .average()
                .orElse(0.0);
    }

    // Java 8 Stream: map(), distinct(), and sorted()
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

    public synchronized int getDepartmentCount() {
        return getDistinctDepartments().size();
    }

    public synchronized List<Employee> getRecentEmployees(int limit) {
        List<Employee> copy = new ArrayList<>(employees);
        Collections.reverse(copy);
        return copy.stream().limit(limit).collect(Collectors.toList());
    }

    // Java 8 Stream: filter() by ID or Name substring
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

    // Java 8 Stream: filter() and sorted() by salary range
    public synchronized List<Employee> filterBySalaryRange(double minSalary, double maxSalary) {
        return employees.stream()
                .filter(e -> e.getSalary() >= minSalary && e.getSalary() <= maxSalary)
                .sorted(Comparator.comparingDouble(Employee::getSalary))
                .collect(Collectors.toList());
    }

    // Java 8 Stream: sorted() with custom dynamic Comparator
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

    // Java 8 Stream: Collectors.groupingBy() and Collectors.counting()
    public synchronized Map<String, Long> countEmployeesByDepartment() {
        return employees.stream()
                .collect(Collectors.groupingBy(Employee::getDepartment, Collectors.counting()));
    }

    // Java 8 Stream: Collectors.groupingBy() and Collectors.averagingDouble()
    public synchronized Map<String, Double> averageSalaryByDepartment() {
        return employees.stream()
                .collect(Collectors.groupingBy(Employee::getDepartment,
                        Collectors.averagingDouble(Employee::getSalary)));
    }

    // Java 8 Stream: Collectors.groupingBy() and Collectors.summingDouble()
    public synchronized Map<String, Double> totalSalaryByDepartment() {
        return employees.stream()
                .collect(Collectors.groupingBy(Employee::getDepartment,
                        Collectors.summingDouble(Employee::getSalary)));
    }

    // Java 8 Stream: Collectors.groupingBy() and Collectors.maxBy() returning Optional<Employee>
    public synchronized Map<String, Optional<Employee>> highestPaidEmployeeByDepartment() {
        return employees.stream()
                .collect(Collectors.groupingBy(
                        Employee::getDepartment,
                        Collectors.maxBy(Comparator.comparingDouble(Employee::getSalary))
                ));
    }

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

    public synchronized void batchImport(List<Employee> newEmployees, boolean overwriteExisting) {
        if (newEmployees == null || newEmployees.isEmpty()) return;

        if (overwriteExisting) {
            Map<Integer, Employee> map = new LinkedHashMap<>();
            for (Employee e : employees) map.put(e.getEmployeeId(), e);
            for (Employee e : newEmployees) map.put(e.getEmployeeId(), e);
            employees.clear();
            employees.addAll(map.values());
        } else {
            Set<Integer> existingIds = employees.stream()
                    .map(Employee::getEmployeeId)
                    .collect(Collectors.toSet());

            List<Integer> conflictingIds = newEmployees.stream()
                    .map(Employee::getEmployeeId)
                    .filter(existingIds::contains)
                    .collect(Collectors.toList());

            if (!conflictingIds.isEmpty()) {
                throw new IllegalArgumentException("Conflicting employee IDs detected: " + conflictingIds +
                        ". Enable overwrite or purge conflicting IDs.");
            }

            Set<Integer> batchIds = new HashSet<>();
            for (Employee e : newEmployees) {
                if (!batchIds.add(e.getEmployeeId())) {
                    throw new IllegalArgumentException("Import batch contains duplicate ID: " + e.getEmployeeId());
                }
            }

            employees.addAll(newEmployees);
        }
    }
}`
  },
  {
    path: 'src/main/java/com/payroll/listener/AppContextListener.java',
    name: 'AppContextListener.java',
    language: 'java',
    category: 'Listener',
    description: 'ServletContextListener initializing the shared EmployeeService singleton on Tomcat startup.',
    content: `package com.payroll.listener;

import com.payroll.model.Employee;
import com.payroll.service.EmployeeService;
import com.payroll.util.CsvUtil;

import javax.servlet.ServletContext;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.annotation.WebListener;
import java.io.InputStream;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

@WebListener
public class AppContextListener implements ServletContextListener {

    private static final Logger LOGGER = Logger.getLogger(AppContextListener.class.getName());
    public static final String SERVICE_ATTRIBUTE = "employeeService";

    @Override
    public void contextInitialized(ServletContextEvent sce) {
        ServletContext context = sce.getServletContext();
        EmployeeService employeeService = new EmployeeService();

        LOGGER.info("Initializing Employee Payroll Analyzer context...");

        InputStream csvStream = getClass().getClassLoader().getResourceAsStream("employees.csv");
        if (csvStream == null) {
            csvStream = context.getResourceAsStream("/WEB-INF/classes/employees.csv");
        }

        if (csvStream != null) {
            try {
                List<Employee> initialEmployees = CsvUtil.parseCsv(csvStream);
                employeeService.batchImport(initialEmployees, false);
                LOGGER.info("Loaded " + initialEmployees.size() + " sample employees from employees.csv.");
            } catch (Exception e) {
                LOGGER.log(Level.WARNING, "Failed to load employees.csv on startup; seeding default employees programmatically.", e);
                seedDefaultEmployees(employeeService);
            }
        } else {
            seedDefaultEmployees(employeeService);
        }

        context.setAttribute(SERVICE_ATTRIBUTE, employeeService);
    }

    private void seedDefaultEmployees(EmployeeService service) {
        service.addEmployee(new Employee(101, "Rahul", "IT", 50000));
        service.addEmployee(new Employee(102, "Priya", "HR", 40000));
        service.addEmployee(new Employee(103, "Amit", "IT", 60000));
        service.addEmployee(new Employee(104, "Sneha", "Finance", 45000));
        service.addEmployee(new Employee(105, "Kiran", "HR", 55000));
        service.addEmployee(new Employee(106, "Anjali", "Finance", 65000));
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        sce.getServletContext().removeAttribute(SERVICE_ATTRIBUTE);
    }
}`
  },
  {
    path: 'src/main/java/com/payroll/servlet/HomeServlet.java',
    name: 'HomeServlet.java',
    language: 'java',
    category: 'Servlet',
    description: 'Controller servlet computing dashboard totals and forwarding to dashboard.jsp.',
    content: `package com.payroll.servlet;

import com.payroll.listener.AppContextListener;
import com.payroll.model.Employee;
import com.payroll.service.EmployeeService;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;

@WebServlet(name = "HomeServlet", urlPatterns = {"/dashboard", "/home", ""})
public class HomeServlet extends HttpServlet {

    private EmployeeService getService() {
        return (EmployeeService) getServletContext().getAttribute(AppContextListener.SERVICE_ATTRIBUTE);
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        EmployeeService service = getService();

        int totalEmployees = service.getTotalEmployees();
        double totalPayroll = service.getTotalPayroll();
        double averageSalary = service.getAverageSalary();
        int departmentCount = service.getDepartmentCount();
        List<EmployeeService.DepartmentSummary> summaries = service.getDepartmentSummaries();
        List<Employee> recentEmployees = service.getRecentEmployees(5);

        request.setAttribute("totalEmployees", totalEmployees);
        request.setAttribute("totalPayroll", totalPayroll);
        request.setAttribute("averageSalary", averageSalary);
        request.setAttribute("departmentCount", departmentCount);
        request.setAttribute("departmentSummaries", summaries);
        request.setAttribute("recentEmployees", recentEmployees);
        request.setAttribute("activePage", "dashboard");

        request.getRequestDispatcher("/dashboard.jsp").forward(request, response);
    }
}`
  },
  {
    path: 'src/main/java/com/payroll/servlet/EmployeeServlet.java',
    name: 'EmployeeServlet.java',
    language: 'java',
    category: 'Servlet',
    description: 'Handles employee roster rendering, sorting, server-side validation, and CRUD operations.',
    content: `package com.payroll.servlet;

import com.payroll.listener.AppContextListener;
import com.payroll.model.Employee;
import com.payroll.service.EmployeeService;
import com.payroll.util.ValidationUtil;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import java.util.Optional;

@WebServlet(name = "EmployeeServlet", urlPatterns = {"/employees"})
public class EmployeeServlet extends HttpServlet {

    private EmployeeService getService() {
        return (EmployeeService) getServletContext().getAttribute(AppContextListener.SERVICE_ATTRIBUTE);
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        EmployeeService service = getService();
        String action = request.getParameter("action");
        String sortBy = request.getParameter("sortBy");
        String order = request.getParameter("order");

        boolean ascending = !"desc".equalsIgnoreCase(order);

        List<Employee> employeeList;
        if (sortBy != null && !sortBy.trim().isEmpty()) {
            employeeList = service.getSortedEmployees(sortBy, ascending);
        } else {
            employeeList = service.getAllEmployees();
        }

        if ("edit".equalsIgnoreCase(action)) {
            String idStr = request.getParameter("id");
            if (idStr != null) {
                try {
                    int id = Integer.parseInt(idStr);
                    Optional<Employee> empOpt = service.findById(id);
                    empOpt.ifPresent(employee -> request.setAttribute("editEmployee", employee));
                } catch (NumberFormatException ignored) {}
            }
        }

        request.setAttribute("employees", employeeList);
        request.setAttribute("totalEmployees", service.getTotalEmployees());
        request.setAttribute("distinctDepartments", service.getDistinctDepartments());
        request.setAttribute("sortBy", sortBy != null ? sortBy : "none");
        request.setAttribute("order", ascending ? "asc" : "desc");
        request.setAttribute("activePage", "employees");

        request.getRequestDispatcher("/employees.jsp").forward(request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        EmployeeService service = getService();
        String action = request.getParameter("action");

        if ("delete".equalsIgnoreCase(action)) {
            String idStr = request.getParameter("employeeId");
            int id = Integer.parseInt(idStr.trim());
            service.deleteEmployee(id);
            request.getSession().setAttribute("flashSuccess", "Employee #" + id + " deleted successfully.");
            response.sendRedirect(request.getContextPath() + "/employees");
        } else if ("update".equalsIgnoreCase(action)) {
            String idStr = request.getParameter("employeeId");
            String name = request.getParameter("name");
            String department = request.getParameter("department");
            String salaryStr = request.getParameter("salary");

            List<String> errors = ValidationUtil.validateEmployeeInputs(idStr, name, department, salaryStr);
            if (!errors.isEmpty()) {
                request.setAttribute("errorMessage", String.join("<br/>", errors));
                doGet(request, response);
                return;
            }

            Employee updatedEmp = new Employee(Integer.parseInt(idStr), name, department, Double.parseDouble(salaryStr));
            service.updateEmployee(updatedEmp);
            request.getSession().setAttribute("flashSuccess", "Employee #" + idStr + " updated successfully.");
            response.sendRedirect(request.getContextPath() + "/employees");
        } else {
            String idStr = request.getParameter("employeeId");
            String name = request.getParameter("name");
            String department = request.getParameter("department");
            String salaryStr = request.getParameter("salary");

            List<String> errors = ValidationUtil.validateEmployeeInputs(idStr, name, department, salaryStr);
            if (!errors.isEmpty()) {
                request.setAttribute("errorMessage", String.join("<br/>", errors));
                doGet(request, response);
                return;
            }

            Employee newEmp = new Employee(Integer.parseInt(idStr), name, department, Double.parseDouble(salaryStr));
            try {
                service.addEmployee(newEmp);
                request.getSession().setAttribute("flashSuccess", "Employee '" + name + "' added successfully.");
                response.sendRedirect(request.getContextPath() + "/employees");
            } catch (IllegalArgumentException e) {
                request.setAttribute("errorMessage", e.getMessage());
                doGet(request, response);
            }
        }
    }
}`
  },
  {
    path: 'src/main/java/com/payroll/servlet/AnalyticsServlet.java',
    name: 'AnalyticsServlet.java',
    language: 'java',
    category: 'Servlet',
    description: 'Computes deep department analytics matrix and passes DTOs to analytics.jsp.',
    content: `package com.payroll.servlet;

import com.payroll.listener.AppContextListener;
import com.payroll.service.EmployeeService;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;

@WebServlet(name = "AnalyticsServlet", urlPatterns = {"/analytics"})
public class AnalyticsServlet extends HttpServlet {

    private EmployeeService getService() {
        return (EmployeeService) getServletContext().getAttribute(AppContextListener.SERVICE_ATTRIBUTE);
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        EmployeeService service = getService();

        int totalEmployees = service.getTotalEmployees();
        double totalPayroll = service.getTotalPayroll();
        double overallAverage = service.getAverageSalary();
        List<EmployeeService.DepartmentSummary> summaries = service.getDepartmentSummaries();

        request.setAttribute("totalEmployees", totalEmployees);
        request.setAttribute("totalPayroll", totalPayroll);
        request.setAttribute("overallAverage", overallAverage);
        request.setAttribute("departmentSummaries", summaries);
        request.setAttribute("departmentCount", summaries.size());
        request.setAttribute("activePage", "analytics");

        request.getRequestDispatcher("/analytics.jsp").forward(request, response);
    }
}`
  },
  {
    path: 'src/main/java/com/payroll/servlet/SearchServlet.java',
    name: 'SearchServlet.java',
    language: 'java',
    category: 'Servlet',
    description: 'Handles search queries and salary range boundary filtering using Stream filter().',
    content: `package com.payroll.servlet;

import com.payroll.listener.AppContextListener;
import com.payroll.model.Employee;
import com.payroll.service.EmployeeService;
import com.payroll.util.ValidationUtil;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;

@WebServlet(name = "SearchServlet", urlPatterns = {"/search", "/salary-filter"})
public class SearchServlet extends HttpServlet {

    private EmployeeService getService() {
        return (EmployeeService) getServletContext().getAttribute(AppContextListener.SERVICE_ATTRIBUTE);
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        EmployeeService service = getService();
        String query = request.getParameter("q");
        String minSalaryStr = request.getParameter("minSalary");
        String maxSalaryStr = request.getParameter("maxSalary");

        List<Employee> results;
        boolean hasFilterApplied = false;

        if ((minSalaryStr != null && !minSalaryStr.trim().isEmpty()) ||
            (maxSalaryStr != null && !maxSalaryStr.trim().isEmpty())) {
            hasFilterApplied = true;
            List<String> rangeErrors = ValidationUtil.validateSalaryRange(minSalaryStr, maxSalaryStr);
            if (!rangeErrors.isEmpty()) {
                request.setAttribute("errorMessage", String.join("<br/>", rangeErrors));
                results = service.getAllEmployees();
            } else {
                double min = (minSalaryStr != null && !minSalaryStr.trim().isEmpty())
                        ? Double.parseDouble(minSalaryStr.trim()) : 0.0;
                double max = (maxSalaryStr != null && !maxSalaryStr.trim().isEmpty())
                        ? Double.parseDouble(maxSalaryStr.trim()) : Double.MAX_VALUE;
                results = service.filterBySalaryRange(min, max);
            }
        } else if (query != null && !query.trim().isEmpty()) {
            hasFilterApplied = true;
            results = service.searchEmployees(query.trim());
        } else {
            results = service.getAllEmployees();
        }

        request.setAttribute("employees", results);
        request.setAttribute("searchQuery", query != null ? query.trim() : "");
        request.setAttribute("minSalary", minSalaryStr != null ? minSalaryStr.trim() : "");
        request.setAttribute("maxSalary", maxSalaryStr != null ? maxSalaryStr.trim() : "");
        request.setAttribute("hasFilterApplied", hasFilterApplied);
        request.setAttribute("activePage", "search");

        request.getRequestDispatcher("/salary-filter.jsp").forward(request, response);
    }
}`
  },
  {
    path: 'src/main/java/com/payroll/servlet/UploadServlet.java',
    name: 'UploadServlet.java',
    language: 'java',
    category: 'Servlet',
    description: 'Enforces UTF-8, 1 MB maximum upload, and atomic record validation without partial modifications.',
    content: `package com.payroll.servlet;

import com.payroll.listener.AppContextListener;
import com.payroll.model.Employee;
import com.payroll.service.EmployeeService;
import com.payroll.util.CsvUtil;

import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.Part;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;

@WebServlet(name = "UploadServlet", urlPatterns = {"/upload"})
@MultipartConfig(
        fileSizeThreshold = 1024 * 1024,
        maxFileSize = 1024 * 1024,
        maxRequestSize = 2 * 1024 * 1024
)
public class UploadServlet extends HttpServlet {

    private EmployeeService getService() {
        return (EmployeeService) getServletContext().getAttribute(AppContextListener.SERVICE_ATTRIBUTE);
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        request.setAttribute("activePage", "upload");
        request.getRequestDispatcher("/upload.jsp").forward(request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        EmployeeService service = getService();
        boolean overwrite = "true".equalsIgnoreCase(request.getParameter("overwrite"));

        try {
            Part filePart = request.getPart("csvFile");
            if (filePart == null || filePart.getSize() == 0) {
                request.setAttribute("errorMessage", "Please select a valid CSV file to upload.");
                doGet(request, response);
                return;
            }

            if (filePart.getSize() > 1024 * 1024) {
                request.setAttribute("errorMessage", "File size exceeds 1 MB limit.");
                doGet(request, response);
                return;
            }

            String submittedFileName = filePart.getSubmittedFileName();
            if (submittedFileName == null || !submittedFileName.toLowerCase().endsWith(".csv")) {
                request.setAttribute("errorMessage", "Invalid file type. Only .csv files are supported.");
                doGet(request, response);
                return;
            }

            List<Employee> importedEmployees;
            try (InputStream is = filePart.getInputStream()) {
                importedEmployees = CsvUtil.parseCsv(is);
            }

            service.batchImport(importedEmployees, overwrite);

            request.getSession().setAttribute("flashSuccess",
                    "Successfully imported " + importedEmployees.size() + " employee records from '" + submittedFileName + "'.");
            response.sendRedirect(request.getContextPath() + "/employees");

        } catch (CsvUtil.CsvParseException e) {
            request.setAttribute("errorMessage", "CSV Validation Failed: " + e.getMessage() + ". No records were imported.");
            doGet(request, response);
        } catch (IllegalArgumentException e) {
            request.setAttribute("errorMessage", "Import Conflict: " + e.getMessage());
            doGet(request, response);
        } catch (Exception e) {
            request.setAttribute("errorMessage", "Upload Failed: " + e.getMessage());
            doGet(request, response);
        }
    }
}`
  },
  {
    path: 'src/main/java/com/payroll/servlet/ExportServlet.java',
    name: 'ExportServlet.java',
    language: 'java',
    category: 'Servlet',
    description: 'Streams current active employee records as a downloadable UTF-8 CSV file.',
    content: `package com.payroll.servlet;

import com.payroll.listener.AppContextListener;
import com.payroll.model.Employee;
import com.payroll.service.EmployeeService;
import com.payroll.util.CsvUtil;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;

@WebServlet(name = "ExportServlet", urlPatterns = {"/export"})
public class ExportServlet extends HttpServlet {

    private EmployeeService getService() {
        return (EmployeeService) getServletContext().getAttribute(AppContextListener.SERVICE_ATTRIBUTE);
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        EmployeeService service = getService();
        List<Employee> employees = service.getAllEmployees();

        response.setContentType("text/csv; charset=UTF-8");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Content-Disposition", "attachment; filename=\\"employees.csv\\"");
        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

        CsvUtil.writeCsv(employees, response.getOutputStream());
    }
}`
  },
  {
    path: 'src/main/java/com/payroll/servlet/DuplicateRemovalServlet.java',
    name: 'DuplicateRemovalServlet.java',
    language: 'java',
    category: 'Servlet',
    description: 'Audits conflicting records and removes duplicates without silent data discarding.',
    content: `package com.payroll.servlet;

import com.payroll.listener.AppContextListener;
import com.payroll.model.Employee;
import com.payroll.service.EmployeeService;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import java.util.Map;

@WebServlet(name = "DuplicateRemovalServlet", urlPatterns = {"/duplicates"})
public class DuplicateRemovalServlet extends HttpServlet {

    private EmployeeService getService() {
        return (EmployeeService) getServletContext().getAttribute(AppContextListener.SERVICE_ATTRIBUTE);
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        EmployeeService service = getService();
        Map<Integer, List<Employee>> duplicates = service.detectDuplicateIds();

        request.setAttribute("duplicateMap", duplicates);
        request.setAttribute("hasDuplicates", !duplicates.isEmpty());
        request.setAttribute("totalEmployees", service.getTotalEmployees());
        request.setAttribute("activePage", "duplicates");

        request.getRequestDispatcher("/duplicates.jsp").forward(request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        EmployeeService service = getService();
        int removedCount = service.removeDuplicateRecords();

        if (removedCount > 0) {
            request.getSession().setAttribute("flashSuccess",
                    "Duplicate removal complete: " + removedCount + " redundant record(s) purged successfully.");
        } else {
            request.getSession().setAttribute("flashSuccess", "No duplicate employee records detected. Data is clean.");
        }

        response.sendRedirect(request.getContextPath() + "/duplicates");
    }
}`
  },
  {
    path: 'src/main/java/com/payroll/util/CsvUtil.java',
    name: 'CsvUtil.java',
    language: 'java',
    category: 'Utility',
    description: 'Java I/O CSV parser & writer using BufferedReader, PrintWriter, and UTF-8 charset.',
    content: `package com.payroll.util;

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

public class CsvUtil {

    public static final String EXPECTED_HEADER = "employeeId,name,department,salary";

    public static class CsvParseException extends Exception {
        private final int lineNumber;
        public CsvParseException(String message, int lineNumber) {
            super("Line " + lineNumber + ": " + message);
            this.lineNumber = lineNumber;
        }
        public int getLineNumber() { return lineNumber; }
    }

    public static List<Employee> parseCsv(InputStream inputStream) throws IOException, CsvParseException {
        List<Employee> records = new ArrayList<>();
        if (inputStream == null) throw new CsvParseException("Input stream is null or empty.", 0);

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {
            String headerLine = reader.readLine();
            if (headerLine == null) throw new CsvParseException("CSV file is empty.", 1);
            if (headerLine.startsWith("\\uFEFF")) headerLine = headerLine.substring(1);

            String normalizedHeader = headerLine.replaceAll("\\\\s+", "").toLowerCase();
            if (!normalizedHeader.equals(EXPECTED_HEADER.toLowerCase())) {
                throw new CsvParseException("Invalid CSV header. Expected '" + EXPECTED_HEADER + "'.", 1);
            }

            String line;
            int lineNumber = 1;
            while ((line = reader.readLine()) != null) {
                lineNumber++;
                if (line.trim().isEmpty()) continue;

                String[] parts = line.split(",", -1);
                if (parts.length != 4) {
                    throw new CsvParseException("Expected 4 columns, found " + parts.length + ".", lineNumber);
                }

                String idStr = parts[0].trim();
                String name = parts[1].trim();
                String department = parts[2].trim();
                String salaryStr = parts[3].trim();

                List<String> errors = ValidationUtil.validateEmployeeInputs(idStr, name, department, salaryStr);
                if (!errors.isEmpty()) {
                    throw new CsvParseException(String.join("; ", errors), lineNumber);
                }

                records.add(new Employee(Integer.parseInt(idStr), name, department, Double.parseDouble(salaryStr)));
            }
        }
        return records;
    }

    public static void writeCsv(List<Employee> employees, OutputStream outputStream) throws IOException {
        try (PrintWriter writer = new PrintWriter(new BufferedWriter(
                new OutputStreamWriter(outputStream, StandardCharsets.UTF_8)))) {
            writer.println(EXPECTED_HEADER);
            if (employees != null) {
                for (Employee emp : employees) {
                    String salaryStr = (emp.getSalary() == Math.floor(emp.getSalary()))
                            ? String.format("%.0f", emp.getSalary())
                            : String.format("%.2f", emp.getSalary());
                    writer.println(emp.getEmployeeId() + "," + emp.getName() + "," + emp.getDepartment() + "," + salaryStr);
                }
            }
            writer.flush();
        }
    }
}`
  },
  {
    path: 'src/main/java/com/payroll/util/ValidationUtil.java',
    name: 'ValidationUtil.java',
    language: 'java',
    category: 'Utility',
    description: 'Server-side data validation rules protecting all model fields and boundary inputs.',
    content: `package com.payroll.util;

import java.util.ArrayList;
import java.util.List;

public class ValidationUtil {

    public static List<String> validateEmployeeInputs(String idStr, String name, String department, String salaryStr) {
        List<String> errors = new ArrayList<>();

        if (idStr == null || idStr.trim().isEmpty()) {
            errors.add("Employee ID is required.");
        } else {
            try {
                int id = Integer.parseInt(idStr.trim());
                if (id <= 0) errors.add("Employee ID must be a positive integer.");
            } catch (NumberFormatException e) {
                errors.add("Employee ID must be a valid integer number.");
            }
        }

        if (name == null || name.trim().isEmpty()) {
            errors.add("Full Name is required.");
        } else {
            String trimmedName = name.trim();
            if (trimmedName.length() < 2 || trimmedName.length() > 100) {
                errors.add("Name must be between 2 and 100 characters.");
            }
        }

        if (department == null || department.trim().isEmpty()) {
            errors.add("Department is required.");
        }

        if (salaryStr == null || salaryStr.trim().isEmpty()) {
            errors.add("Salary is required.");
        } else {
            try {
                double salary = Double.parseDouble(salaryStr.trim());
                if (salary <= 0) errors.add("Salary must be greater than zero.");
            } catch (NumberFormatException e) {
                errors.add("Salary must be a valid numerical value.");
            }
        }

        return errors;
    }

    public static List<String> validateSalaryRange(String minStr, String maxStr) {
        List<String> errors = new ArrayList<>();
        double min = 0;
        double max = Double.MAX_VALUE;

        if (minStr != null && !minStr.trim().isEmpty()) {
            try {
                min = Double.parseDouble(minStr.trim());
                if (min < 0) errors.add("Minimum salary cannot be negative.");
            } catch (NumberFormatException e) {
                errors.add("Minimum salary must be a valid number.");
            }
        }

        if (maxStr != null && !maxStr.trim().isEmpty()) {
            try {
                max = Double.parseDouble(maxStr.trim());
                if (max < 0) errors.add("Maximum salary cannot be negative.");
            } catch (NumberFormatException e) {
                errors.add("Maximum salary must be a valid number.");
            }
        }

        if (errors.isEmpty() && min > max) {
            errors.add("Minimum salary cannot exceed maximum salary.");
        }

        return errors;
    }
}`
  },
  {
    path: 'src/main/webapp/WEB-INF/web.xml',
    name: 'web.xml',
    language: 'xml',
    category: 'Config',
    description: 'Tomcat 9 Servlet 4.0 Deployment Descriptor mapping welcome files and session timeouts.',
    content: `<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns="http://xmlns.jcp.org/xml/ns/javaee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/javaee
                             http://xmlns.jcp.org/xml/ns/javaee/web-app_4_0.xsd"
         version="4.0">

    <display-name>Employee Payroll Analyzer</display-name>
    <description>Enterprise payroll analytics and employee management system running on Apache Tomcat 9</description>

    <welcome-file-list>
        <welcome-file>index.jsp</welcome-file>
    </welcome-file-list>

    <session-config>
        <session-timeout>30</session-timeout>
        <tracking-mode>COOKIE</tracking-mode>
    </session-config>
</web-app>`
  },
  {
    path: 'src/main/webapp/dashboard.jsp',
    name: 'dashboard.jsp',
    language: 'jsp',
    category: 'JSP View',
    description: 'Executive KPI dashboard rendering real-time metrics, department summaries, and recent employees.',
    content: `<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Dashboard - Employee Payroll Analyzer</title>
    <link rel="stylesheet" href="\${pageContext.request.contextPath}/css/style.css">
</head>
<body>
...
</body>
</html>`
  },
  {
    path: 'src/main/webapp/employees.jsp',
    name: 'employees.jsp',
    language: 'jsp',
    category: 'JSP View',
    description: 'Employee Roster with sorting controls (Name/Salary/ID), Add/Edit form, and delete actions.',
    content: `<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Employee Management - Employee Payroll Analyzer</title>
    <link rel="stylesheet" href="\${pageContext.request.contextPath}/css/style.css">
</head>
<body>
...
</body>
</html>`
  },
  {
    path: 'src/main/webapp/analytics.jsp',
    name: 'analytics.jsp',
    language: 'jsp',
    category: 'JSP View',
    description: 'Departmental salary breakdown matrix highlighting average salary, headcount, and top earners.',
    content: `<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Salary Analytics - Employee Payroll Analyzer</title>
    <link rel="stylesheet" href="\${pageContext.request.contextPath}/css/style.css">
</head>
<body>
...
</body>
</html>`
  },
  {
    path: 'src/main/webapp/salary-filter.jsp',
    name: 'salary-filter.jsp',
    language: 'jsp',
    category: 'JSP View',
    description: 'Search & Salary Range Filter with minimum/maximum boundaries and zero-result handling.',
    content: `<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Search & Salary Filter - Employee Payroll Analyzer</title>
    <link rel="stylesheet" href="\${pageContext.request.contextPath}/css/style.css">
</head>
<body>
...
</body>
</html>`
  },
  {
    path: 'src/main/webapp/upload.jsp',
    name: 'upload.jsp',
    language: 'jsp',
    category: 'JSP View',
    description: '1 MB UTF-8 CSV upload interface with transactional validation and overwrite options.',
    content: `<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>CSV Upload - Employee Payroll Analyzer</title>
    <link rel="stylesheet" href="\${pageContext.request.contextPath}/css/style.css">
</head>
<body>
...
</body>
</html>`
  },
  {
    path: 'src/main/webapp/duplicates.jsp',
    name: 'duplicates.jsp',
    language: 'jsp',
    category: 'JSP View',
    description: 'Audits conflicting records and removes duplicates without silent data loss.',
    content: `<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Duplicate Check - Employee Payroll Analyzer</title>
    <link rel="stylesheet" href="\${pageContext.request.contextPath}/css/style.css">
</head>
<body>
...
</body>
</html>`
  },
  {
    path: 'src/main/webapp/css/style.css',
    name: 'style.css',
    language: 'css',
    category: 'JSP View',
    description: 'Professional Navy Blue, Slate, and Light Blue responsive styles for the JSP frontend.',
    content: `/* Executive Navy & Light Blue Styling for Apache Tomcat 9 JSP Views */`
  },
  {
    path: 'src/main/webapp/js/app.js',
    name: 'app.js',
    language: 'javascript',
    category: 'JSP View',
    description: 'Client-side confirmation dialogs and form validation for JSP pages.',
    content: `/* Client-side form validation and confirm dialogs */`
  },
  {
    path: 'README.md',
    name: 'README.md',
    language: 'markdown',
    category: 'Documentation',
    description: 'Project setup, Tomcat 9 WAR deployment commands, Java 8 Stream concept guide, and viva Q&A.',
    content: `# Employee Payroll Analyzer - College Project (Java 8 / Servlet / JSP / Tomcat 9)`
  }
];
