/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef } from 'react';
import {
  Users,
  DollarSign,
  Building2,
  TrendingUp,
  Plus,
  Search,
  Filter,
  Upload,
  Download,
  Trash2,
  Edit3,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Code,
  Terminal,
  Copy,
  Check,
  RotateCcw,
  HelpCircle,
  FolderTree,
  ArrowUpDown,
  ChevronRight,
  X,
  FileCode,
  Layers,
  Sparkles
} from 'lucide-react';
import { JAVA_PROJECT_FILES, ProjectFile } from './data/javaProjectFiles';
import { createZipArchive } from './utils/zipPacker';

// Initial sample employee dataset specified in prompt
export interface Employee {
  employeeId: number;
  name: string;
  department: string;
  salary: number;
}

const INITIAL_EMPLOYEES: Employee[] = [
  { employeeId: 101, name: 'Rahul', department: 'IT', salary: 50000 },
  { employeeId: 102, name: 'Priya', department: 'HR', salary: 40000 },
  { employeeId: 103, name: 'Amit', department: 'IT', salary: 60000 },
  { employeeId: 104, name: 'Sneha', department: 'Finance', salary: 45000 },
  { employeeId: 105, name: 'Kiran', department: 'HR', salary: 55000 },
  { employeeId: 106, name: 'Anjali', department: 'Finance', salary: 65000 },
];

type ActiveTab = 'dashboard' | 'employees' | 'analytics' | 'search' | 'upload' | 'duplicates' | 'code' | 'docs';

export default function App() {
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>({
    message: 'Welcome! Loaded 6 sample records from employees.csv (Tomcat 9 simulation ready).',
    type: 'success',
  });

  // Employee CRUD Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [formInputs, setFormInputs] = useState({
    employeeId: '',
    name: '',
    department: 'IT',
    salary: '',
  });
  const [formErrors, setFormErrors] = useState<string[]>([]);

  // Sorting state for Employee Management
  const [sortField, setSortField] = useState<'name' | 'salary' | 'employeeId' | 'department'>('employeeId');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [minSalary, setMinSalary] = useState('');
  const [maxSalary, setMaxSalary] = useState('');

  // CSV Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [overwriteDuplicates, setOverwriteDuplicates] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Java Code Browser state
  const [selectedFile, setSelectedFile] = useState<ProjectFile>(
    JAVA_PROJECT_FILES.find((f) => f.name === 'EmployeeService.java') || JAVA_PROJECT_FILES[0]
  );
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);

  // Helper to trigger auto-dismissing toast
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  };

  // =========================================================================
  // Java 8 Stream Calculations & Metrics (Faithfully mirroring EmployeeService)
  // =========================================================================

  const totalEmployees = employees.length;

  // Stream map() and reduce(0.0, Double::sum)
  const totalPayroll = useMemo(() => {
    return employees.map((e) => e.salary).reduce((acc, curr) => acc + curr, 0);
  }, [employees]);

  // Stream mapToDouble().average()
  const averageSalary = useMemo(() => {
    return totalEmployees > 0 ? totalPayroll / totalEmployees : 0;
  }, [totalEmployees, totalPayroll]);

  // Stream map().distinct().sorted()
  const distinctDepartments = useMemo(() => {
    return Array.from(new Set(employees.map((e) => e.department.trim()))).sort();
  }, [employees]);

  const departmentCount = distinctDepartments.length;

  // Department analytics: groupingBy, averagingDouble, counting, maxBy
  const departmentSummaries = useMemo(() => {
    return distinctDepartments.map((dept) => {
      const deptEmployees = employees.filter((e) => e.department === dept);
      const count = deptEmployees.length;
      const deptTotal = deptEmployees.reduce((sum, e) => sum + e.salary, 0);
      const deptAvg = count > 0 ? deptTotal / count : 0;

      // Stream maxBy(Comparator.comparingDouble(Employee::getSalary))
      let highestPaid: Employee | null = null;
      if (deptEmployees.length > 0) {
        highestPaid = deptEmployees.reduce((max, current) =>
          current.salary > max.salary ? current : max
        );
      }

      const payrollShare = totalPayroll > 0 ? (deptTotal / totalPayroll) * 100 : 0;

      return {
        department: dept,
        count,
        totalSalary: deptTotal,
        averageSalary: deptAvg,
        highestPaidEmployee: highestPaid,
        payrollShare,
      };
    });
  }, [distinctDepartments, employees, totalPayroll]);

  // Detect duplicate IDs (mirrors EmployeeService.detectDuplicateIds)
  const duplicateGroups = useMemo(() => {
    const map = new Map<number, Employee[]>();
    for (const emp of employees) {
      const list = map.get(emp.employeeId) || [];
      list.push(emp);
      map.set(emp.employeeId, list);
    }
    const duplicates: { id: number; records: Employee[] }[] = [];
    map.forEach((records, id) => {
      if (records.length > 1) {
        duplicates.push({ id, records });
      }
    });
    return duplicates;
  }, [employees]);

  // Sorted employees list for Employee Management view
  const sortedEmployees = useMemo(() => {
    const list = [...employees];
    list.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'salary') {
        comparison = a.salary - b.salary;
      } else if (sortField === 'employeeId') {
        comparison = a.employeeId - b.employeeId;
      } else if (sortField === 'department') {
        comparison = a.department.localeCompare(b.department);
      } else {
        comparison = a.name.localeCompare(b.name);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    return list;
  }, [employees, sortField, sortOrder]);

  // Filtered employees for Search & Salary Filter view
  const filteredEmployees = useMemo(() => {
    let result = [...employees];

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (e) =>
          String(e.employeeId).includes(q) ||
          e.name.toLowerCase().includes(q) ||
          e.department.toLowerCase().includes(q)
      );
    }

    const min = parseFloat(minSalary);
    if (!isNaN(min) && min >= 0) {
      result = result.filter((e) => e.salary >= min);
    }

    const max = parseFloat(maxSalary);
    if (!isNaN(max) && max >= 0) {
      result = result.filter((e) => e.salary <= max);
    }

    return result.sort((a, b) => a.salary - b.salary);
  }, [employees, searchQuery, minSalary, maxSalary]);

  // =========================================================================
  // CRUD Actions
  // =========================================================================

  const handleOpenAddModal = () => {
    setEditingEmployee(null);
    setFormInputs({
      employeeId: '',
      name: '',
      department: distinctDepartments[0] || 'IT',
      salary: '',
    });
    setFormErrors([]);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormInputs({
      employeeId: String(emp.employeeId),
      name: emp.name,
      department: emp.department,
      salary: String(emp.salary),
    });
    setFormErrors([]);
    setIsAddModalOpen(true);
  };

  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: string[] = [];
    const idNum = parseInt(formInputs.employeeId.trim(), 10);
    const salaryNum = parseFloat(formInputs.salary.trim());
    const trimmedName = formInputs.name.trim();
    const trimmedDept = formInputs.department.trim();

    if (isNaN(idNum) || idNum <= 0) {
      errors.push('Employee ID must be a positive integer greater than zero.');
    }
    if (!trimmedName || trimmedName.length < 2) {
      errors.push('Name must be at least 2 characters.');
    } else if (!/^[a-zA-Z\s.'-]+$/.test(trimmedName)) {
      errors.push('Name contains invalid characters (letters, spaces, hyphens only).');
    }
    if (!trimmedDept) {
      errors.push('Department is required.');
    }
    if (isNaN(salaryNum) || salaryNum <= 0) {
      errors.push('Salary must be a positive number greater than zero.');
    }

    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    if (editingEmployee) {
      // Update
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.employeeId === editingEmployee.employeeId
            ? { ...emp, name: trimmedName, department: trimmedDept, salary: salaryNum }
            : emp
        )
      );
      showToast(`Employee #${editingEmployee.employeeId} (${trimmedName}) updated successfully.`);
    } else {
      // Check duplicate ID
      if (employees.some((emp) => emp.employeeId === idNum)) {
        setFormErrors([`Employee with ID ${idNum} already exists in the system.`]);
        return;
      }
      const newEmp: Employee = {
        employeeId: idNum,
        name: trimmedName,
        department: trimmedDept,
        salary: salaryNum,
      };
      setEmployees((prev) => [...prev, newEmp]);
      showToast(`Employee #${idNum} (${trimmedName}) added successfully.`);
    }

    setIsAddModalOpen(false);
  };

  const handleDeleteEmployee = (emp: Employee) => {
    setEmployeeToDelete(emp);
  };

  const confirmDelete = () => {
    if (employeeToDelete) {
      const id = employeeToDelete.employeeId;
      const name = employeeToDelete.name;
      setEmployees((prev) => prev.filter((item) => item.employeeId !== id));
      showToast(`Employee #${id} (${name}) deleted successfully.`, 'info');
      setEmployeeToDelete(null);
    }
  };

  // Duplicate purge (mirrors DuplicateRemovalServlet)
  const handlePurgeDuplicates = () => {
    const seen = new Set<number>();
    const unique: Employee[] = [];
    let purgedCount = 0;

    for (const emp of employees) {
      if (!seen.has(emp.employeeId)) {
        seen.add(emp.employeeId);
        unique.push(emp);
      } else {
        purgedCount++;
      }
    }

    setEmployees(unique);
    showToast(`Successfully purged ${purgedCount} duplicate record(s). All employee IDs are now unique.`);
  };

  // Test helper: Inject duplicate to easily demonstrate deduplication feature
  const handleInjectDuplicate = () => {
    const duplicateRecord: Employee = {
      employeeId: 103, // Amit's ID
      name: 'Amit Kumar (Duplicate Test)',
      department: 'IT',
      salary: 62000,
    };
    setEmployees((prev) => [...prev, duplicateRecord]);
    showToast('Injected duplicate record for Employee ID #103. Check the Duplicate Audit tab!', 'info');
    setActiveTab('duplicates');
  };

  // Reset to initial 6 sample employees
  const handleResetSampleData = () => {
    setEmployees(INITIAL_EMPLOYEES);
    showToast('Reset data to initial 6 sample employees.');
  };

  // =========================================================================
  // CSV Export
  // =========================================================================

  const handleExportCsv = () => {
    const header = 'employeeId,name,department,salary\n';
    const rows = employees
      .map((e) => {
        const safeName = e.name.includes(',') ? `"${e.name}"` : e.name;
        const safeDept = e.department.includes(',') ? `"${e.department}"` : e.department;
        return `${e.employeeId},${safeName},${safeDept},${e.salary}`;
      })
      .join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'employees.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Exported ${employees.length} records to employees.csv.`);
  };

  const handleDownloadSampleCsv = () => {
    const sampleCsv = `employeeId,name,department,salary
107,Deepak Verma,IT,58000
108,Meera Nair,Finance,62000
109,Arjun Sharma,HR,49000
110,Kavita Patel,IT,72000
111,Rohan Mehta,Marketing,53000
112,Sunita Rao,Finance,68000`;
    const blob = new Blob([sampleCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sample_employees.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Downloaded sample_employees.csv with 6 new employees ready to upload.');
  };

  // =========================================================================
  // CSV Upload (Atomic Validation mirroring CsvUtil & UploadServlet)
  // =========================================================================

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.csv')) {
        setUploadErrors(['Invalid file format. Please select a .csv file.']);
        setUploadFile(null);
        return;
      }
      if (file.size > 1024 * 1024) {
        setUploadErrors([`File size exceeds 1 MB limit (${(file.size / 1024).toFixed(1)} KB).`]);
        setUploadFile(null);
        return;
      }
      setUploadErrors([]);
      setUploadFile(file);
    }
  };

  const handleProcessUpload = async () => {
    if (!uploadFile) {
      setUploadErrors(['Please select a CSV file first.']);
      return;
    }

    try {
      const text = await uploadFile.text();
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);

      if (lines.length === 0) {
        setUploadErrors(['The selected CSV file is empty.']);
        return;
      }

      // Check header
      const headerLine = lines[0].replace(/^\uFEFF/, '').trim();
      const normalizedHeader = headerLine.replace(/\s+/g, '').toLowerCase();
      if (normalizedHeader !== 'employeeid,name,department,salary') {
        setUploadErrors([
          `Invalid CSV Header. Expected 'employeeId,name,department,salary' but found '${headerLine}'.`,
        ]);
        return;
      }

      const parsedRecords: Employee[] = [];
      const errors: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const parts = line.split(',');
        if (parts.length !== 4) {
          errors.push(`Line ${i + 1}: Expected 4 columns, found ${parts.length}.`);
          continue;
        }

        const idStr = parts[0].trim();
        const name = parts[1].trim();
        const dept = parts[2].trim();
        const salaryStr = parts[3].trim();

        const idNum = parseInt(idStr, 10);
        const salaryNum = parseFloat(salaryStr);

        if (isNaN(idNum) || idNum <= 0) {
          errors.push(`Line ${i + 1}: Invalid employeeId '${idStr}'. Must be positive integer.`);
        }
        if (!name || name.length < 2) {
          errors.push(`Line ${i + 1}: Invalid name '${name}'. Must be at least 2 characters.`);
        }
        if (!dept) {
          errors.push(`Line ${i + 1}: Department cannot be empty.`);
        }
        if (isNaN(salaryNum) || salaryNum <= 0) {
          errors.push(`Line ${i + 1}: Invalid salary '${salaryStr}'. Must be positive number.`);
        }

        if (errors.length === 0) {
          parsedRecords.push({
            employeeId: idNum,
            name,
            department: dept,
            salary: salaryNum,
          });
        }
      }

      // Atomic validation check: if even 1 error occurred, rollback
      if (errors.length > 0) {
        setUploadErrors([
          'Atomic Validation Failed: The import was aborted without modifying your data.',
          ...errors.slice(0, 8),
        ]);
        return;
      }

      if (parsedRecords.length === 0) {
        setUploadErrors(['No valid data rows found in CSV.']);
        return;
      }

      // Check for conflicts if overwrite is false
      if (!overwriteDuplicates) {
        const existingIds = new Set(employees.map((e) => e.employeeId));
        const conflictingIds = parsedRecords
          .map((e) => e.employeeId)
          .filter((id) => existingIds.has(id));

        if (conflictingIds.length > 0) {
          setUploadErrors([
            `Import Conflict: Found ${conflictingIds.length} existing employee ID(s) [${conflictingIds.join(
              ', '
            )}]. Enable 'Overwrite duplicates' or remove conflicting records.`,
          ]);
          return;
        }
      }

      // Perform atomic batch import
      if (overwriteDuplicates) {
        const map = new Map<number, Employee>();
        employees.forEach((e) => map.set(e.employeeId, e));
        parsedRecords.forEach((e) => map.set(e.employeeId, e));
        setEmployees(Array.from(map.values()));
      } else {
        setEmployees((prev) => [...prev, ...parsedRecords]);
      }

      showToast(`Successfully imported ${parsedRecords.length} records from ${uploadFile.name}.`);
      setUploadFile(null);
      setUploadErrors([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setActiveTab('employees');
    } catch (err: any) {
      setUploadErrors(['Failed to read file: ' + (err?.message || 'Unknown error')]);
    }
  };

  // =========================================================================
  // Maven Project ZIP Download
  // =========================================================================

  const handleDownloadMavenZip = () => {
    setIsDownloadingZip(true);
    try {
      const filesToArchive = JAVA_PROJECT_FILES.map((f) => ({
        path: `EmployeePayrollAnalyzer/${f.path}`,
        content: f.content,
      }));

      const zipBlob = createZipArchive(filesToArchive);
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'EmployeePayrollAnalyzer.zip');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast('Downloaded complete EmployeePayrollAnalyzer.zip Maven project ready for Tomcat 9!');
    } catch (err) {
      console.error(err);
      showToast('Error generating ZIP archive.', 'error');
    } finally {
      setIsDownloadingZip(false);
    }
  };

  const handleCopyCode = () => {
    if (selectedFile) {
      navigator.clipboard.writeText(selectedFile.content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      showToast(`Copied ${selectedFile.name} to clipboard.`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-sky-100 selection:text-sky-900">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg bg-slate-900 text-white text-sm border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          {toast.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />}
          {toast.type === 'info' && <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />}
          <span className="font-medium">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-white ml-2 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* =========================================================================
          Top Bar Contract (3 Zones, strictly one row)
          Zone 1: Brand title
          Zone 2: 4-5 concise nav links
          Zone 3: 1 primary CTA action
         ========================================================================= */}
      <header className="sticky top-0 z-40 bg-[#0b192c] text-white border-b border-slate-800 px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 whitespace-nowrap shrink-0">
            <span className="font-bold tracking-tight text-base sm:text-lg text-white">
              Employee Payroll Analyzer
            </span>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 text-xs font-semibold bg-sky-950 text-sky-400 border border-sky-800 rounded">
              Tomcat 9 · Java 8
            </span>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'dashboard' ? 'text-sky-400 font-semibold' : ''
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('employees')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'employees' ? 'text-sky-400 font-semibold' : ''
              }`}
            >
              Employees
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'analytics' ? 'text-sky-400 font-semibold' : ''
              }`}
            >
              Salary Analytics
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'search' ? 'text-sky-400 font-semibold' : ''
              }`}
            >
              Search & Range
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'upload' ? 'text-sky-400 font-semibold' : ''
              }`}
            >
              CSV Upload
            </button>
            <button
              onClick={() => setActiveTab('duplicates')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'duplicates' ? 'text-sky-400 font-semibold' : ''
              }`}
            >
              Duplicate Audit {duplicateGroups.length > 0 && `(${duplicateGroups.length})`}
            </button>
          </nav>

          {/* Zone 3: Primary Action CTA */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleDownloadMavenZip}
              disabled={isDownloadingZip}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-md transition-colors shadow-sm whitespace-nowrap shrink-0"
              title="Download entire Maven WAR project ready for Tomcat 9"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Maven ZIP</span>
            </button>
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-md transition-colors shadow-sm whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Employee</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="lg:hidden flex items-center gap-2 overflow-x-auto pt-3 pb-1 border-t border-slate-800 text-xs mt-2 scrollbar-none">
          {(
            [
              ['dashboard', 'Dashboard'],
              ['employees', 'Employees'],
              ['analytics', 'Analytics'],
              ['search', 'Search/Filter'],
              ['upload', 'CSV Upload'],
              ['duplicates', 'Duplicates'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-2.5 py-1 rounded text-xs whitespace-nowrap shrink-0 ${
                activeTab === key
                  ? 'bg-sky-500/20 text-sky-300 font-semibold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      {/* =========================================================================
          Main Workspace Canvas
         ========================================================================= */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* =========================================================================
            TAB 1: DASHBOARD
           ========================================================================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Payroll Executive Dashboard
                </h1>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                  <span>Java 8 Collections</span>
                  <span aria-hidden="true">·</span>
                  <span>Stream API</span>
                  <span aria-hidden="true">·</span>
                  <span>Tomcat 9 Architecture</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCsv}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={handleResetSampleData}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
                  title="Reload initial 6 prompt employees"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Reset Sample Data</span>
                </button>
              </div>
            </div>

            {/* 4 Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 rounded-lg p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Total Employees
                  </span>
                  <Users className="w-4 h-4 text-slate-400" />
                </div>
                <div className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
                  {totalEmployees}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Active headcount in memory
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Total Payroll
                  </span>
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
                  ${totalPayroll.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Via <code className="text-slate-700 bg-slate-100 px-1 py-0.5 rounded text-[11px]">map().reduce()</code>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Average Salary
                  </span>
                  <TrendingUp className="w-4 h-4 text-sky-600" />
                </div>
                <div className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
                  ${Math.round(averageSalary).toLocaleString('en-US')}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Across all {totalEmployees} personnel
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Departments
                  </span>
                  <Building2 className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
                  {departmentCount}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Via <code className="text-slate-700 bg-slate-100 px-1 py-0.5 rounded text-[11px]">distinct().count()</code>
                </div>
              </div>
            </div>

            {/* Department Breakdown Table */}
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    Department-wise Salary & Headcount Summary
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Computed via <code className="text-slate-700">Collectors.groupingBy()</code>,{' '}
                    <code className="text-slate-700">averagingDouble()</code>, and{' '}
                    <code className="text-slate-700">maxBy()</code>
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className="text-xs font-medium text-sky-600 hover:text-sky-700 flex items-center gap-1"
                >
                  <span>Detailed Analytics</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="px-5 py-3">Department</th>
                      <th className="px-5 py-3 text-right">Headcount</th>
                      <th className="px-5 py-3 text-right">Average Salary</th>
                      <th className="px-5 py-3 text-right">Total Expenditure</th>
                      <th className="px-5 py-3">Highest-Paid Employee</th>
                      <th className="px-5 py-3 text-right">% of Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {departmentSummaries.map((dept) => (
                      <tr key={dept.department} className="hover:bg-slate-50/75 transition-colors">
                        <td className="px-5 py-3.5 font-medium text-slate-900 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-sky-500" />
                          <span>{dept.department}</span>
                        </td>
                        <td className="px-5 py-3.5 text-right font-mono tabular-nums text-slate-700">
                          {dept.count}
                        </td>
                        <td className="px-5 py-3.5 text-right font-mono tabular-nums font-medium text-slate-900">
                          ${Math.round(dept.averageSalary).toLocaleString('en-US')}
                        </td>
                        <td className="px-5 py-3.5 text-right font-mono tabular-nums text-slate-700">
                          ${dept.totalSalary.toLocaleString('en-US')}
                        </td>
                        <td className="px-5 py-3.5 text-slate-800">
                          {dept.highestPaidEmployee ? (
                            <span className="inline-flex items-center gap-1.5">
                              <span className="font-medium text-slate-900">
                                {dept.highestPaidEmployee.name}
                              </span>
                              <span className="text-xs text-slate-500 font-mono tabular-nums">
                                (${dept.highestPaidEmployee.salary.toLocaleString('en-US')})
                              </span>
                            </span>
                          ) : (
                            <span className="text-slate-400">None</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right font-mono tabular-nums text-slate-600 text-xs">
                          {dept.payrollShare.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Employees Table */}
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    Active Workforce Roster ({totalEmployees} records)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Latest registered employees in the in-memory service
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('employees')}
                  className="text-xs font-medium text-sky-600 hover:text-sky-700 flex items-center gap-1"
                >
                  <span>Manage All</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="px-5 py-3">Employee ID</th>
                      <th className="px-5 py-3">Full Name</th>
                      <th className="px-5 py-3">Department</th>
                      <th className="px-5 py-3 text-right">Salary</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {employees.slice(0, 6).map((emp) => (
                      <tr key={emp.employeeId} className="hover:bg-slate-50/75 transition-colors">
                        <td className="px-5 py-3 font-mono tabular-nums text-slate-600">
                          #{emp.employeeId}
                        </td>
                        <td className="px-5 py-3 font-medium text-slate-900">{emp.name}</td>
                        <td className="px-5 py-3 text-slate-700">
                          <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                            {emp.department}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right font-mono tabular-nums font-medium text-slate-900">
                          ${emp.salary.toLocaleString('en-US')}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditModal(emp)}
                              className="px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteEmployee(emp)}
                              className="px-2 py-1 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: EMPLOYEE MANAGEMENT (CRUD, Sorting)
           ========================================================================= */}
        {activeTab === 'employees' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Employee Management
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Perform full CRUD operations, multi-attribute sorting, and server validation checks.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCsv}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={handleOpenAddModal}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Employee</span>
                </button>
              </div>
            </div>

            {/* Sorting bar & Summary */}
            <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span className="font-semibold text-slate-700">Sort Roster By:</span>
                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-md">
                  {(
                    [
                      ['name', 'Full Name'],
                      ['salary', 'Salary'],
                      ['employeeId', 'Employee ID'],
                      ['department', 'Department'],
                    ] as const
                  ).map(([field, label]) => (
                    <button
                      key={field}
                      onClick={() => {
                        if (sortField === field) {
                          setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
                        } else {
                          setSortField(field);
                          setSortOrder('asc');
                        }
                      }}
                      className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                        sortField === field
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {label} {sortField === field && (sortOrder === 'asc' ? '▲' : '▼')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-xs text-slate-500 font-mono tabular-nums">
                Showing {sortedEmployees.length} registered personnel
              </div>
            </div>

            {/* Employee Table */}
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="px-5 py-3">ID</th>
                      <th className="px-5 py-3">Full Name</th>
                      <th className="px-5 py-3">Department</th>
                      <th className="px-5 py-3 text-right">Monthly Salary</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sortedEmployees.map((emp) => (
                      <tr key={emp.employeeId} className="hover:bg-slate-50/75 transition-colors">
                        <td className="px-5 py-3.5 font-mono tabular-nums text-slate-600 font-medium">
                          #{emp.employeeId}
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-slate-900">{emp.name}</td>
                        <td className="px-5 py-3.5">
                          <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                            {emp.department}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right font-mono tabular-nums font-semibold text-slate-900">
                          ${emp.salary.toLocaleString('en-US')}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => handleOpenEditModal(emp)}
                              className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded transition-colors inline-flex items-center gap-1"
                            >
                              <Edit3 className="w-3 h-3 text-slate-500" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteEmployee(emp)}
                              className="px-2.5 py-1 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded transition-colors inline-flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3 text-rose-500" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {sortedEmployees.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                          <div className="text-base font-semibold text-slate-800">
                            No employees in roster
                          </div>
                          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                            Click "+ Add Employee" or use the CSV Upload feature to populate the system.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: SALARY ANALYTICS (Stream API Grouping, MaxBy, Averaging)
           ========================================================================= */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Salary Analytics & Functional Aggregations
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Multi-dimensional payroll aggregation powered entirely by the Java 8 Streams API.
              </p>
            </div>

            {/* Department Breakdown Matrix */}
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200">
                <h2 className="text-base font-semibold text-slate-900">
                  Departmental Salary Benchmark Matrix
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Calculates average salary, highest-paid employee, total salary expenditure, and employee count.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="px-5 py-3">Department</th>
                      <th className="px-5 py-3 text-right">Headcount</th>
                      <th className="px-5 py-3 text-right">Average Salary</th>
                      <th className="px-5 py-3 text-right">Total Expenditure</th>
                      <th className="px-5 py-3 text-right">% of Total Payroll</th>
                      <th className="px-5 py-3">Highest-Paid Employee</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {departmentSummaries.map((item) => (
                      <tr key={item.department} className="hover:bg-slate-50/75 transition-colors">
                        <td className="px-5 py-3.5 font-bold text-slate-900">
                          {item.department}
                        </td>
                        <td className="px-5 py-3.5 text-right font-mono tabular-nums text-slate-700">
                          {item.count}
                        </td>
                        <td className="px-5 py-3.5 text-right font-mono tabular-nums font-semibold text-slate-900">
                          ${Math.round(item.averageSalary).toLocaleString('en-US')}
                        </td>
                        <td className="px-5 py-3.5 text-right font-mono tabular-nums text-slate-700">
                          ${item.totalSalary.toLocaleString('en-US')}
                        </td>
                        <td className="px-5 py-3.5 text-right font-mono tabular-nums text-slate-600 text-xs">
                          {item.payrollShare.toFixed(1)}%
                        </td>
                        <td className="px-5 py-3.5">
                          {item.highestPaidEmployee ? (
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-900">
                                {item.highestPaidEmployee.name}
                              </span>
                              <span className="text-xs text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-mono tabular-nums">
                                ${item.highestPaidEmployee.salary.toLocaleString('en-US')}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Visual Salary Distribution Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {departmentSummaries.map((item) => (
                <div key={item.department} className="bg-white border border-slate-200 rounded-lg p-5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-base text-slate-900">{item.department}</span>
                    <span className="text-xs text-slate-500 font-mono tabular-nums">
                      {item.count} {item.count === 1 ? 'employee' : 'employees'}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Average Salary:</span>
                      <span className="font-mono font-semibold text-slate-900">
                        ${Math.round(item.averageSalary).toLocaleString('en-US')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Department Total:</span>
                      <span className="font-mono text-slate-800">
                        ${item.totalSalary.toLocaleString('en-US')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Top Earner:</span>
                      <span className="font-medium text-slate-900">
                        {item.highestPaidEmployee ? item.highestPaidEmployee.name : '—'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                      <span>Payroll Share</span>
                      <span className="font-mono">{item.payrollShare.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-sky-600 h-1.5 rounded-full"
                        style={{ width: `${Math.min(item.payrollShare, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Academic Java 8 Explanation Box */}
            <div className="bg-slate-900 text-white rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-sky-400" />
                <h3 className="text-base font-semibold">Java 8 Functional Pipeline Verification</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                As required by Section 4 of the project specifications, the backend implementation uses the following exact functional stream operations in <code className="text-sky-300 font-mono">EmployeeService.java</code>:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                <div className="bg-slate-800/80 p-3 rounded border border-slate-700">
                  <span className="text-slate-400 block mb-1">// Average salary by department:</span>
                  <span className="text-sky-300">
                    employees.stream().collect(Collectors.groupingBy(Employee::getDepartment, Collectors.averagingDouble(Employee::getSalary)))
                  </span>
                </div>
                <div className="bg-slate-800/80 p-3 rounded border border-slate-700">
                  <span className="text-slate-400 block mb-1">// Highest-paid employee per department:</span>
                  <span className="text-emerald-300">
                    employees.stream().collect(Collectors.groupingBy(Employee::getDepartment, Collectors.maxBy(Comparator.comparingDouble(Employee::getSalary))))
                  </span>
                </div>
                <div className="bg-slate-800/80 p-3 rounded border border-slate-700">
                  <span className="text-slate-400 block mb-1">// Total payroll expenditure via reduce:</span>
                  <span className="text-amber-300">
                    employees.stream().map(Employee::getSalary).reduce(0.0, Double::sum)
                  </span>
                </div>
                <div className="bg-slate-800/80 p-3 rounded border border-slate-700">
                  <span className="text-slate-400 block mb-1">// Distinct departments sorted:</span>
                  <span className="text-purple-300">
                    employees.stream().map(Employee::getDepartment).distinct().sorted().collect(Collectors.toList())
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 4: SEARCH & SALARY RANGE FILTER
           ========================================================================= */}
        {activeTab === 'search' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Search & Salary Range Filter
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Filter employees by keyword (ID or name) and specify minimum and maximum salary thresholds.
              </p>
            </div>

            {/* Filter controls */}
            <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Keyword Search (ID or Name)
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="e.g. Rahul, IT, or 101"
                      className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-md outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Min Salary ($)
                  </label>
                  <input
                    type="number"
                    step="1000"
                    value={minSalary}
                    onChange={(e) => setMinSalary(e.target.value)}
                    placeholder="e.g. 45000"
                    className="w-full px-3 py-2 text-sm font-mono bg-white border border-slate-200 rounded-md outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Max Salary ($)
                  </label>
                  <input
                    type="number"
                    step="1000"
                    value={maxSalary}
                    onChange={(e) => setMaxSalary(e.target.value)}
                    placeholder="e.g. 60000"
                    className="w-full px-3 py-2 text-sm font-mono bg-white border border-slate-200 rounded-md outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="text-xs text-slate-500 font-mono tabular-nums">
                  {filteredEmployees.length} record(s) matched filter criteria
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setMinSalary('');
                      setMaxSalary('');
                    }}
                    className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                  >
                    Reset Filters
                  </button>
                  <button
                    onClick={() => {
                      setMinSalary('45000');
                      setMaxSalary('60000');
                    }}
                    className="px-3 py-1.5 text-xs font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-md transition-colors"
                  >
                    Preset: $45K – $60K
                  </button>
                </div>
              </div>
            </div>

            {/* Results Table */}
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="px-5 py-3">ID</th>
                      <th className="px-5 py-3">Full Name</th>
                      <th className="px-5 py-3">Department</th>
                      <th className="px-5 py-3 text-right">Salary</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredEmployees.map((emp) => (
                      <tr key={emp.employeeId} className="hover:bg-slate-50/75 transition-colors">
                        <td className="px-5 py-3 font-mono tabular-nums text-slate-600">
                          #{emp.employeeId}
                        </td>
                        <td className="px-5 py-3 font-semibold text-slate-900">{emp.name}</td>
                        <td className="px-5 py-3 text-slate-700">
                          <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                            {emp.department}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right font-mono tabular-nums font-semibold text-slate-900">
                          ${emp.salary.toLocaleString('en-US')}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditModal(emp)}
                              className="px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteEmployee(emp)}
                              className="px-2 py-1 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredEmployees.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                          <div className="text-base font-semibold text-slate-800">
                            No employees matched your criteria
                          </div>
                          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                            No employee records were found for the query or salary range specified. Try widening your salary boundaries or clearing keyword filters.
                          </p>
                          <button
                            onClick={() => {
                              setSearchQuery('');
                              setMinSalary('');
                              setMaxSalary('');
                            }}
                            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors"
                          >
                            Reset All Filters
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 5: CSV UPLOAD (Atomic Validation, 1 MB Limit, UTF-8)
           ========================================================================= */}
        {activeTab === 'upload' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Batch CSV Data Import
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Upload UTF-8 encoded CSV files up to 1 MB with atomic validation and transactional safety.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadSampleCsv}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-md transition-colors shadow-sm"
                  title="Download a ready-to-upload sample CSV with 6 new employees"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Sample CSV File</span>
                </button>
              </div>
            </div>

            {uploadErrors.length > 0 && (
              <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 text-xs text-rose-800 space-y-1">
                <div className="font-semibold flex items-center gap-1.5 text-rose-900">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>Validation or Import Error</span>
                </div>
                {uploadErrors.map((err, idx) => (
                  <div key={idx} className="ml-5">
                    • {err}
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Uploader */}
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg p-6 space-y-5">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-900">
                    Select CSV File
                  </label>
                  <div className="border-2 border-dashed border-slate-300 hover:border-sky-500 rounded-lg p-6 text-center cursor-pointer transition-colors bg-slate-50/50">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,text/csv"
                      onChange={handleFileChange}
                      className="hidden"
                      id="csv-file-input"
                    />
                    <label htmlFor="csv-file-input" className="cursor-pointer block">
                      <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <div className="text-sm font-medium text-slate-800">
                        {uploadFile ? uploadFile.name : 'Click to browse or drag and drop'}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        UTF-8 CSV format only · Maximum file size 1 MB
                      </div>
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={overwriteDuplicates}
                      onChange={(e) => setOverwriteDuplicates(e.target.checked)}
                      className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                    />
                    <span className="text-xs font-medium text-slate-800">
                      Overwrite existing records if duplicate Employee ID is encountered
                    </span>
                  </label>
                  <p className="text-[11px] text-slate-500 ml-5">
                    If left unchecked, conflicting IDs cause an immediate rollback to avoid partial or corrupted modifications.
                  </p>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={handleProcessUpload}
                    disabled={!uploadFile}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-md transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Process & Import CSV</span>
                  </button>

                  <button
                    onClick={() => {
                      const sampleCsvContent = `employeeId,name,department,salary
107,Deepak,IT,58000
108,Meera,Finance,61000
109,Arjun,HR,49000`;
                      const blob = new Blob([sampleCsvContent], { type: 'text/csv' });
                      const mockFile = new File([blob], 'new_batch_employees.csv', {
                        type: 'text/csv',
                      });
                      setUploadFile(mockFile);
                      setUploadErrors([]);
                      showToast('Loaded demo batch CSV with 3 new records into uploader.');
                    }}
                    className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap"
                  >
                    Load Sample Batch
                  </button>
                </div>
              </div>

              {/* CSV Format Spec */}
              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-lg p-6 space-y-4 text-xs text-slate-600">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-slate-500" />
                  <span>Required CSV Format Specification</span>
                </h3>
                <p>
                  The first line must contain the exact column headers:
                </p>
                <div className="bg-slate-900 text-slate-100 p-3 rounded font-mono text-[11px] overflow-x-auto">
                  employeeId,name,department,salary
                  <br />
                  107,Deepak Verma,IT,58000
                  <br />
                  108,Meera Nair,Finance,62000
                  <br />
                  109,Arjun Sharma,HR,49000
                  <br />
                  110,Kavita Patel,IT,72000
                  <br />
                  111,Rohan Mehta,Marketing,53000
                  <br />
                  112,Sunita Rao,Finance,68000
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadSampleCsv}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>Download This CSV</span>
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`employeeId,name,department,salary
107,Deepak Verma,IT,58000
108,Meera Nair,Finance,62000
109,Arjun Sharma,HR,49000
110,Kavita Patel,IT,72000
111,Rohan Mehta,Marketing,53000
112,Sunita Rao,Finance,68000`);
                      showToast('Copied sample CSV content to clipboard!');
                    }}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy Text</span>
                  </button>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <div className="font-semibold text-slate-800">Atomic Validation Guarantee:</div>
                  <p>
                    Every row is inspected prior to updating memory. If any row is missing columns, has a non-numeric salary, or invalid name, the entire upload is rejected cleanly without corrupting the active dataset.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 6: DUPLICATE DETECTION & PURGE
           ========================================================================= */}
        {activeTab === 'duplicates' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Data Integrity & Duplicate Records Audit
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Identify conflicting records by Employee ID and resolve them safely without silent data loss.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleInjectDuplicate}
                  className="px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-md transition-colors"
                  title="Inject test duplicate to see how detection works"
                >
                  + Inject Test Duplicate
                </button>
                {duplicateGroups.length > 0 && (
                  <button
                    onClick={handlePurgeDuplicates}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-md transition-colors shadow-sm"
                  >
                    Purge All Duplicates
                  </button>
                )}
              </div>
            </div>

            {duplicateGroups.length > 0 ? (
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-xs text-amber-900 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      Found <strong>{duplicateGroups.length}</strong> conflicting Employee ID(s). Review each entry below before purging redundant occurrences.
                    </span>
                  </div>
                </div>

                {duplicateGroups.map(({ id, records }) => (
                  <div
                    key={id}
                    className="bg-white border border-slate-200 rounded-lg overflow-hidden"
                  >
                    <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                      <div className="font-semibold text-sm text-slate-900">
                        Conflicting Employee ID #{id} ({records.length} occurrences)
                      </div>
                      <span className="text-xs text-rose-600 font-semibold bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                        Duplicate Detected
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="bg-slate-50/50 text-xs font-semibold text-slate-500 border-b border-slate-100">
                            <th className="px-5 py-2.5">Occurrence</th>
                            <th className="px-5 py-2.5">Full Name</th>
                            <th className="px-5 py-2.5">Department</th>
                            <th className="px-5 py-2.5 text-right">Salary</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {records.map((rec, idx) => (
                            <tr key={idx} className={idx === 0 ? 'bg-emerald-50/30' : ''}>
                              <td className="px-5 py-3 text-xs font-mono text-slate-600">
                                {idx === 0 ? 'Record #1 (Primary)' : `Record #${idx + 1} (Duplicate)`}
                              </td>
                              <td className="px-5 py-3 font-semibold text-slate-900">{rec.name}</td>
                              <td className="px-5 py-3 text-slate-700">{rec.department}</td>
                              <td className="px-5 py-3 text-right font-mono tabular-nums font-semibold text-slate-900">
                                ${rec.salary.toLocaleString('en-US')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-slate-900">
                  Data Integrity Verified — Zero Duplicates
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  All {totalEmployees} employee records currently have unique Employee IDs. No conflicting records exist in memory.
                </p>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="mt-4 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                >
                  Return to Dashboard
                </button>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 7: JAVA SOURCE CODE, MAVEN ARCHITECTURE & TOMCAT 9 GUIDE
           ========================================================================= */}
        {activeTab === 'code' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Java 8 / Tomcat 9 Maven Project Architecture
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Inspect every Java Servlet, Model, Service, JSP View, and Maven configuration file.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadMavenZip}
                  disabled={isDownloadingZip}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-md transition-colors shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Complete Maven Project (.ZIP)</span>
                </button>
              </div>
            </div>

            {/* Quick terminal guide card */}
            <div className="bg-[#0b192c] text-white rounded-lg p-5 border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Apache Tomcat 9 Deployment Commands
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">Standard WAR Packaging</span>
              </div>
              <div className="bg-black/40 rounded p-3 text-xs font-mono text-sky-300 space-y-1">
                <div># 1. Build the WAR package with Maven</div>
                <div className="text-white">$ cd EmployeePayrollAnalyzer && mvn clean package</div>
                <div className="pt-2 text-slate-400"># 2. Deploy to Apache Tomcat 9 webapps directory</div>
                <div className="text-white">$ cp target/EmployeePayrollAnalyzer.war $CATALINA_HOME/webapps/</div>
                <div className="pt-2 text-slate-400"># 3. Access in browser:</div>
                <div className="text-emerald-400">http://localhost:8080/EmployeePayrollAnalyzer/</div>
              </div>
            </div>

            {/* Interactive File Browser */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* File List */}
              <div className="lg:col-span-4 bg-white border border-slate-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <FolderTree className="w-3.5 h-3.5 text-slate-500" />
                    <span>Project File Tree</span>
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {JAVA_PROJECT_FILES.length} files
                  </span>
                </div>

                <div className="space-y-1 max-h-[600px] overflow-y-auto pr-1">
                  {JAVA_PROJECT_FILES.map((file) => {
                    const isSelected = selectedFile.path === file.path;
                    return (
                      <button
                        key={file.path}
                        onClick={() => setSelectedFile(file)}
                        className={`w-full text-left px-3 py-2 rounded-md text-xs transition-colors flex items-center justify-between ${
                          isSelected
                            ? 'bg-sky-50 text-sky-900 font-semibold border border-sky-200'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="truncate flex items-center gap-2">
                          <FileCode className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{file.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                          {file.category}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Code Viewer */}
              <div className="lg:col-span-8 bg-white border border-slate-200 rounded-lg overflow-hidden">
                <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                      <span>{selectedFile.path}</span>
                      <span className="text-[10px] font-normal px-2 py-0.5 bg-slate-200 text-slate-700 rounded">
                        {selectedFile.category}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {selectedFile.description}
                    </div>
                  </div>

                  <button
                    onClick={handleCopyCode}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded transition-colors shadow-2xs"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>

                {selectedFile.streamConcepts && (
                  <div className="px-5 py-2.5 bg-sky-50/70 border-b border-sky-100 flex flex-wrap items-center gap-1.5 text-[11px]">
                    <span className="font-semibold text-sky-900">Java 8 Concepts Used:</span>
                    {selectedFile.streamConcepts.map((concept) => (
                      <span
                        key={concept}
                        className="px-2 py-0.5 bg-white text-sky-800 border border-sky-200 rounded font-mono"
                      >
                        {concept}
                      </span>
                    ))}
                  </div>
                )}

                <div className="p-4 bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto max-h-[540px]">
                  <pre className="leading-relaxed">
                    <code>{selectedFile.content}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* =========================================================================
          Add / Edit Employee Modal
         ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900">
                {editingEmployee ? `Edit Employee #${editingEmployee.employeeId}` : 'Add New Employee'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="p-6 space-y-4">
              {formErrors.length > 0 && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded text-xs text-rose-800 space-y-1">
                  {formErrors.map((err, i) => (
                    <div key={i}>• {err}</div>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Employee ID
                </label>
                <input
                  type="number"
                  value={formInputs.employeeId}
                  onChange={(e) => setFormInputs({ ...formInputs, employeeId: e.target.value })}
                  disabled={!!editingEmployee}
                  placeholder="e.g. 107"
                  className="w-full px-3 py-2 text-sm font-mono bg-white border border-slate-200 rounded-md outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 disabled:bg-slate-100 disabled:text-slate-500"
                />
                <div className="text-[11px] text-slate-400 mt-1">
                  {editingEmployee ? 'ID is immutable after creation' : 'Must be a unique positive integer'}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formInputs.name}
                  onChange={(e) => setFormInputs({ ...formInputs, name: e.target.value })}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-md outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={formInputs.department}
                  onChange={(e) => setFormInputs({ ...formInputs, department: e.target.value })}
                  placeholder="e.g. IT, HR, Finance, Operations"
                  list="departments-list"
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-md outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
                <datalist id="departments-list">
                  {distinctDepartments.map((dept) => (
                    <option key={dept} value={dept} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Monthly Salary ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formInputs.salary}
                  onChange={(e) => setFormInputs({ ...formInputs, salary: e.target.value })}
                  placeholder="e.g. 52000"
                  className="w-full px-3 py-2 text-sm font-mono bg-white border border-slate-200 rounded-md outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors shadow-sm"
                >
                  {editingEmployee ? 'Update Record' : 'Save Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          Delete Employee Confirmation Modal (in-app non-blocking)
         ========================================================================= */}
      {employeeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-sm w-full overflow-hidden">
            <div className="px-6 pt-5 pb-4">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Delete Employee</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Are you sure you want to delete <strong className="text-slate-900 font-semibold">{employeeToDelete.name}</strong> (ID #{employeeToDelete.employeeId}, {employeeToDelete.department})?
              </p>
              <div className="mt-2 text-[11px] text-rose-600 bg-rose-50 px-2.5 py-1.5 rounded border border-rose-100">
                This record will be immediately removed from all payroll calculations.
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEmployeeToDelete(null)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-md transition-colors shadow-sm"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          Footer
         ========================================================================= */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Employee Payroll Analyzer</span>
            <span>—</span>
            <span>College Engineering Project Deliverable</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Java 8</span>
            <span>·</span>
            <span>Tomcat 9</span>
            <span>·</span>
            <span>Servlets (javax.servlet)</span>
            <span>·</span>
            <span>JSP 2.3</span>
            <span>·</span>
            <span>Maven WAR</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
