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

/**
 * Controller servlet for Search and Salary Range Filtering.
 * Supports searching by Employee ID, Name, or bounded salary ranges.
 */
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

        // Salary range filtering takes precedence if provided
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
}
