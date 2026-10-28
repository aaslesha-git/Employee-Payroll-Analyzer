<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Employee Management - Employee Payroll Analyzer</title>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/style.css">
</head>
<body>
<div class="app-container">
    <!-- Sidebar -->
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
                <a href="${pageContext.request.contextPath}/employees" class="nav-link active">Employees</a>
            </li>
            <li class="nav-item">
                <a href="${pageContext.request.contextPath}/analytics" class="nav-link">Salary Analytics</a>
            </li>
            <li class="nav-item">
                <a href="${pageContext.request.contextPath}/salary-filter" class="nav-link">Search & Filter</a>
            </li>
            <li class="nav-item">
                <a href="${pageContext.request.contextPath}/upload" class="nav-link">CSV Upload</a>
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
                Application / <strong>Employee Roster</strong>
            </div>
            <div class="top-actions">
                <a href="${pageContext.request.contextPath}/export" class="btn btn-secondary btn-sm">Export to CSV</a>
            </div>
        </header>

        <div class="content-body">
            <!-- Flash & Error alerts -->
            <c:if test="${not empty sessionScope.flashSuccess}">
                <div class="alert alert-success">
                    <span>${sessionScope.flashSuccess}</span>
                </div>
                <c:remove var="flashSuccess" scope="session"/>
            </c:if>
            <c:if test="${not empty sessionScope.flashError}">
                <div class="alert alert-error">
                    <span>${sessionScope.flashError}</span>
                </div>
                <c:remove var="flashError" scope="session"/>
            </c:if>
            <c:if test="${not empty errorMessage}">
                <div class="alert alert-error">
                    <div><strong>Please fix the following:</strong><br/>${errorMessage}</div>
                </div>
            </c:if>

            <h1 class="page-title">Employee Management</h1>
            <p class="page-subtitle">Add, edit, inspect, sort, and maintain employee payroll records.</p>

            <div style="display: grid; grid-template-columns: 360px 1fr; gap: 24px; align-items: start;">
                <!-- Add / Edit Employee Form -->
                <div class="panel">
                    <div class="panel-header">
                        <div class="panel-title">
                            <c:choose>
                                <c:when test="${not empty editEmployee}">Edit Employee #${editEmployee.employeeId}</c:when>
                                <c:otherwise>Add New Employee</c:otherwise>
                            </c:choose>
                        </div>
                    </div>
                    <div class="panel-body">
                        <form action="${pageContext.request.contextPath}/employees" method="post" onsubmit="return validateEmployeeForm(this);">
                            <input type="hidden" name="action" value="${not empty editEmployee ? 'update' : 'add'}">

                            <div class="form-group">
                                <label class="form-label" for="employeeId">Employee ID</label>
                                <input type="number" id="employeeId" name="employeeId" class="form-control tabular-nums"
                                       value="${not empty editEmployee ? editEmployee.employeeId : formId}"
                                       ${not empty editEmployee ? 'readonly style="background:#f1f5f9;"' : 'required'}>
                                <div class="form-hint">Unique numerical identifier (e.g., 107)</div>
                            </div>

                            <div class="form-group">
                                <label class="form-label" for="name">Full Name</label>
                                <input type="text" id="name" name="name" class="form-control" required
                                       value="${not empty editEmployee ? editEmployee.name : formName}"
                                       placeholder="e.g. Ramesh Kumar">
                            </div>

                            <div class="form-group">
                                <label class="form-label" for="department">Department</label>
                                <input type="text" id="department" name="department" class="form-control" required
                                       value="${not empty editEmployee ? editEmployee.department : formDepartment}"
                                       placeholder="e.g. IT, HR, Finance" list="departmentList">
                                <datalist id="departmentList">
                                    <c:forEach var="dept" items="${distinctDepartments}">
                                        <option value="${dept}">
                                    </c:forEach>
                                </datalist>
                            </div>

                            <div class="form-group">
                                <label class="form-label" for="salary">Monthly Salary ($)</label>
                                <input type="number" step="0.01" id="salary" name="salary" class="form-control tabular-nums" required
                                       value="${not empty editEmployee ? editEmployee.salary : formSalary}"
                                       placeholder="e.g. 52000">
                            </div>

                            <div style="display: flex; gap: 8px; margin-top: 20px;">
                                <button type="submit" class="btn btn-primary" style="flex: 1;">
                                    ${not empty editEmployee ? 'Save Changes' : 'Add Employee'}
                                </button>
                                <c:if test="${not empty editEmployee}">
                                    <a href="${pageContext.request.contextPath}/employees" class="btn btn-secondary">Cancel</a>
                                </c:if>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Employee Table with Sorting Controls -->
                <div class="panel">
                    <div class="panel-header" style="flex-wrap: wrap; gap: 12px;">
                        <div class="panel-title">Active Roster (${totalEmployees} Employees)</div>
                        <div style="display: flex; gap: 8px; align-items: center; font-size: 0.8rem;">
                            <span style="color: var(--text-muted);">Sort by:</span>
                            <a href="${pageContext.request.contextPath}/employees?sortBy=name&order=${sortBy eq 'name' and order eq 'asc' ? 'desc' : 'asc'}"
                               class="btn btn-secondary btn-sm ${sortBy eq 'name' ? 'btn-primary' : ''}">
                                Name ${sortBy eq 'name' ? (order eq 'asc' ? '▲' : '▼') : ''}
                            </a>
                            <a href="${pageContext.request.contextPath}/employees?sortBy=salary&order=${sortBy eq 'salary' and order eq 'asc' ? 'desc' : 'asc'}"
                               class="btn btn-secondary btn-sm ${sortBy eq 'salary' ? 'btn-primary' : ''}">
                                Salary ${sortBy eq 'salary' ? (order eq 'asc' ? '▲' : '▼') : ''}
                            </a>
                            <a href="${pageContext.request.contextPath}/employees?sortBy=id&order=${sortBy eq 'id' and order eq 'asc' ? 'desc' : 'asc'}"
                               class="btn btn-secondary btn-sm ${sortBy eq 'id' ? 'btn-primary' : ''}">
                                ID ${sortBy eq 'id' ? (order eq 'asc' ? '▲' : '▼') : ''}
                            </a>
                        </div>
                    </div>
                    <div class="table-responsive">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Department</th>
                                    <th class="numeric">Salary</th>
                                    <th class="numeric">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <c:forEach var="emp" items="${employees}">
                                    <tr>
                                        <td class="tabular-nums">#${emp.employeeId}</td>
                                        <td><strong>${emp.name}</strong></td>
                                        <td>${emp.department}</td>
                                        <td class="numeric tabular-nums">
                                            $<fmt:formatNumber value="${emp.salary}" type="number" minFractionDigits="0" maxFractionDigits="2"/>
                                        </td>
                                        <td class="numeric">
                                            <div style="display: inline-flex; gap: 6px;">
                                                <a href="${pageContext.request.contextPath}/employees?action=edit&id=${emp.employeeId}"
                                                   class="btn btn-secondary btn-sm">Edit</a>
                                                <form action="${pageContext.request.contextPath}/employees" method="post" class="delete-form" data-emp-name="${emp.name}" style="display: inline;">
                                                    <input type="hidden" name="action" value="delete">
                                                    <input type="hidden" name="employeeId" value="${emp.employeeId}">
                                                    <button type="submit" class="btn btn-danger btn-sm">Delete</button>
                                                </form>
                                            </div>
                                        </td>
                                    </tr>
                                </c:forEach>
                                <c:if test="${empty employees}">
                                    <tr>
                                        <td colspan="5" class="empty-state">
                                            <div class="empty-state-title">No employees found</div>
                                            <div class="empty-state-desc">Use the form on the left to add your first employee or import a CSV file.</div>
                                        </td>
                                    </tr>
                                </c:if>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </main>
</div>
<script src="${pageContext.request.contextPath}/js/app.js"></script>
</body>
</html>
