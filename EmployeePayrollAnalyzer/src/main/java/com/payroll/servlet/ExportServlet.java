package com.payroll.servlet;

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

/**
 * Controller servlet for CSV Export.
 * Generates an RFC-4180 compliant CSV stream containing all active employee records.
 */
@WebServlet(name = "ExportServlet", urlPatterns = {"/export"})
public class ExportServlet extends HttpServlet {

    private EmployeeService getService() {
        return (EmployeeService) getServletContext().getAttribute(AppContextListener.SERVICE_ATTRIBUTE);
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        EmployeeService service = getService();
        List<Employee> employees = service.getAllEmployees();

        // Configure CSV download headers
        response.setContentType("text/csv; charset=UTF-8");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Content-Disposition", "attachment; filename=\"employees.csv\"");
        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        response.setHeader("Pragma", "no-cache");
        response.setDateHeader("Expires", 0);

        CsvUtil.writeCsv(employees, response.getOutputStream());
    }
}
