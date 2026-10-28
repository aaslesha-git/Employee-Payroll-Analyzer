package com.payroll.listener;

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

/**
 * Application Lifecycle Listener.
 * Initializes the shared EmployeeService upon application startup and stores it
 * in the ServletContext for cross-servlet access.
 * Automatically loads the initial 6 sample employees from employees.csv.
 */
@WebListener
public class AppContextListener implements ServletContextListener {

    private static final Logger LOGGER = Logger.getLogger(AppContextListener.class.getName());
    public static final String SERVICE_ATTRIBUTE = "employeeService";

    @Override
    public void contextInitialized(ServletContextEvent sce) {
        ServletContext context = sce.getServletContext();
        EmployeeService employeeService = new EmployeeService();

        LOGGER.info("Initializing Employee Payroll Analyzer context...");

        // Attempt loading employees.csv from classpath or /WEB-INF/
        InputStream csvStream = getClass().getClassLoader().getResourceAsStream("employees.csv");
        if (csvStream == null) {
            csvStream = context.getResourceAsStream("/WEB-INF/classes/employees.csv");
        }
        if (csvStream == null) {
            csvStream = context.getResourceAsStream("/employees.csv");
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
            LOGGER.info("employees.csv not found on resource path; seeding default 6 employees.");
            seedDefaultEmployees(employeeService);
        }

        context.setAttribute(SERVICE_ATTRIBUTE, employeeService);
        LOGGER.info("EmployeeService successfully bound to ServletContext attribute '" + SERVICE_ATTRIBUTE + "'.");
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
        ServletContext context = sce.getServletContext();
        context.removeAttribute(SERVICE_ATTRIBUTE);
        LOGGER.info("Employee Payroll Analyzer context destroyed.");
    }
}
