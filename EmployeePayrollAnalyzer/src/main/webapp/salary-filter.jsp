<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Search & Salary Filter - Employee Payroll Analyzer</title>
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
                <a href="${pageContext.request.contextPath}/salary-filter" class="nav-link active">Search & Filter</a>
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
                Application / <strong>Search & Salary Range Filter</strong>
            </div>
            <div class="top-actions">
                <a href="${pageContext.request.contextPath}/salary-filter" class="btn btn-secondary btn-sm">Reset Filters</a>
            </div>
        </header>

        <div class="content-body">
            <c:if test="${not empty errorMessage}">
                <div class="alert alert-error">
                    <div><strong>Input Warning:</strong><br/>${errorMessage}</div>
                </div>
            </c:if>

            <h1 class="page-title">Search & Salary Range Filter</h1>
            <p class="page-subtitle">Filter employees by ID, name, or salary boundaries using Java 8 Stream filter().</p>

            <!-- Search & Filter Controls -->
            <div class="panel">
                <div class="panel-header">
                    <div class="panel-title">Filter Criteria</div>
                </div>
                <div class="panel-body">
                    <form action="${pageContext.request.contextPath}/salary-filter" method="get" style="display: grid; grid-template-columns: 1.5fr 1fr 1fr auto; gap: 16px; align-items: flex-end;">
                        <div class="form-group" style="margin-bottom: 0;">
                            <label class="form-label" for="q">Keyword Search (ID or Name)</label>
                            <input type="text" id="q" name="q" class="form-control" value="${searchQuery}" placeholder="e.g. Rahul, IT, or 101">
                        </div>

                        <div class="form-group" style="margin-bottom: 0;">
                            <label class="form-label" for="minSalary">Min Salary ($)</label>
                            <input type="number" step="1000" id="minSalary" name="minSalary" class="form-control tabular-nums" value="${minSalary}" placeholder="e.g. 45000">
                        </div>

                        <div class="form-group" style="margin-bottom: 0;">
                            <label class="form-label" for="maxSalary">Max Salary ($)</label>
                            <input type="number" step="1000" id="maxSalary" name="maxSalary" class="form-control tabular-nums" value="${maxSalary}" placeholder="e.g. 60000">
                        </div>

                        <div style="display: flex; gap: 8px;">
                            <button type="submit" class="btn btn-primary">Apply Filter</button>
                            <a href="${pageContext.request.contextPath}/salary-filter" class="btn btn-secondary">Clear</a>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Filter Results Table -->
            <div class="panel">
                <div class="panel-header">
                    <div class="panel-title">
                        Matching Results
                        <c:if test="${hasFilterApplied}">
                            <span style="font-weight: normal; font-size: 0.85rem; color: var(--text-muted);">
                                (${employees.size()} matched)
                            </span>
                        </c:if>
                    </div>
                </div>
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Full Name</th>
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
                                        <a href="${pageContext.request.contextPath}/employees?action=edit&id=${emp.employeeId}" class="btn btn-secondary btn-sm">Edit</a>
                                    </td>
                                </tr>
                            </c:forEach>
                            <c:if test="${empty employees}">
                                <tr>
                                    <td colspan="5" class="empty-state">
                                        <div class="empty-state-title">No employees matched your criteria</div>
                                        <div class="empty-state-desc">
                                            No employee records were found for the query or salary range specified. Try widening your salary boundaries or clearing keyword filters.
                                        </div>
                                        <a href="${pageContext.request.contextPath}/salary-filter" class="btn btn-primary btn-sm">Reset All Filters</a>
                                    </td>
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
