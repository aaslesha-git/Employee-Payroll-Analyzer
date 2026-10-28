<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CSV Upload - Employee Payroll Analyzer</title>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/style.css">
</head>
<body>
<div class="app-container">
    <aside class="sidebar">
        <div class="sidebar-header">
            <div class="brand-title">
                Payroll Analyzer
                <span class="brand-badge">Tomcat 9</span>
            </div>
        </div>
        <ul class="nav-menu">
            <li class="nav-item">
                <a href="${pageContext.request.contextPath}/dashboard" class="nav-link">Dashboard</a>
            </li>
            <li class="nav-item">
                <a href="${pageContext.request.contextPath}/employees" class="nav-link">Employees</a>
            </li>
            <li class="nav-item">
                <a href="${pageContext.request.contextPath}/analytics" class="nav-link">Salary Analytics</a>
            </li>
            <li class="nav-item">
                <a href="${pageContext.request.contextPath}/salary-filter" class="nav-link">Search & Filter</a>
            </li>
            <li class="nav-item">
                <a href="${pageContext.request.contextPath}/upload" class="nav-link active">CSV Upload</a>
            </li>
            <li class="nav-item">
                <a href="${pageContext.request.contextPath}/duplicates" class="nav-link">Duplicate Check</a>
            </li>
            <li class="nav-item">
                <a href="${pageContext.request.contextPath}/export" class="nav-link">Export CSV</a>
            </li>
        </ul>
        <div class="sidebar-footer">
            Java 8 · Servlet 4.0 · JSP 2.3
        </div>
    </aside>

    <main class="main-wrapper">
        <header class="top-bar">
            <div class="breadcrumb-trail">
                Application / <strong>Batch Data Import</strong>
            </div>
            <div class="top-actions">
                <a href="${pageContext.request.contextPath}/export" class="btn btn-secondary btn-sm">Download Template CSV</a>
            </div>
        </header>

        <div class="content-body">
            <c:if test="${not empty errorMessage}">
                <div class="alert alert-error">
                    <div><strong>Upload Rejected:</strong><br/>${errorMessage}</div>
                </div>
            </c:if>

            <h1 class="page-title">CSV Employee Import</h1>
            <p class="page-subtitle">Batch import employee records using Java I/O with atomic validation and transactional safety.</p>

            <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 24px; align-items: start;">
                <!-- Upload Form Panel -->
                <div class="panel">
                    <div class="panel-header">
                        <div class="panel-title">Upload File</div>
                    </div>
                    <div class="panel-body">
                        <form action="${pageContext.request.contextPath}/upload" method="post" enctype="multipart/form-data">
                            <div class="form-group">
                                <label class="form-label" for="csvFile">Select CSV File (UTF-8, Max 1 MB)</label>
                                <input type="file" id="csvFile" name="csvFile" accept=".csv,text/csv" class="form-control" required>
                                <div class="form-hint">Only .csv files encoded in UTF-8 are supported. Maximum size: 1 MB.</div>
                            </div>

                            <div class="form-group" style="margin-top: 16px;">
                                <label style="display: flex; align-items: center; gap: 8px; font-size: 0.88rem; cursor: pointer;">
                                    <input type="checkbox" name="overwrite" value="true">
                                    <span>Overwrite existing employees if duplicate ID is encountered</span>
                                </label>
                                <div class="form-hint" style="margin-left: 22px;">
                                    If unchecked, the entire import will be safely rejected if an ID conflicts with an existing record.
                                </div>
                            </div>

                            <div style="margin-top: 24px;">
                                <button type="submit" class="btn btn-primary" style="width: 100%;">
                                    Process & Import CSV
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Formatting Specifications -->
                <div class="panel">
                    <div class="panel-header">
                        <div class="panel-title">Format Specifications</div>
                    </div>
                    <div class="panel-body" style="font-size: 0.85rem;">
                        <p style="margin-bottom: 12px; color: var(--text-dark); font-weight: 600;">
                            Required CSV Column Order:
                        </p>
                        <pre style="background: #f1f5f9; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 0.8rem; overflow-x: auto; margin-bottom: 16px;">employeeId,name,department,salary
101,Rahul,IT,50000
102,Priya,HR,40000
103,Amit,IT,60000
104,Sneha,Finance,45000
105,Kiran,HR,55000
106,Anjali,Finance,65000</pre>

                        <div style="color: #475569; line-height: 1.6;">
                            <p><strong>Atomic Integrity Guarantee:</strong></p>
                            <p>Every row is thoroughly validated before any database insertion. If a single row contains invalid numbers, missing columns, or illegal characters, the entire batch is rejected with an informative error message, leaving your existing data untouched.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>
</div>
<script src="${pageContext.request.contextPath}/js/app.js"></script>
</body>
</html>
