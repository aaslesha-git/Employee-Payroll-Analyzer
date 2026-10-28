<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Employee Payroll Analyzer</title>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/style.css">
</head>
<body>
<div class="app-container">
    <!-- Sidebar Navigation -->
    <aside class="sidebar">
        <div class="sidebar-header">
            <div class="brand-title">
                Payroll Analyzer
                <span class="brand-badge">Tomcat 9</span>
            </div>
        </div>
        <ul class="nav-menu">
            <li class="nav-item">
                <a href="${pageContext.request.contextPath}/dashboard" class="nav-link active">Dashboard</a>
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

    <!-- Main Content Area -->
    <main class="main-wrapper">
        <header class="top-bar">
            <div class="breadcrumb-trail">
                Application / <strong>Executive Dashboard</strong>
            </div>
            <div class="top-actions">
                <a href="${pageContext.request.contextPath}/employees" class="btn btn-primary btn-sm">+ Add Employee</a>
                <a href="${pageContext.request.contextPath}/export" class="btn btn-secondary btn-sm">Download CSV</a>
            </div>
        </header>

        <div class="content-body">
            <!-- Flash Notifications -->
            <c:if test="${not empty sessionScope.flashSuccess}">
                <div class="alert alert-success">
                    <span>${sessionScope.flashSuccess}</span>
                </div>
                <c:remove var="flashSuccess" scope="session"/>
            </c:if>

            <h1 class="page-title">Payroll Overview</h1>
            <p class="page-subtitle">Real-time organizational payroll analytics computed via Java 8 Streams API.</p>

            <!-- 4 Metric Cards -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-label">Total Employees</div>
                    <div class="stat-value tabular-nums">${totalEmployees}</div>
                    <div class="stat-subtitle">Active workforce count</div>
                </div>

                <div class="stat-card">
                    <div class="stat-label">Total Payroll</div>
                    <div class="stat-value tabular-nums">
                        $<fmt:formatNumber value="${totalPayroll}" type="number" minFractionDigits="0" maxFractionDigits="2"/>
                    </div>
                    <div class="stat-subtitle">Aggregate monthly expenditure</div>
                </div>

                <div class="stat-card">
                    <div class="stat-label">Average Salary</div>
                    <div class="stat-value tabular-nums">
                        $<fmt:formatNumber value="${averageSalary}" type="number" minFractionDigits="0" maxFractionDigits="2"/>
                    </div>
                    <div class="stat-subtitle">Across all active departments</div>
                </div>

                <div class="stat-card">
                    <div class="stat-label">Departments</div>
                    <div class="stat-value tabular-nums">${departmentCount}</div>
                    <div class="stat-subtitle">Operating functional units</div>
                </div>
            </div>

            <!-- Department Summary Table -->
            <div class="panel">
                <div class="panel-header">
                    <div class="panel-title">Department-wise Breakdown</div>
                    <a href="${pageContext.request.contextPath}/analytics" class="btn btn-secondary btn-sm">Deep Analytics &rarr;</a>
                </div>
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Department</th>
                                <th class="numeric">Headcount</th>
                                <th class="numeric">Average Salary</th>
                                <th class="numeric">Total Expenditure</th>
                                <th>Highest Paid Employee</th>
                            </tr>
                        </thead>
                        <tbody>
                            <c:forEach var="item" items="${departmentSummaries}">
                                <tr>
                                    <td><strong>${item.department}</strong></td>
                                    <td class="numeric tabular-nums">${item.count}</td>
                                    <td class="numeric tabular-nums">
                                        $<fmt:formatNumber value="${item.averageSalary}" type="number" minFractionDigits="0" maxFractionDigits="2"/>
                                    </td>
                                    <td class="numeric tabular-nums">
                                        $<fmt:formatNumber value="${item.totalSalary}" type="number" minFractionDigits="0" maxFractionDigits="2"/>
                                    </td>
                                    <td>
                                        <c:choose>
                                            <c:when test="${not empty item.highestPaidEmployee}">
                                                ${item.highestPaidEmployee.name}
                                                <span class="text-muted tabular-nums">
                                                    ($<fmt:formatNumber value="${item.highestPaidEmployee.salary}" type="number" minFractionDigits="0" maxFractionDigits="0"/>)
                                                </span>
                                            </c:when>
                                            <c:otherwise>N/A</c:otherwise>
                                        </c:choose>
                                    </td>
                                </tr>
                            </c:forEach>
                            <c:if test="${empty departmentSummaries}">
                                <tr>
                                    <td colspan="5" class="empty-state">No department records available.</td>
                                </tr>
                            </c:if>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Recent Employees Table -->
            <div class="panel">
                <div class="panel-header">
                    <div class="panel-title">Recently Added Records</div>
                    <a href="${pageContext.request.contextPath}/employees" class="btn btn-secondary btn-sm">View All (${totalEmployees})</a>
                </div>
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Full Name</th>
                                <th>Department</th>
                                <th class="numeric">Salary</th>
                                <th class="numeric">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <c:forEach var="emp" items="${recentEmployees}">
                                <tr>
                                    <td class="tabular-nums">#${emp.employeeId}</td>
                                    <td><strong>${emp.name}</strong></td>
                                    <td>${emp.department}</td>
                                    <td class="numeric tabular-nums">
                                        $<fmt:formatNumber value="${emp.salary}" type="number" minFractionDigits="0" maxFractionDigits="2"/>
                                    </td>
                                    <td class="numeric">
                                        <a href="${pageContext.request.contextPath}/employees?action=edit&id=${emp.employeeId}" class="btn btn-secondary btn-sm">Edit</a>
                                    </td>
                                </tr>
                            </c:forEach>
                            <c:if test="${empty recentEmployees}">
                                <tr>
                                    <td colspan="5" class="empty-state">No employee records registered yet.</td>
                                </tr>
                            </c:if>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </main>
</div>
<script src="${pageContext.request.contextPath}/js/app.js"></script>
</body>
</html>
