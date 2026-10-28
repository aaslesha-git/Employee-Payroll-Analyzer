package com.payroll.servlet;

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

/**
 * Controller servlet for the main Dashboard view.
 * Aggregates high-level metrics and forwards to dashboard.jsp.
 */
@WebServlet(name = "HomeServlet", urlPatterns = {"/dashboard", "/home", ""})
public class HomeServlet extends HttpServlet {

    private EmployeeService getService() {
        return (EmployeeService) getServletContext().getAttribute(AppContextListener.SERVICE_ATTRIBUTE);
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        EmployeeService service = getService();
        if (service == null) {
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "EmployeeService unavailable");
            return;
        }

        // Aggregate dashboard metrics calculated dynamically via Java 8 Streams
        int totalEmployees = service.getTotalEmployees();
        double totalPayroll = service.getTotalPayroll();
        double averageSalary = service.getAverageSalary();
        int departmentCount = service.getDepartmentCount();
        List<EmployeeService.DepartmentSummary> summaries = service.getDepartmentSummaries();
        List<Employee> recentEmployees = service.getRecentEmployees(5);

        // Bind attributes for JSP rendering
        request.setAttribute("totalEmployees", totalEmployees);
        request.setAttribute("totalPayroll", totalPayroll);
        request.setAttribute("averageSalary", averageSalary);
        request.setAttribute("departmentCount", departmentCount);
        request.setAttribute("departmentSummaries", summaries);
        request.setAttribute("recentEmployees", recentEmployees);
        request.setAttribute("activePage", "dashboard");

        request.getRequestDispatcher("/dashboard.jsp").forward(request, response);
    }
}
