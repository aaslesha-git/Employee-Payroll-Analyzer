<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Duplicate Records Check - Employee Payroll Analyzer</title>
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
                <a href="${pageContext.request.contextPath}/upload" class="nav-link">CSV Upload</a>
            </li>
            <li class="nav-item">
                <a href="${pageContext.request.contextPath}/duplicates" class="nav-link active">Duplicate Check</a>
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
                Application / <strong>Data Integrity & Duplicate Detection</strong>
            </div>
            <div class="top-actions">
                <a href="${pageContext.request.contextPath}/employees" class="btn btn-secondary btn-sm">Return to Roster</a>
            </div>
        </header>

        <div class="content-body">
            <c:if test="${not empty sessionScope.flashSuccess}">
                <div class="alert alert-success">
                    <span>${sessionScope.flashSuccess}</span>
                </div>
                <c:remove var="flashSuccess" scope="session"/>
            </c:if>

            <h1 class="page-title">Duplicate Record Auditor</h1>
            <p class="page-subtitle">Identify conflicting employee records using Java Collections & Streams without silent data loss.</p>

            <c:choose>
                <c:when test="${hasDuplicates}">
                    <div class="panel">
                        <div class="panel-header" style="background: #fffbeb;">
                            <div class="panel-title" style="color: #92400e;">
                                Conflicting Records Detected
                            </div>
                            <form action="${pageContext.request.contextPath}/duplicates" method="post" onsubmit="return confirm('Purge duplicate occurrences and retain primary record per Employee ID?');">
                                <button type="submit" class="btn btn-danger btn-sm">Purge Duplicates</button>
                            </form>
                        </div>
                        <div class="panel-body">
                            <p style="font-size: 0.88rem; color: #78350f; margin-bottom: 20px;">
                                The following employee IDs have multiple conflicting entries in the system. Review the details below before purging.
                            </p>

                            <c:forEach var="entry" items="${duplicateMap}">
                                <div style="margin-bottom: 24px; border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden;">
                                    <div style="background: #f8fafc; padding: 10px 16px; font-weight: 600; font-size: 0.85rem; border-bottom: 1px solid var(--border-color);">
                                        Conflicting Employee ID #${entry.key} (${entry.value.size()} occurrences)
                                    </div>
                                    <table class="data-table">
                                        <thead>
                                            <tr>
                                                <th>Occurrence</th>
                                                <th>Name</th>
                                                <th>Department</th>
                                                <th class="numeric">Salary</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <c:forEach var="dup" items="${entry.value}" varStatus="status">
                                                <tr>
                                                    <td>Record #${status.index + 1}</td>
                                                    <td><strong>${dup.name}</strong></td>
                                                    <td>${dup.department}</td>
                                                    <td class="numeric tabular-nums">
                                                        $<fmt:formatNumber value="${dup.salary}" type="number" minFractionDigits="0" maxFractionDigits="2"/>
                                                    </td>
                                                </tr>
                                            </c:forEach>
                                        </tbody>
                                    </table>
                                </div>
                            </c:forEach>
                        </div>
                    </div>
                </c:when>

                <c:otherwise>
                    <div class="panel">
                        <div class="panel-body empty-state">
                            <div class="empty-state-title" style="color: var(--success-green);">All Records Are Unique</div>
                            <div class="empty-state-desc">
                                All ${totalEmployees} employee records currently maintain distinct Employee IDs. No conflicting duplicate entries exist.
                            </div>
                            <a href="${pageContext.request.contextPath}/dashboard" class="btn btn-primary btn-sm">Back to Dashboard</a>
                        </div>
                    </div>
                </c:otherwise>
            </c:choose>
        </div>
    </main>
</div>
<script src="${pageContext.request.contextPath}/js/app.js"></script>
</body>
</html>
