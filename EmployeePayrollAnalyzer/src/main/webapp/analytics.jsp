<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Salary Analytics - Employee Payroll Analyzer</title>
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
                <a href="${pageContext.request.contextPath}/employees" class="nav-link">Employees</a>
            </li>
            <li class="nav-item">
                <a href="${pageContext.request.contextPath}/analytics" class="nav-link active">Salary Analytics</a>
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
                Application / <strong>Salary Analytics & Insights</strong>
            </div>
            <div class="top-actions">
                <a href="${pageContext.request.contextPath}/export" class="btn btn-secondary btn-sm">Export CSV</a>
            </div>
        </header>

        <div class="content-body">
            <h1 class="page-title">Department & Salary Analytics</h1>
            <p class="page-subtitle">Multi-dimensional payroll aggregation powered entirely by the Java 8 Streams API.</p>

            <!-- Metrics Overview -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-label">Total Expenditure</div>
                    <div class="stat-value tabular-nums">
                        $<fmt:formatNumber value="${totalPayroll}" type="number" minFractionDigits="0" maxFractionDigits="2"/>
                    </div>
                    <div class="stat-subtitle">Calculated via stream.map().reduce()</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Overall Average Salary</div>
                    <div class="stat-value tabular-nums">
                        $<fmt:formatNumber value="${overallAverage}" type="number" minFractionDigits="0" maxFractionDigits="2"/>
                    </div>
                    <div class="stat-subtitle">Across all active personnel</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Active Headcount</div>
                    <div class="stat-value tabular-nums">${totalEmployees}</div>
                    <div class="stat-subtitle">Verified unique records</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Tracked Departments</div>
                    <div class="stat-value tabular-nums">${departmentCount}</div>
                    <div class="stat-subtitle">Calculated via map().distinct()</div>
                </div>
            </div>

            <!-- Department Analytics Table -->
            <div class="panel">
                <div class="panel-header">
                    <div class="panel-title">Departmental Salary Benchmark Matrix</div>
                </div>
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Department</th>
                                <th class="numeric">Headcount</th>
                                <th class="numeric">Average Salary</th>
                                <th class="numeric">Total Payroll</th>
                                <th class="numeric">% Payroll Share</th>
                                <th>Highest-Paid Employee</th>
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
                                    <td class="numeric tabular-nums">
                                        <c:choose>
                                            <c:when test="${totalPayroll > 0}">
                                                <fmt:formatNumber value="${(item.totalSalary / totalPayroll) * 100}" type="number" minFractionDigits="1" maxFractionDigits="1"/>%
                                            </c:when>
                                            <c:otherwise>0.0%</c:otherwise>
                                        </c:choose>
                                    </td>
                                    <td>
                                        <c:choose>
                                            <c:when test="${not empty item.highestPaidEmployee}">
                                                <strong>${item.highestPaidEmployee.name}</strong>
                                                <span style="color: var(--text-muted);" class="tabular-nums">
                                                    (#${item.highestPaidEmployee.employeeId} · $<fmt:formatNumber value="${item.highestPaidEmployee.salary}" type="number" minFractionDigits="0" maxFractionDigits="0"/>)
                                                </span>
                                            </c:when>
                                            <c:otherwise>—</c:otherwise>
                                        </c:choose>
                                    </td>
                                </tr>
                            </c:forEach>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Java 8 Architecture Note for Academic Project -->
            <div class="panel">
                <div class="panel-header">
                    <div class="panel-title">Java 8 Stream API Architecture Reference</div>
                </div>
                <div class="panel-body" style="font-size: 0.88rem; color: #334155;">
                    <p style="margin-bottom: 12px;">This analytics module strictly utilizes Java 8 functional pipelines in <code>EmployeeService.java</code>:</p>
                    <ul style="padding-left: 20px; line-height: 1.8;">
                        <li><strong>Department Average:</strong> <code>employees.stream().collect(Collectors.groupingBy(Employee::getDepartment, Collectors.averagingDouble(Employee::getSalary)))</code></li>
                        <li><strong>Highest Paid per Dept:</strong> <code>employees.stream().collect(Collectors.groupingBy(Employee::getDepartment, Collectors.maxBy(Comparator.comparingDouble(Employee::getSalary))))</code></li>
                        <li><strong>Department Headcount:</strong> <code>employees.stream().collect(Collectors.groupingBy(Employee::getDepartment, Collectors.counting()))</code></li>
                        <li><strong>Total Payroll Expenditure:</strong> <code>employees.stream().map(Employee::getSalary).reduce(0.0, Double::sum)</code></li>
                        <li><strong>Unique Department List:</strong> <code>employees.stream().map(Employee::getDepartment).distinct().sorted().collect(Collectors.toList())</code></li>
                    </ul>
                </div>
            </div>
        </div>
    </main>
</div>
<script src="${pageContext.request.contextPath}/js/app.js"></script>
</body>
</html>
