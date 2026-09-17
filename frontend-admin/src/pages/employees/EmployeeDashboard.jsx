import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Clock,
  Calendar,
  DollarSign,
  Plus,
  Search,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Edit3,
  UserCheck,
  UserX,
  Briefcase,
  Layers,
  ChevronRight,
  TrendingUp,
  X,
  Send,
  Sparkles,
} from 'lucide-react';
import { employeeApi } from '../../services/employeeApi';

export const EmployeeDashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [payrollRuns, setPayrollRuns] = useState([]);
  const [selectedPayrollRun, setSelectedPayrollRun] = useState(null);

  const [summary, setSummary] = useState({
    totalStaff: 0,
    activeStaff: 0,
    presentToday: 0,
    onLeaveToday: 0,
    monthlySalaryTotal: 0,
  });

  const [activeTab, setActiveTab] = useState('directory'); // 'directory', 'attendance', 'leaves', 'payroll'
  const [deptFilter, setDeptFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notification, setNotification] = useState(null);

  // Modals
  const [showAddEmpModal, setShowAddEmpModal] = useState(false);
  const [editEmpModal, setEditEmpModal] = useState(null);
  const [showClockModal, setShowClockModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showGenPayrollModal, setShowGenPayrollModal] = useState(false);
  const [adjustPayoutModal, setAdjustPayoutModal] = useState(null);

  // Forms
  const [newEmp, setNewEmp] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: 'Kitchen',
    designation: '',
    baseSalary: '',
  });

  const [clockForm, setClockForm] = useState({
    employeeId: '',
    action: 'in', // 'in' or 'out'
  });

  const [leaveForm, setLeaveForm] = useState({
    employeeId: '',
    leaveType: 'Casual',
    startDate: '',
    endDate: '',
    totalDays: 1,
    reason: '',
  });

  const [genPayrollForm, setGenPayrollForm] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  const [adjustForm, setAdjustForm] = useState({
    additions: 0,
    deductions: 0,
    remarks: '',
  });

  const showToast = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const loadData = async () => {
    try {
      setRefreshing(true);
      const [sumRes, empRes, attRes, leaveRes, payRes] = await Promise.all([
        employeeApi.getSummary(),
        employeeApi.getEmployees(),
        employeeApi.getAttendance(),
        employeeApi.getLeaves(),
        employeeApi.getPayrollRuns(),
      ]);

      if (sumRes.success) setSummary(sumRes.data);
      if (empRes.success) setEmployees(empRes.data || []);
      if (attRes.success) setAttendance(attRes.data || []);
      if (leaveRes.success) setLeaves(leaveRes.data || []);
      if (payRes.success) {
        setPayrollRuns(payRes.data || []);
        if (payRes.data?.length > 0 && !selectedPayrollRun) {
          setSelectedPayrollRun(payRes.data[0]);
        }
      }
    } catch (err) {
      console.error('[Employee Load Error]', err);
      showToast('Failed to load employee & HR data', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((e) => {
      const matchDept = deptFilter === 'all' || e.department === deptFilter;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        e.firstName.toLowerCase().includes(q) ||
        e.lastName.toLowerCase().includes(q) ||
        e.employeeCode.toLowerCase().includes(q) ||
        e.designation.toLowerCase().includes(q);
      return matchDept && matchSearch;
    });
  }, [employees, deptFilter, searchQuery]);

  // Action: Add Employee Submit
  const handleCreateEmpSubmit = async (e) => {
    e.preventDefault();
    if (!newEmp.firstName || !newEmp.lastName || !newEmp.email || !newEmp.phone || !newEmp.baseSalary) {
      showToast('Please fill all required employee fields', 'error');
      return;
    }

    try {
      const res = await employeeApi.createEmployee({
        ...newEmp,
        baseSalary: parseFloat(newEmp.baseSalary),
      });

      if (res.success) {
        showToast(`Employee ${res.data.firstName} (${res.data.employeeCode}) onboarded successfully!`);
        setShowAddEmpModal(false);
        setNewEmp({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          department: 'Kitchen',
          designation: '',
          baseSalary: '',
        });
        loadData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Action: Edit Employee & Salary Change Submit
  const handleEditEmpSubmit = async (e) => {
    e.preventDefault();
    if (!editEmpModal) return;

    try {
      const res = await employeeApi.updateEmployee(editEmpModal._id, {
        designation: editEmpModal.designation,
        department: editEmpModal.department,
        baseSalary: parseFloat(editEmpModal.baseSalary),
        phone: editEmpModal.phone,
      });

      if (res.success) {
        showToast(
          res.salaryAuditLogged
            ? `Employee profile updated. Salary change written to Audit Trail!`
            : `Employee profile updated successfully.`
        );
        setEditEmpModal(null);
        loadData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Action: Clock in/out
  const handleClockSubmit = async (e) => {
    e.preventDefault();
    if (!clockForm.employeeId) {
      showToast('Please select an employee', 'error');
      return;
    }

    try {
      let res;
      if (clockForm.action === 'in') {
        res = await employeeApi.clockIn({ employeeId: clockForm.employeeId });
      } else {
        res = await employeeApi.clockOut({ employeeId: clockForm.employeeId });
      }

      if (res.success) {
        showToast(res.message);
        setShowClockModal(false);
        loadData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Action: Submit Leave Request
  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    if (!leaveForm.employeeId || !leaveForm.startDate || !leaveForm.endDate || !leaveForm.reason) {
      showToast('Please fill all required leave application fields', 'error');
      return;
    }

    try {
      const res = await employeeApi.createLeave({
        ...leaveForm,
        totalDays: parseFloat(leaveForm.totalDays) || 1,
      });

      if (res.success) {
        showToast('Leave application submitted for approval');
        setShowLeaveModal(false);
        setLeaveForm({
          employeeId: '',
          leaveType: 'Casual',
          startDate: '',
          endDate: '',
          totalDays: 1,
          reason: '',
        });
        loadData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Action: Approve / Reject Leave
  const handleLeaveStatusUpdate = async (leaveId, status) => {
    try {
      const res = await employeeApi.updateLeaveStatus(leaveId, {
        status,
        adminNotes: `Actioned by Manager on Duty`,
      });

      if (res.success) {
        showToast(`Leave request ${status.toLowerCase()}`);
        loadData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Action: Generate Payroll
  const handleGeneratePayrollSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await employeeApi.generatePayroll({
        month: parseInt(genPayrollForm.month, 10),
        year: parseInt(genPayrollForm.year, 10),
      });

      if (res.success) {
        showToast(`Payroll for ${genPayrollForm.month}/${genPayrollForm.year} calculated successfully!`);
        setShowGenPayrollModal(false);
        setSelectedPayrollRun(res.data);
        loadData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Action: Adjust Bonus/Deduction
  const handleAdjustPayoutSubmit = async (e) => {
    e.preventDefault();
    if (!adjustPayoutModal || !selectedPayrollRun) return;

    try {
      const res = await employeeApi.updatePayoutAdjustment(
        selectedPayrollRun._id,
        adjustPayoutModal.employeeId._id || adjustPayoutModal.employeeId,
        {
          additions: parseFloat(adjustForm.additions) || 0,
          deductions: parseFloat(adjustForm.deductions) || 0,
          remarks: adjustForm.remarks,
        }
      );

      if (res.success) {
        showToast('Payout adjustment recorded');
        setAdjustPayoutModal(null);
        setSelectedPayrollRun(res.data);
        loadData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Action: Update Payroll Status (Approve / Disburse)
  const handleUpdatePayrollStatus = async (status) => {
    if (!selectedPayrollRun) return;

    try {
      const res = await employeeApi.updatePayrollStatus(selectedPayrollRun._id, { status });
      if (res.success) {
        showToast(
          status === 'Paid'
            ? `Payroll disbursed! ₹${selectedPayrollRun.totalDisbursement?.toLocaleString('en-IN')} paid to staff with audit trail logged.`
            : `Payroll approved successfully.`
        );
        setSelectedPayrollRun(res.data);
        loadData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="emp-container">
      {/* Toast Notification */}
      {notification && (
        <div className={`emp-toast ${notification.type}`}>
          {notification.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Header */}
      <div className="emp-header">
        <div>
          <div className="emp-badge-tag">SRS §8–§10 HR & Payroll Subsystem</div>
          <h1 className="emp-title">Employee, Attendance & Payroll</h1>
          <p className="emp-subtitle">
            Manage café staff roster, track shift clock-in/out, action leave approvals, and disburse monthly payroll.
          </p>
        </div>

        <div className="emp-header-actions">
          <button className="emp-btn secondary" onClick={loadData} disabled={refreshing}>
            <RotateCcw size={16} className={refreshing ? 'spin-icon' : ''} />
            <span>Refresh</span>
          </button>
          <button className="emp-btn outline" onClick={() => setShowClockModal(true)}>
            <Clock size={16} />
            <span>Clock In / Out</span>
          </button>
          <button className="emp-btn primary" onClick={() => setShowAddEmpModal(true)}>
            <Plus size={16} />
            <span>+ Add Employee</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="emp-kpi-grid">
        <div className="emp-kpi-card">
          <div className="kpi-icon-box blue">
            <Users size={22} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Active Staff</span>
            <span className="kpi-value">{summary.activeStaff}</span>
          </div>
        </div>

        <div className="emp-kpi-card">
          <div className="kpi-icon-box emerald">
            <UserCheck size={22} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Present Today</span>
            <span className="kpi-value">{summary.presentToday}</span>
          </div>
        </div>

        <div className="emp-kpi-card">
          <div className="kpi-icon-box amber">
            <Calendar size={22} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">On Leave Today</span>
            <span className="kpi-value">{summary.onLeaveToday}</span>
          </div>
        </div>

        <div className="emp-kpi-card">
          <div className="kpi-icon-box purple">
            <DollarSign size={22} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Monthly Payroll Base</span>
            <span className="kpi-value">₹{summary.monthlySalaryTotal?.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="emp-tabs-bar">
        <div className="emp-tabs-left">
          <button
            className={`emp-tab-btn ${activeTab === 'directory' ? 'active' : ''}`}
            onClick={() => setActiveTab('directory')}
          >
            <Users size={16} />
            <span>Staff Directory ({employees.length})</span>
          </button>

          <button
            className={`emp-tab-btn ${activeTab === 'attendance' ? 'active' : ''}`}
            onClick={() => setActiveTab('attendance')}
          >
            <Clock size={16} />
            <span>Attendance & Shifts ({attendance.length})</span>
          </button>

          <button
            className={`emp-tab-btn ${activeTab === 'leaves' ? 'active' : ''}`}
            onClick={() => setActiveTab('leaves')}
          >
            <Calendar size={16} />
            <span>Leave Requests ({leaves.length})</span>
            {leaves.filter((l) => l.status === 'Pending').length > 0 && (
              <span className="tab-pill-alert">{leaves.filter((l) => l.status === 'Pending').length}</span>
            )}
          </button>

          <button
            className={`emp-tab-btn ${activeTab === 'payroll' ? 'active' : ''}`}
            onClick={() => setActiveTab('payroll')}
          >
            <DollarSign size={16} />
            <span>Monthly Payroll ({payrollRuns.length})</span>
          </button>
        </div>

        {activeTab === 'directory' && (
          <div className="emp-search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search staff, designation, code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* TAB 1: STAFF DIRECTORY */}
      {activeTab === 'directory' && (
        <div className="emp-table-card">
          <div className="dept-filter-row">
            {['all', 'Kitchen', 'Service/Floor', 'Management', 'Inventory', 'Accounts'].map((d) => (
              <button
                key={d}
                className={`dept-chip ${deptFilter === d ? 'active' : ''}`}
                onClick={() => setDeptFilter(d)}
              >
                {d === 'all' ? 'All Departments' : d}
              </button>
            ))}
          </div>

          <div className="table-responsive">
            <table className="emp-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Staff Member</th>
                  <th>Department & Role</th>
                  <th>Base Salary</th>
                  <th>Joined Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((e) => (
                  <tr key={e._id} className="emp-row">
                    <td className="font-mono font-bold emp-code-cell">{e.employeeCode}</td>
                    <td>
                      <div className="emp-identity">
                        <strong>
                          {e.firstName} {e.lastName}
                        </strong>
                        <span className="text-muted text-xs">{e.email}</span>
                      </div>
                    </td>
                    <td>
                      <div className="emp-role-meta">
                        <span className="role-title">{e.designation}</span>
                        <span className="dept-sub">{e.department}</span>
                      </div>
                    </td>
                    <td className="font-mono font-bold text-white">
                      ₹{e.baseSalary?.toLocaleString('en-IN')}/mo
                    </td>
                    <td className="text-muted text-xs">
                      {new Date(e.dateOfJoining).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td>
                      <span className={`emp-status-pill ${e.status.toLowerCase().replace(' ', '-')}`}>
                        {e.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="action-buttons-row">
                        <button
                          className="action-pill-btn neutral"
                          onClick={() => setEditEmpModal(e)}
                          title="Edit role or salary (audited)"
                        >
                          <Edit3 size={13} />
                          <span>Edit / Salary</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ATTENDANCE & SHIFTS */}
      {activeTab === 'attendance' && (
        <div className="emp-table-card">
          <div className="table-responsive">
            <table className="emp-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Staff Member</th>
                  <th>Department</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Working Hours</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((a) => {
                  const emp =
                    typeof a.employeeId === 'object'
                      ? a.employeeId
                      : employees.find((e) => e._id === a.employeeId);
                  return (
                    <tr key={a._id}>
                      <td className="font-mono text-muted">{a.date}</td>
                      <td>
                        <strong>
                          {emp?.firstName} {emp?.lastName}
                        </strong>
                        <span className="text-muted text-xs font-mono block">{emp?.employeeCode}</span>
                      </td>
                      <td>{emp?.department}</td>
                      <td className="font-mono">
                        {a.checkIn
                          ? new Date(a.checkIn).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '—'}
                      </td>
                      <td className="font-mono">
                        {a.checkOut
                          ? new Date(a.checkOut).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : <span className="text-amber font-semibold">On Shift</span>}
                      </td>
                      <td className="font-mono font-bold">
                        {a.workingHours > 0 ? `${a.workingHours} hrs` : '—'}
                      </td>
                      <td>
                        <span className={`att-status-pill ${a.status.toLowerCase()}`}>{a.status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: LEAVE REQUESTS */}
      {activeTab === 'leaves' && (
        <div className="leaves-container">
          <div className="leaves-header-actions">
            <div>
              <h3>Leave Applications & Approvals</h3>
              <p className="text-muted text-sm">Review staff leave requests and record management decisions.</p>
            </div>
            <button className="emp-btn primary" onClick={() => setShowLeaveModal(true)}>
              <Plus size={16} /> Apply for Leave
            </button>
          </div>

          <div className="leaves-grid">
            {leaves.map((l) => {
              const emp =
                typeof l.employeeId === 'object'
                  ? l.employeeId
                  : employees.find((e) => e._id === l.employeeId);
              return (
                <div key={l._id} className="leave-card">
                  <div className="leave-card-header">
                    <div>
                      <span className="font-mono text-xs text-primary">{emp?.employeeCode}</span>
                      <h4 className="leave-emp-name">
                        {emp?.firstName} {emp?.lastName}
                      </h4>
                      <span className="text-muted text-xs">{emp?.designation}</span>
                    </div>
                    <span className={`leave-status-pill ${l.status.toLowerCase()}`}>{l.status}</span>
                  </div>

                  <div className="leave-card-body">
                    <div className="leave-meta-row">
                      <span>Leave Type:</span>
                      <strong className="text-amber">{l.leaveType} Leave</strong>
                    </div>
                    <div className="leave-meta-row">
                      <span>Duration:</span>
                      <strong>
                        {new Date(l.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} to{' '}
                        {new Date(l.endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} (
                        {l.totalDays} days)
                      </strong>
                    </div>
                    <div className="leave-reason-box">
                      <span className="text-xs text-muted">Reason:</span>
                      <p className="text-sm">{l.reason}</p>
                    </div>
                  </div>

                  {l.status === 'Pending' && (
                    <div className="leave-card-footer">
                      <button
                        className="leave-action-btn reject"
                        onClick={() => handleLeaveStatusUpdate(l._id, 'Rejected')}
                      >
                        <XCircle size={14} /> Reject
                      </button>
                      <button
                        className="leave-action-btn approve"
                        onClick={() => handleLeaveStatusUpdate(l._id, 'Approved')}
                      >
                        <CheckCircle2 size={14} /> Approve
                      </button>
                    </div>
                  )}

                  {l.status !== 'Pending' && l.adminNotes && (
                    <div className="leave-admin-notes">
                      <span className="text-xs text-muted">Notes: {l.adminNotes}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: PAYROLL & SALARY DISBURSEMENT (MONEY-TOUCHING) */}
      {activeTab === 'payroll' && (
        <div className="payroll-container">
          <div className="payroll-top-bar">
            <div className="payroll-runs-selector">
              <span className="text-muted text-sm font-semibold">Select Payroll Run:</span>
              <div className="payroll-chip-group">
                {payrollRuns.map((r) => (
                  <button
                    key={r._id}
                    className={`payroll-run-chip ${selectedPayrollRun?._id === r._id ? 'active' : ''}`}
                    onClick={() => setSelectedPayrollRun(r)}
                  >
                    <span>
                      {new Date(r.year, r.month - 1).toLocaleDateString('en-IN', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <span className={`run-status-dot ${r.status.toLowerCase()}`}>{r.status}</span>
                  </button>
                ))}
              </div>
            </div>

            <button className="emp-btn primary" onClick={() => setShowGenPayrollModal(true)}>
              <Sparkles size={16} /> Generate Monthly Payroll
            </button>
          </div>

          {selectedPayrollRun && (
            <div className="payroll-run-card">
              <div className="run-card-header">
                <div>
                  <div className="emp-badge-tag">
                    {new Date(selectedPayrollRun.year, selectedPayrollRun.month - 1).toLocaleDateString('en-IN', {
                      month: 'long',
                      year: 'numeric',
                    })}{' '}
                    Payroll
                  </div>
                  <h2>
                    Total Net Disbursement: ₹
                    {selectedPayrollRun.totalDisbursement?.toLocaleString('en-IN')}
                  </h2>
                  <span className="text-muted text-sm">
                    {selectedPayrollRun.payouts?.length || 0} Staff Members Included
                  </span>
                </div>

                <div className="run-card-actions">
                  <span className={`run-large-status-pill ${selectedPayrollRun.status.toLowerCase()}`}>
                    Status: {selectedPayrollRun.status.toUpperCase()}
                  </span>

                  {selectedPayrollRun.status === 'Draft' && (
                    <button
                      className="emp-btn primary"
                      onClick={() => handleUpdatePayrollStatus('Approved')}
                    >
                      <CheckCircle2 size={16} /> Approve Run
                    </button>
                  )}

                  {selectedPayrollRun.status === 'Approved' && (
                    <button
                      className="emp-btn primary emerald-action"
                      onClick={() => handleUpdatePayrollStatus('Paid')}
                    >
                      <DollarSign size={16} /> Disburse & Pay Staff
                    </button>
                  )}
                </div>
              </div>

              <div className="table-responsive">
                <table className="emp-table">
                  <thead>
                    <tr>
                      <th>Staff Member</th>
                      <th>Base Salary</th>
                      <th>Bonuses / Additions</th>
                      <th>Deductions</th>
                      <th>Net Payable</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Adjustment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPayrollRun.payouts?.map((p, idx) => {
                      const emp =
                        typeof p.employeeId === 'object'
                          ? p.employeeId
                          : employees.find((e) => e._id === p.employeeId);
                      return (
                        <tr key={idx}>
                          <td>
                            <strong>
                              {emp?.firstName} {emp?.lastName}
                            </strong>
                            <span className="text-muted text-xs block font-mono">{emp?.employeeCode}</span>
                          </td>
                          <td className="font-mono">₹{p.baseSalary?.toLocaleString('en-IN')}</td>
                          <td className="font-mono text-emerald">+₹{p.additions?.toLocaleString('en-IN')}</td>
                          <td className="font-mono text-red">-₹{p.deductions?.toLocaleString('en-IN')}</td>
                          <td className="font-mono font-bold text-white text-base">
                            ₹{p.netSalary?.toLocaleString('en-IN')}
                          </td>
                          <td>
                            <span className={`payout-status-pill ${p.isPaid ? 'paid' : 'pending'}`}>
                              {p.isPaid ? 'DISBURSED' : 'PENDING'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            {selectedPayrollRun.status === 'Draft' && (
                              <button
                                className="action-pill-btn neutral"
                                onClick={() => {
                                  setAdjustPayoutModal(p);
                                  setAdjustForm({
                                    additions: p.additions || 0,
                                    deductions: p.deductions || 0,
                                    remarks: p.remarks || '',
                                  });
                                }}
                              >
                                Adjust
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL: ADD EMPLOYEE */}
      {showAddEmpModal && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-header">
              <div className="modal-title-box">
                <Users size={20} className="text-primary" />
                <h3>Onboard New Café Employee</h3>
              </div>
              <button className="close-btn" onClick={() => setShowAddEmpModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateEmpSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newEmp.firstName}
                      onChange={(e) => setNewEmp({ ...newEmp, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newEmp.lastName}
                      onChange={(e) => setNewEmp({ ...newEmp, lastName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      className="form-control"
                      value={newEmp.email}
                      onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Contact Phone *</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={newEmp.phone}
                      onChange={(e) => setNewEmp({ ...newEmp, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Department *</label>
                    <select
                      className="form-control"
                      value={newEmp.department}
                      onChange={(e) => setNewEmp({ ...newEmp, department: e.target.value })}
                    >
                      <option value="Kitchen">Kitchen</option>
                      <option value="Service/Floor">Service/Floor</option>
                      <option value="Management">Management</option>
                      <option value="Inventory">Inventory</option>
                      <option value="Accounts">Accounts</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Designation *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Senior Barista"
                      value={newEmp.designation}
                      onChange={(e) => setNewEmp({ ...newEmp, designation: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Base Monthly Salary (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control font-mono"
                    placeholder="e.g. 35000"
                    value={newEmp.baseSalary}
                    onChange={(e) => setNewEmp({ ...newEmp, baseSalary: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="emp-btn secondary"
                  onClick={() => setShowAddEmpModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="emp-btn primary">
                  Save & Onboard Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT EMPLOYEE / SALARY CHANGE (AUDITED) */}
      {editEmpModal && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-header">
              <div className="modal-title-box">
                <Edit3 size={20} className="text-primary" />
                <h3>
                  Edit Profile: {editEmpModal.firstName} {editEmpModal.lastName}
                </h3>
              </div>
              <button className="close-btn" onClick={() => setEditEmpModal(null)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditEmpSubmit}>
              <div className="modal-body">
                <div className="salary-audit-alert">
                  <ShieldCheck size={18} className="text-amber" />
                  <p>
                    <strong>Mandatory Audit Trail Notice:</strong> Any changes to this employee's base salary
                    will be permanently recorded in the immutable Audit Log.
                  </p>
                </div>

                <div className="form-group">
                  <label>Designation</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editEmpModal.designation}
                    onChange={(e) => setEditEmpModal({ ...editEmpModal, designation: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Department</label>
                  <select
                    className="form-control"
                    value={editEmpModal.department}
                    onChange={(e) => setEditEmpModal({ ...editEmpModal, department: e.target.value })}
                  >
                    <option value="Kitchen">Kitchen</option>
                    <option value="Service/Floor">Service/Floor</option>
                    <option value="Management">Management</option>
                    <option value="Inventory">Inventory</option>
                    <option value="Accounts">Accounts</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Base Monthly Salary (₹)</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control font-mono"
                    value={editEmpModal.baseSalary}
                    onChange={(e) => setEditEmpModal({ ...editEmpModal, baseSalary: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="emp-btn secondary"
                  onClick={() => setEditEmpModal(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="emp-btn primary">
                  Update & Record Audit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CLOCK IN / OUT */}
      {showClockModal && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-header">
              <div className="modal-title-box">
                <Clock size={20} className="text-primary" />
                <h3>Staff Shift Clock In / Out</h3>
              </div>
              <button className="close-btn" onClick={() => setShowClockModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleClockSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Select Staff Member *</label>
                  <select
                    className="form-control"
                    value={clockForm.employeeId}
                    onChange={(e) => setClockForm({ ...clockForm, employeeId: e.target.value })}
                    required
                  >
                    <option value="">-- Choose Employee --</option>
                    {employees
                      .filter((e) => e.status === 'Active')
                      .map((e) => (
                        <option key={e._id} value={e._id}>
                          {e.firstName} {e.lastName} ({e.employeeCode}) — {e.designation}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Clock Action</label>
                  <div className="clock-action-chips">
                    <button
                      type="button"
                      className={`clock-chip ${clockForm.action === 'in' ? 'active in' : ''}`}
                      onClick={() => setClockForm({ ...clockForm, action: 'in' })}
                    >
                      Clock IN (Start Shift)
                    </button>
                    <button
                      type="button"
                      className={`clock-chip ${clockForm.action === 'out' ? 'active out' : ''}`}
                      onClick={() => setClockForm({ ...clockForm, action: 'out' })}
                    >
                      Clock OUT (End Shift)
                    </button>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="emp-btn secondary"
                  onClick={() => setShowClockModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="emp-btn primary">
                  Confirm Clock {clockForm.action.toUpperCase()}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: APPLY LEAVE */}
      {showLeaveModal && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-header">
              <div className="modal-title-box">
                <Calendar size={20} className="text-primary" />
                <h3>Submit Leave Request</h3>
              </div>
              <button className="close-btn" onClick={() => setShowLeaveModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleLeaveSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Employee *</label>
                  <select
                    className="form-control"
                    value={leaveForm.employeeId}
                    onChange={(e) => setLeaveForm({ ...leaveForm, employeeId: e.target.value })}
                    required
                  >
                    <option value="">-- Choose Employee --</option>
                    {employees.map((e) => (
                      <option key={e._id} value={e._id}>
                        {e.firstName} {e.lastName} ({e.employeeCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Leave Type</label>
                    <select
                      className="form-control"
                      value={leaveForm.leaveType}
                      onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                    >
                      <option value="Casual">Casual Leave</option>
                      <option value="Sick">Sick Leave</option>
                      <option value="Earned">Earned Leave</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Total Days</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      className="form-control"
                      value={leaveForm.totalDays}
                      onChange={(e) => setLeaveForm({ ...leaveForm, totalDays: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Start Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={leaveForm.startDate}
                      onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={leaveForm.endDate}
                      onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Reason *</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="State reason for absence"
                    value={leaveForm.reason}
                    onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="emp-btn secondary"
                  onClick={() => setShowLeaveModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="emp-btn primary">
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: GENERATE PAYROLL */}
      {showGenPayrollModal && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-header">
              <div className="modal-title-box">
                <Sparkles size={20} className="text-primary" />
                <h3>Generate Monthly Payroll Run</h3>
              </div>
              <button className="close-btn" onClick={() => setShowGenPayrollModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleGeneratePayrollSubmit}>
              <div className="modal-body">
                <p className="text-sm text-secondary">
                  Generates prorated monthly salary compensation for all active café staff, factoring in shift
                  attendance records and leave deductions.
                </p>

                <div className="form-row" style={{ marginTop: '14px' }}>
                  <div className="form-group">
                    <label>Payroll Month</label>
                    <select
                      className="form-control"
                      value={genPayrollForm.month}
                      onChange={(e) => setGenPayrollForm({ ...genPayrollForm, month: e.target.value })}
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                        <option key={m} value={m}>
                          {new Date(2026, m - 1).toLocaleString('default', { month: 'long' })}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Payroll Year</label>
                    <input
                      type="number"
                      className="form-control font-mono"
                      value={genPayrollForm.year}
                      onChange={(e) => setGenPayrollForm({ ...genPayrollForm, year: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="emp-btn secondary"
                  onClick={() => setShowGenPayrollModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="emp-btn primary">
                  Compute Payroll Run
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADJUST PAYOUT (BONUS / DEDUCTION) */}
      {adjustPayoutModal && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-header">
              <div className="modal-title-box">
                <DollarSign size={20} className="text-primary" />
                <h3>Adjust Staff Payout</h3>
              </div>
              <button className="close-btn" onClick={() => setAdjustPayoutModal(null)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAdjustPayoutSubmit}>
              <div className="modal-body">
                <div className="payout-summary-box">
                  <span>Base Monthly Salary:</span>
                  <strong className="font-mono">
                    ₹{adjustPayoutModal.baseSalary?.toLocaleString('en-IN')}
                  </strong>
                </div>

                <div className="form-row" style={{ marginTop: '14px' }}>
                  <div className="form-group">
                    <label>Additions / Bonus (₹)</label>
                    <input
                      type="number"
                      min="0"
                      className="form-control font-mono text-emerald"
                      value={adjustForm.additions}
                      onChange={(e) => setAdjustForm({ ...adjustForm, additions: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Deductions (₹)</label>
                    <input
                      type="number"
                      min="0"
                      className="form-control font-mono text-red"
                      value={adjustForm.deductions}
                      onChange={(e) => setAdjustForm({ ...adjustForm, deductions: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Remarks</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Festive performance bonus"
                    value={adjustForm.remarks}
                    onChange={(e) => setAdjustForm({ ...adjustForm, remarks: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="emp-btn secondary"
                  onClick={() => setAdjustPayoutModal(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="emp-btn primary">
                  Save Payout Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
