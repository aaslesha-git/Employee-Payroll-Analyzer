# Employee Payroll Analyzer - College Project (Java 8 / Servlet / JSP / Tomcat 9)

An enterprise-grade Employee Payroll Analyzer built using pure Java 8, Java Servlets (`javax.servlet`), JavaServer Pages (JSP), Apache Tomcat 9, and Apache Maven. Demonstrates the Java Collections Framework, Java 8 Stream API, thread-safe ServletContext storage, atomic CSV file I/O, and MVC architectural principles.

---

## 1. Technologies Used

- **Programming Language**: Java 8 (OpenJDK 1.8 / Oracle JDK 8)
- **Web Technologies**: Java Servlets 4.0 (`javax.servlet-api:4.0.1`), JSP 2.3 (`javax.servlet.jsp-api:2.3.3`), JSTL 1.2
- **Web Server / Servlet Container**: Apache Tomcat 9.0.x
- **Build & Dependency Management**: Apache Maven 3.6+
- **Data Structures**: Java Collections Framework (`List`, `ArrayList`, `Set`, `HashSet`, `Map`, `HashMap`, `LinkedHashMap`)
- **Functional Programming**: Java 8 Stream API (`filter()`, `map()`, `reduce()`, `distinct()`, `sorted()`, `Collectors.groupingBy()`, `Collectors.averagingDouble()`, `Collectors.counting()`, `Collectors.maxBy()`, `Optional`)
- **I/O & Persistence**: Standard Java I/O (`BufferedReader`, `PrintWriter`, `InputStreamReader`, `StandardCharsets.UTF_8`)
- **Frontend**: Responsive HTML5, CSS3 (Executive Navy & Light Blue theme), JavaScript

---

## 2. Project Folder Structure

```text
EmployeePayrollAnalyzer/
├── pom.xml                               # Maven Build Configuration
├── README.md                             # Comprehensive Documentation & Setup Guide
├── employees.csv                         # Master initial sample dataset
└── src/
    └── main/
        ├── java/
        │   └── com/
        │       └── payroll/
        │           ├── model/
        │           │   └── Employee.java               # Serializable Employee POJO with equals/hashCode
        │           ├── service/
        │           │   └── EmployeeService.java        # Thread-safe in-memory store with Java 8 Streams
        │           ├── servlet/
        │           │   ├── HomeServlet.java            # Aggregates KPI stats for dashboard.jsp
        │           │   ├── EmployeeServlet.java        # CRUD operations, sorting, and validation
        │           │   ├── AnalyticsServlet.java       # Department metrics & highest-paid queries
        │           │   ├── SearchServlet.java          # Keyword search and salary range filter
        │           │   ├── UploadServlet.java          # Atomic UTF-8 CSV file upload (Max 1 MB)
        │           │   ├── ExportServlet.java          # Downloadable CSV generation
        │           │   └── DuplicateRemovalServlet.java# Conflict reporting and deduplication
        │           ├── listener/
        │           │   └── AppContextListener.java     # ServletContextListener: seeds data on startup
        │           └── util/
        │               ├── CsvUtil.java                # Java I/O CSV parser & writer
        │               └── ValidationUtil.java         # Server-side input validation rules
        ├── resources/
        │   └── employees.csv                           # Classpath resource packaged inside WAR
        └── webapp/
            ├── index.jsp                               # Entry redirect to /dashboard
            ├── dashboard.jsp                           # Executive KPI dashboard view
            ├── employees.jsp                           # Employee management table and CRUD forms
            ├── analytics.jsp                           # Deep salary analytics & Java 8 stream matrix
            ├── salary-filter.jsp                       # Search & Min/Max salary range filter
            ├── upload.jsp                              # File upload interface with atomic validation
            ├── duplicates.jsp                          # Duplicate record auditor and purge view
            ├── WEB-INF/
            │   └── web.xml                             # Servlet 4.0 deployment descriptor
            ├── css/
            │   └── style.css                           # Executive navy/light blue responsive theme
            └── js/
                └── app.js                              # Client-side validation and confirmation prompts
```

---

## 3. Java 8 Concepts & Code Implementations

| Concept | File | Exact Method / Usage |
| :--- | :--- | :--- |
| **`filter()`** | `EmployeeService.java` | `employees.stream().filter(e -> e.getSalary() >= min && e.getSalary() <= max)` |
| **`map()`** | `EmployeeService.java` | `employees.stream().map(Employee::getSalary).reduce(...)` |
| **`reduce()`** | `EmployeeService.java` | `employees.stream().map(Employee::getSalary).reduce(0.0, Double::sum)` |
| **`distinct()`** | `EmployeeService.java` | `employees.stream().map(Employee::getDepartment).distinct().sorted().collect(...)` |
| **`sorted()`** | `EmployeeService.java` | `employees.stream().sorted(Comparator.comparingDouble(Employee::getSalary))` |
| **`Collectors.groupingBy()`** | `EmployeeService.java` | `.collect(Collectors.groupingBy(Employee::getDepartment, ...))` |
| **`Collectors.averagingDouble()`** | `EmployeeService.java` | `.collect(Collectors.groupingBy(Employee::getDepartment, Collectors.averagingDouble(Employee::getSalary)))` |
| **`Collectors.counting()`** | `EmployeeService.java` | `.collect(Collectors.groupingBy(Employee::getDepartment, Collectors.counting()))` |
| **`Collectors.maxBy()`** | `EmployeeService.java` | `.collect(Collectors.groupingBy(Employee::getDepartment, Collectors.maxBy(Comparator.comparingDouble(Employee::getSalary))))` |
| **`Optional`** | `EmployeeService.java` | Returned by `findById(int id)` and `highestPaidEmployeeByDepartment()` |
| **`ServletContext`** | `AppContextListener.java` | Shared in-memory `EmployeeService` singleton initialized during servlet container startup |
| **Atomic CSV I/O** | `CsvUtil.java` | Line-by-line validation: any formatting or data error aborts whole batch without corrupting existing records |

---

## 4. Sample Dataset & Expected Verification Metrics

Initial records loaded from `employees.csv`:

```csv
employeeId,name,department,salary
101,Rahul,IT,50000
102,Priya,HR,40000
103,Amit,IT,60000
104,Sneha,Finance,45000
105,Kiran,HR,55000
106,Anjali,Finance,65000
```

### Verified Expected Results:
- **Total Employees**: `6`
- **Total Payroll Expenditure**: `$315,000`
- **Overall Average Salary**: `$52,500`
- **Total Departments**: `3`
- **IT Department**:
  - Employee count: `2`
  - Average salary: `$55,000`
  - Highest-paid employee: `Amit ($60,000)`
- **HR Department**:
  - Employee count: `2`
  - Average salary: `$47,500`
  - Highest-paid employee: `Kiran ($55,000)`
- **Finance Department**:
  - Employee count: `2`
  - Average salary: `$55,000`
  - Highest-paid employee: `Anjali ($65,000)`

---

## 5. Prerequisites

Before building and deploying, ensure the following are installed on your machine:

1. **Java Development Kit (JDK 8)**:
   ```bash
   java -version
   # Expected output: openjdk version "1.8.0_..." or "1.8..."
   javac -version
   ```
2. **Apache Maven 3.6+**:
   ```bash
   mvn -version
   ```
3. **Apache Tomcat 9**:
   - Download Tomcat 9.0.x from [tomcat.apache.org](https://tomcat.apache.org/download-90.cgi)
   - Ensure `CATALINA_HOME` environment variable points to the Tomcat installation directory.

---

## 6. How to Build Using Maven

1. Open a terminal or command prompt.
2. Navigate into the project root directory:
   ```bash
   cd EmployeePayrollAnalyzer
   ```
3. Clean and package the application into a `.war` file:
   ```bash
   mvn clean package
   ```
4. Maven will compile the Java classes under `target/classes` and create the deployable WAR file at:
   ```text
   target/EmployeePayrollAnalyzer.war
   ```

---

## 7. How to Deploy to Apache Tomcat 9

### Method A: Direct File Copy (Recommended)
1. Stop Tomcat if running:
   ```bash
   # Linux / macOS:
   $CATALINA_HOME/bin/shutdown.sh
   # Windows:
   %CATALINA_HOME%\bin\shutdown.bat
   ```
2. Copy the generated `EmployeePayrollAnalyzer.war` file to the Tomcat `webapps/` folder:
   ```bash
   # Linux / macOS:
   cp target/EmployeePayrollAnalyzer.war $CATALINA_HOME/webapps/
   # Windows:
   copy target\EmployeePayrollAnalyzer.war %CATALINA_HOME%\webapps\
   ```
3. Start Apache Tomcat:
   ```bash
   # Linux / macOS:
   $CATALINA_HOME/bin/startup.sh
   # Windows:
   %CATALINA_HOME%\bin\startup.bat
   ```
4. Tomcat will automatically unpack the WAR into a folder named `EmployeePayrollAnalyzer`.

### Method B: Tomcat Web Application Manager
1. Start Tomcat and navigate to `http://localhost:8080/manager/html`.
2. Scroll to **"WAR file to deploy"**.
3. Choose `target/EmployeePayrollAnalyzer.war` and click **Deploy**.

---

## 8. How to Run & Access the Application

Open any modern web browser and navigate to:
```text
http://localhost:8080/EmployeePayrollAnalyzer/
```
The application will automatically redirect to the executive dashboard (`/dashboard`).

---

## 9. Feature Usage Walkthrough

### 1. Dashboard (`/dashboard`)
- Displays real-time summary KPI cards (Total Employees, Total Payroll, Average Salary, Departments).
- Displays department breakdown summary table with average salary and top earners.
- Lists recent employees with one-click Edit buttons.

### 2. Employee Management (`/employees`)
- **Add Employee**: Fill the sidebar form (ID, Full Name, Department, Salary) and click **Add Employee**. Validates on client and server.
- **Edit Employee**: Click **Edit** beside any employee. Form enters edit mode with immutable ID and prepopulated fields.
- **Delete Employee**: Click **Delete** to trigger a JavaScript confirm modal. Removes record and adjusts metrics instantly.
- **Sort Roster**: Click **Name**, **Salary**, or **ID** column headers to toggle Ascending / Descending order using Java 8 `Comparator.comparing()`.

### 3. Search & Salary Filter (`/salary-filter`)
- **Keyword Search**: Type an ID or name fragment to search records using `filter()`.
- **Salary Range Filter**: Enter Minimum and Maximum salary (e.g., $45,000 to $60,000) to inspect compensation bands.
- **Empty State**: Displays clear feedback and a "Reset All Filters" button if no records match.

### 4. Salary Analytics (`/analytics`)
- Visualizes departmental headcounts, average compensation, total payroll expenditure, and percentage share.
- Highlights the highest-paid employee in each department using `Collectors.maxBy()`.

### 5. CSV File Upload (`/upload`)
- Choose any UTF-8 `.csv` file up to 1 MB.
- Format: `employeeId,name,department,salary`.
- Check "Overwrite duplicates" to update existing records, or leave unchecked for strict conflict prevention.
- If any line is invalid (e.g. non-numeric salary or missing field), the upload is rejected cleanly without corrupting existing records.

### 6. Duplicate Records Audit (`/duplicates`)
- Audits in-memory records using Java Collections and grouping by Employee ID.
- Displays transparent report of conflicting entries.
- Click **Purge Duplicates** to deduplicate cleanly, keeping the primary record per ID.

### 7. CSV Export (`/export`)
- Click **Export CSV** in any header or sidebar link.
- Automatically generates and downloads RFC-4180 compliant `employees.csv` with standard UTF-8 headers.

---

## 10. Common Errors & Troubleshooting

| Error Symptom | Cause | Solution |
| :--- | :--- | :--- |
| **`HTTP 404 Not Found`** | Context path mismatch or WAR not unpacked | Verify URL: `http://localhost:8080/EmployeePayrollAnalyzer/` (exact case matching the WAR name). Check `$CATALINA_HOME/logs/catalina.out`. |
| **`NoClassDefFoundError: javax/servlet/...`** | Tomcat 10+ installed instead of Tomcat 9 | Tomcat 10 uses `jakarta.servlet`. Tomcat 9 uses `javax.servlet`. Deploy only to **Apache Tomcat 9**. |
| **`java.lang.UnsupportedClassVersionError`** | Compiled with JDK 17+ but Tomcat 9 running on JRE 8 | Ensure Maven runs with Java 8 or `-source 1.8 -target 1.8` as configured in `pom.xml`. |
| **Port 8080 in use** | Another service occupies port 8080 | Change Tomcat port in `$CATALINA_HOME/conf/server.xml` to `8081` or terminate conflicting process. |
| **CSV upload failed with "Expected 4 columns"** | CSV delimiter or header mismatch | Ensure CSV columns are separated by commas and header reads: `employeeId,name,department,salary`. |

---

## 11. Viva Questions & Presentation Answers (For College Evaluators)

1. **Why use `javax.servlet` instead of `jakarta.servlet`?**
   - *Answer*: Apache Tomcat 9 implements Java EE 8 (Servlet 4.0 specification) which uses the `javax.servlet` namespace. Tomcat 10 switched to Jakarta EE 9 (`jakarta.servlet`).

2. **How is thread safety achieved in the singleton `EmployeeService`?**
   - *Answer*: Mutating methods (`addEmployee`, `updateEmployee`, `deleteEmployee`, `batchImport`, `removeDuplicateRecords`) and query reads are synchronized on the service instance, preventing race conditions during concurrent servlet HTTP requests.

3. **How does `AppContextListener` work?**
   - *Answer*: It implements `ServletContextListener`. When Tomcat boots the application, `contextInitialized()` runs once, instantiates `EmployeeService`, parses `employees.csv`, and binds the service to `ServletContext` so all servlets can retrieve it via `getServletContext().getAttribute("employeeService")`.

4. **How are department metrics computed using Java 8 Streams?**
   - *Answer*: We use `Collectors.groupingBy()` combined with downstream collectors:
     - Average: `Collectors.averagingDouble(Employee::getSalary)`
     - Headcount: `Collectors.counting()`
     - Top earner: `Collectors.maxBy(Comparator.comparingDouble(Employee::getSalary))`
     - Total expenditure: `employees.stream().map(Employee::getSalary).reduce(0.0, Double::sum)`
