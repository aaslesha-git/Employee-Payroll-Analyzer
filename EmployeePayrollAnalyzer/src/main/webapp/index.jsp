<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%
    // Automatically redirect root requests to HomeServlet
    response.sendRedirect(request.getContextPath() + "/dashboard");
%>
