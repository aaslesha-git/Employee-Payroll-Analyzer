package com.payroll.servlet;

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

/**
 * Controller servlet for Employee Management (CRUD, Sorting, Display).
 * Dispatches to employees.jsp.
 */
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

        // Handle edit prepopulation
        if ("edit".equalsIgnoreCase(action)) {
            String idStr = request.getParameter("id");
            if (idStr != null) {
                try {
                    int id = Integer.parseInt(idStr);
                    Optional<Employee> empOpt = service.findById(id);
                    empOpt.ifPresent(employee -> request.setAttribute("editEmployee", employee));
                } catch (NumberFormatException ignored) {
                }
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
            handleDelete(request, response, service);
        } else if ("edit".equalsIgnoreCase(action) || "update".equalsIgnoreCase(action)) {
            handleUpdate(request, response, service);
        } else {
            handleAdd(request, response, service);
        }
    }

    private void handleAdd(HttpServletRequest request, HttpServletResponse response, EmployeeService service)
            throws ServletException, IOException {
        String idStr = request.getParameter("employeeId");
        String name = request.getParameter("name");
        String department = request.getParameter("department");
        String salaryStr = request.getParameter("salary");

        List<String> errors = ValidationUtil.validateEmployeeInputs(idStr, name, department, salaryStr);

        if (!errors.isEmpty()) {
            request.setAttribute("errorMessage", String.join("<br/>", errors));
            request.setAttribute("formId", idStr);
            request.setAttribute("formName", name);
            request.setAttribute("formDepartment", department);
            request.setAttribute("formSalary", salaryStr);
            doGet(request, response);
            return;
        }

        int empId = Integer.parseInt(idStr.trim());
        double salary = Double.parseDouble(salaryStr.trim());
        Employee newEmp = new Employee(empId, name.trim(), department.trim(), salary);

        try {
            service.addEmployee(newEmp);
            request.getSession().setAttribute("flashSuccess", "Employee '" + name.trim() + "' (ID: " + empId + ") added successfully.");
            response.sendRedirect(request.getContextPath() + "/employees");
        } catch (IllegalArgumentException e) {
            request.setAttribute("errorMessage", e.getMessage());
            request.setAttribute("formId", idStr);
            request.setAttribute("formName", name);
            request.setAttribute("formDepartment", department);
            request.setAttribute("formSalary", salaryStr);
            doGet(request, response);
        }
    }

    private void handleUpdate(HttpServletRequest request, HttpServletResponse response, EmployeeService service)
            throws ServletException, IOException {
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

        int empId = Integer.parseInt(idStr.trim());
        double salary = Double.parseDouble(salaryStr.trim());
        Employee updatedEmp = new Employee(empId, name.trim(), department.trim(), salary);

        boolean success = service.updateEmployee(updatedEmp);
        if (success) {
            request.getSession().setAttribute("flashSuccess", "Employee ID " + empId + " updated successfully.");
        } else {
            request.getSession().setAttribute("flashError", "Employee ID " + empId + " could not be found.");
        }
        response.sendRedirect(request.getContextPath() + "/employees");
    }

    private void handleDelete(HttpServletRequest request, HttpServletResponse response, EmployeeService service)
            throws IOException {
        String idStr = request.getParameter("employeeId");
        if (idStr != null) {
            try {
                int id = Integer.parseInt(idStr.trim());
                boolean deleted = service.deleteEmployee(id);
                if (deleted) {
                    request.getSession().setAttribute("flashSuccess", "Employee ID " + id + " deleted successfully.");
                } else {
                    request.getSession().setAttribute("flashError", "Employee ID " + id + " not found.");
                }
            } catch (NumberFormatException e) {
                request.getSession().setAttribute("flashError", "Invalid employee ID.");
            }
        }
        response.sendRedirect(request.getContextPath() + "/employees");
    }
}
