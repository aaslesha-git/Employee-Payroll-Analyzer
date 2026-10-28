package com.payroll.servlet;

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

/**
 * Controller servlet for CSV Upload and batch import.
 * Enforces UTF-8 encoding, 1 MB maximum upload size, atomic validation,
 * and rolls back without modifying existing records if any row fails validation.
 */
@WebServlet(name = "UploadServlet", urlPatterns = {"/upload"})
@MultipartConfig(
        fileSizeThreshold = 1024 * 1024,      // 1MB
        maxFileSize = 1024 * 1024,            // 1MB max file size
        maxRequestSize = 2 * 1024 * 1024      // 2MB max request size
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

            // Check file size (1 MB limit)
            if (filePart.getSize() > 1024 * 1024) {
                request.setAttribute("errorMessage", "File size exceeds 1 MB limit (" + filePart.getSize() + " bytes).");
                doGet(request, response);
                return;
            }

            // Validate filename extension
            String submittedFileName = filePart.getSubmittedFileName();
            if (submittedFileName == null || !submittedFileName.toLowerCase().endsWith(".csv")) {
                request.setAttribute("errorMessage", "Invalid file type. Only .csv files are supported.");
                doGet(request, response);
                return;
            }

            // Atomic parsing: parseCsv throws CsvParseException on any corrupted record
            List<Employee> importedEmployees;
            try (InputStream is = filePart.getInputStream()) {
                importedEmployees = CsvUtil.parseCsv(is);
            }

            // Attempt batch import
            service.batchImport(importedEmployees, overwrite);

            request.getSession().setAttribute("flashSuccess",
                    "Successfully imported " + importedEmployees.size() + " employee records from '" + submittedFileName + "'.");
            response.sendRedirect(request.getContextPath() + "/employees");

        } catch (CsvUtil.CsvParseException e) {
            // Atomic reject: data is unmodified
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
}
