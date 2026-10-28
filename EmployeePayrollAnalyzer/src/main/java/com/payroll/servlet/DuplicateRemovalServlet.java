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
import java.util.Map;

/**
 * Controller servlet for Duplicate Detection and Removal.
 * Identifies records sharing identical Employee IDs and provides transparent conflict reporting
 * rather than silently discarding valid employee information.
 */
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
}
