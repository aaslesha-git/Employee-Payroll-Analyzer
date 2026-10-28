package com.payroll.servlet;

import com.payroll.listener.AppContextListener;
import com.payroll.service.EmployeeService;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;

/**
 * Controller servlet for Salary Analytics.
 * Generates department breakdowns using Java 8 Streams (groupingBy, averagingDouble, counting, maxBy).
 */
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
}
