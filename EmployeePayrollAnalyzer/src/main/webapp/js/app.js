/**
 * Employee Payroll Analyzer - Client JavaScript
 * Provides client-side input validation, confirm alerts, and interactive UX.
 */

document.addEventListener("DOMContentLoaded", function () {
    // Confirm delete prompts
    const deleteForms = document.querySelectorAll(".delete-form");
    deleteForms.forEach(function (form) {
        form.addEventListener("submit", function (e) {
            const empName = form.getAttribute("data-emp-name") || "this employee";
            if (!confirm("Are you sure you want to delete " + empName + "? This action cannot be undone.")) {
                e.preventDefault();
            }
        });
    });

    // Auto-dismiss alert messages after 5 seconds
    const alerts = document.querySelectorAll(".alert");
    if (alerts.length > 0) {
        setTimeout(function () {
            alerts.forEach(function (alert) {
                alert.style.transition = "opacity 0.4s ease";
                alert.style.opacity = "0";
                setTimeout(function () {
                    alert.remove();
                }, 400);
            });
        }, 5000);
    }
});

/**
 * Validates employee modal/form inputs prior to submission.
 */
function validateEmployeeForm(form) {
    const id = form.employeeId.value.trim();
    const name = form.name.value.trim();
    const dept = form.department.value.trim();
    const salary = form.salary.value.trim();

    if (!id || isNaN(id) || parseInt(id) <= 0) {
        alert("Please enter a valid positive Employee ID.");
        form.employeeId.focus();
        return false;
    }

    if (!name || name.length < 2) {
        alert("Please enter a valid Employee Name (at least 2 characters).");
        form.name.focus();
        return false;
    }

    if (!dept) {
        alert("Please select or enter a Department.");
        form.department.focus();
        return false;
    }

    if (!salary || isNaN(salary) || parseFloat(salary) <= 0) {
        alert("Please enter a valid positive salary amount.");
        form.salary.focus();
        return false;
    }

    return true;
}
