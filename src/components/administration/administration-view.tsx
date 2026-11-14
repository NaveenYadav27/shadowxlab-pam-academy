import React, { useState } from "react";
import {
  Users,
  UserPlus,
  ShieldAlert,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Search,
  Key,
  Server,
  Sliders,
  Check,
  X,
  AlertCircle,
  Database,
  Lock,
} from "lucide-react";
import type { PamState, PamUser, PamUserRole } from "../../lib/pam-engine";

interface AdministrationViewProps {
  state: PamState;
  onAddUser: (input: {
    username: string;
    fullName: string;
    email: string;
    role: PamUserRole;
    department: string;
    groups?: string[];
  }) => { error?: string };
  onUpdateUserRole: (userId: string, newRole: PamUserRole) => { error?: string };
}

export function AdministrationView({
  state,
  onAddUser,
  onUpdateUserRole,
}: AdministrationViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<"users" | "roles" | "permissions" | "system">(
    "users",
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [selectedUserForRoleEdit, setSelectedUserForRoleEdit] = useState<PamUser | null>(null);
  const [modalError, setModalError] = useState("");

  // Add User Form State
  const [newUsername, setNewUsername] = useState("");
  const [newFullName, setNewFullName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<PamUserRole>("Security Operator");
  const [newDepartment, setNewDepartment] = useState("Information Security Operations");

  const users = state.users || [];

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleOpenAdd = () => {
    setNewUsername("");
    setNewFullName("");
    setNewEmail("");
    setNewRole("Security Operator");
    setNewDepartment("Information Security Operations");
    setModalError("");
    setIsAddUserModalOpen(true);
  };

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setModalError("");
    const res = onAddUser({
      username: newUsername,
      fullName: newFullName,
      email: newEmail,
      role: newRole,
      department: newDepartment,
      groups: ["VaultUsers", "Operators"],
    });
    if (res.error) {
      setModalError(res.error);
    } else {
      setIsAddUserModalOpen(false);
    }
  };

  const handleRoleChange = (userId: string, targetRole: PamUserRole) => {
    const res = onUpdateUserRole(userId, targetRole);
    if (res.error) {
      alert(res.error);
    } else {
      setSelectedUserForRoleEdit(null);
    }
  };

  const ROLES_LIST: {
    role: PamUserRole;
    description: string;
    permissions: string[];
    riskLevel: "High" | "Medium" | "Low";
  }[] = [
    {
      role: "PAM Administrator",
      description:
        "Full administrative authority over Vault parameters, master policies, safekeeping infrastructure, and directory sync.",
      permissions: [
        "Manage Safes & Safe Owners",
        "Define Platforms & CPM Policies",
        "User & Role Management",
        "Disaster Recovery Drill",
        "Full Audit Visibility",
      ],
      riskLevel: "High",
    },
    {
      role: "Safe Administrator",
      description:
        "Manages safe provisioning, membership assignments, and account onboarding within designated business divisions.",
      permissions: [
        "Create & Manage Designated Safes",
        "Add & Remove Safe Members",
        "Onboard & Update Accounts",
        "View Safe Activity Logs",
      ],
      riskLevel: "Medium",
    },
    {
      role: "Security Operator",
      description:
        "Day-to-day privileged credential operator. Launches PSM sessions and submits dual-control approval requests.",
      permissions: [
        "List & Retrieve Authorized Secrets",
        "Initiate PSM RDP/SSH Sessions",
        "Submit Check-Out Requests",
        "Perform Account Verifications",
      ],
      riskLevel: "Medium",
    },
    {
      role: "PSM Operator",
      description:
        "Operational specialist managing active remote sessions, shadow monitoring, and session termination.",
      permissions: [
        "Connect Target Sessions",
        "Review Live Keystroke Audits",
        "Terminate Unauthorized Sessions",
      ],
      riskLevel: "Low",
    },
    {
      role: "CPM Operator",
      description:
        "Automated engine or operations engineer dedicated to troubleshooting credential rotation and reconciliation.",
      permissions: [
        "Initiate Immediate Password Changes",
        "Trigger Account Reconciliation",
        "Unlock Locked Credentials",
      ],
      riskLevel: "Medium",
    },
    {
      role: "Auditor",
      description:
        "Read-only compliance officer reviewing forensic audit logs, PSM session recordings, and policy compliance.",
      permissions: [
        "Export Vault Audit Logs",
        "Inspect PSM Keystroke Transcripts",
        "Verify Cryptographic Audit Seals",
      ],
      riskLevel: "Low",
    },
    {
      role: "Learner",
      description:
        "Interactive lab sandbox role restricted to guided training scenarios and self-paced exercises.",
      permissions: [
        "Lab Exercises Participation",
        "Controlled Safe Access",
        "Sample Secret Retrieval",
      ],
      riskLevel: "Low",
    },
  ];

  return (
    <div className="pvwa-layout-container" style={{ padding: "16px 24px", minHeight: "100%" }}>
      {/* Breadcrumb Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 16,
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 11,
              color: "#64748B",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: 4,
            }}
          >
            <span>PAM Administration</span>
            <span>&gt;</span>
            <span style={{ color: "#0078D4", fontWeight: 700 }}>ADMINISTRATION</span>
            <span>&gt;</span>
            <span>Access Control & System Governance</span>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#0F172A", margin: 0 }}>
            Directory, Role Governance & Safe Authorizations
          </h1>
          <p style={{ fontSize: 13, color: "#475569", margin: "4px 0 0 0" }}>
            Administer Vault operators, enforce granular role-based access control (RBAC), and
            review safe authorization matrices.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="pvwa-btn pvwa-btn-primary"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 16px",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <UserPlus size={16} />
          Provision Operator
        </button>
      </div>

      {/* Subnavigation Tabs */}
      <div
        style={{
          display: "flex",
          borderBottom: "2px solid #E2E8F0",
          marginBottom: 16,
          gap: 2,
        }}
      >
        <button
          type="button"
          onClick={() => setActiveSubTab("users")}
          style={{
            padding: "8px 16px",
            fontSize: 13,
            fontWeight: 700,
            border: "none",
            background: activeSubTab === "users" ? "#FFFFFF" : "transparent",
            color: activeSubTab === "users" ? "#0078D4" : "#64748B",
            borderBottom: activeSubTab === "users" ? "2px solid #0078D4" : "2px solid transparent",
            marginBottom: -2,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Users size={15} />
          Directory & Users ({users.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab("roles")}
          style={{
            padding: "8px 16px",
            fontSize: 13,
            fontWeight: 700,
            border: "none",
            background: activeSubTab === "roles" ? "#FFFFFF" : "transparent",
            color: activeSubTab === "roles" ? "#0078D4" : "#64748B",
            borderBottom: activeSubTab === "roles" ? "2px solid #0078D4" : "2px solid transparent",
            marginBottom: -2,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <ShieldCheck size={15} />
          Role Governance ({ROLES_LIST.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab("permissions")}
          style={{
            padding: "8px 16px",
            fontSize: 13,
            fontWeight: 700,
            border: "none",
            background: activeSubTab === "permissions" ? "#FFFFFF" : "transparent",
            color: activeSubTab === "permissions" ? "#0078D4" : "#64748B",
            borderBottom:
              activeSubTab === "permissions" ? "2px solid #0078D4" : "2px solid transparent",
            marginBottom: -2,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Lock size={15} />
          Safe Permissions Matrix
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab("system")}
          style={{
            padding: "8px 16px",
            fontSize: 13,
            fontWeight: 700,
            border: "none",
            background: activeSubTab === "system" ? "#FFFFFF" : "transparent",
            color: activeSubTab === "system" ? "#0078D4" : "#64748B",
            borderBottom: activeSubTab === "system" ? "2px solid #0078D4" : "2px solid transparent",
            marginBottom: -2,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Server size={15} />
          Vault & Cluster Infrastructure
        </button>
      </div>

      {/* SUBTAB 1: USERS & DIRECTORY */}
      {activeSubTab === "users" && (
        <>
          {/* Filter Bar */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #CBD5E1",
              borderRadius: "2px 2px 0 0",
              padding: "10px 16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
              <div style={{ position: "relative", width: 280 }}>
                <Search
                  size={14}
                  style={{
                    position: "absolute",
                    left: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#64748B",
                  }}
                />
                <input
                  type="text"
                  placeholder="Search user, name, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "6px 10px 6px 32px",
                    fontSize: 12,
                    border: "1px solid #CBD5E1",
                    borderRadius: 2,
                    outline: "none",
                  }}
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                style={{
                  padding: "5px 10px",
                  fontSize: 12,
                  border: "1px solid #CBD5E1",
                  borderRadius: 2,
                  background: "#F8FAFC",
                  color: "#1E293B",
                  fontWeight: 500,
                }}
              >
                <option value="ALL">All Roles ({users.length})</option>
                <option value="PAM Administrator">PAM Administrator</option>
                <option value="Safe Administrator">Safe Administrator</option>
                <option value="Security Operator">Security Operator</option>
                <option value="PSM Operator">PSM Operator</option>
                <option value="CPM Operator">CPM Operator</option>
                <option value="Auditor">Auditor</option>
                <option value="Learner">Learner</option>
              </select>
            </div>

            <span style={{ fontSize: 12, color: "#64748B" }}>
              Showing <b>{filteredUsers.length}</b> operators
            </span>
          </div>

          {/* User Table */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #CBD5E1",
              borderTop: "none",
              borderRadius: "0 0 2px 2px",
              overflowX: "auto",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr
                  style={{
                    background: "#F1F5F9",
                    borderBottom: "1px solid #CBD5E1",
                    color: "#334155",
                    textAlign: "left",
                  }}
                >
                  <th style={{ padding: "10px 14px", fontWeight: 700, width: "22%" }}>
                    Operator Identity
                  </th>
                  <th style={{ padding: "10px 14px", fontWeight: 700, width: "18%" }}>
                    Assigned Role
                  </th>
                  <th style={{ padding: "10px 14px", fontWeight: 700, width: "20%" }}>
                    Department / OU
                  </th>
                  <th style={{ padding: "10px 14px", fontWeight: 700, width: "12%" }}>Status</th>
                  <th style={{ padding: "10px 14px", fontWeight: 700, width: "14%" }}>
                    Last Authenticated
                  </th>
                  <th style={{ padding: "10px 14px", fontWeight: 700, textAlign: "right" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    style={{
                      borderBottom: "1px solid #E2E8F0",
                      transition: "background 0.15s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F8FAFC")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <td style={{ padding: "10px 14px" }}>
                      <div style={{ fontWeight: 700, color: "#0078D4" }}>{user.fullName}</div>
                      <div style={{ fontSize: 11, color: "#64748B" }}>
                        <code>{user.username}</code> · {user.email}
                      </div>
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "2px 8px",
                          borderRadius: 2,
                          fontSize: 11,
                          fontWeight: 700,
                          background:
                            user.role === "PAM Administrator"
                              ? "#FEE2E2"
                              : user.role === "Safe Administrator"
                                ? "#FEF3C7"
                                : user.role === "Auditor"
                                  ? "#EDE9FE"
                                  : "#E0F2FE",
                          color:
                            user.role === "PAM Administrator"
                              ? "#991B1B"
                              : user.role === "Safe Administrator"
                                ? "#92400E"
                                : user.role === "Auditor"
                                  ? "#5B21B6"
                                  : "#0369A1",
                        }}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: "10px 14px", color: "#334155" }}>{user.department}</td>
                    <td style={{ padding: "10px 14px" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: 11,
                          fontWeight: 600,
                          color: user.status === "Active" ? "#107C41" : "#B06000",
                        }}
                      >
                        {user.status === "Active" ? (
                          <CheckCircle size={12} />
                        ) : (
                          <AlertCircle size={12} />
                        )}
                        {user.status}
                      </span>
                    </td>
                    <td style={{ padding: "10px 14px", color: "#64748B", fontSize: 11 }}>
                      {user.lastLogin}
                    </td>
                    <td style={{ padding: "10px 14px", textAlign: "right" }}>
                      <button
                        type="button"
                        onClick={() => setSelectedUserForRoleEdit(user)}
                        className="pvwa-btn pvwa-btn-secondary pvwa-btn-sm"
                      >
                        Change Role
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* SUBTAB 2: ROLE GOVERNANCE */}
      {activeSubTab === "roles" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
          {ROLES_LIST.map((r) => (
            <div
              key={r.role}
              style={{
                background: "#FFFFFF",
                border: "1px solid #CBD5E1",
                borderRadius: 2,
                padding: "16px 20px",
                borderLeft:
                  r.riskLevel === "High"
                    ? "4px solid #C5221F"
                    : r.riskLevel === "Medium"
                      ? "4px solid #B06000"
                      : "4px solid #107C41",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 8,
                }}
              >
                <div>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0F172A" }}>
                    {r.role}
                  </h3>
                  <span style={{ fontSize: 11, color: "#64748B" }}>Built-in Security Role</span>
                </div>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    padding: "2px 6px",
                    borderRadius: 2,
                    background:
                      r.riskLevel === "High"
                        ? "#FEE2E2"
                        : r.riskLevel === "Medium"
                          ? "#FEF3C7"
                          : "#E8F5E9",
                    color:
                      r.riskLevel === "High"
                        ? "#991B1B"
                        : r.riskLevel === "Medium"
                          ? "#92400E"
                          : "#107C41",
                  }}
                >
                  {r.riskLevel} Privilege Risk
                </span>
              </div>
              <p style={{ fontSize: 12, color: "#475569", marginBottom: 12, lineHeight: 1.4 }}>
                {r.description}
              </p>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#334155",
                  marginBottom: 6,
                  textTransform: "uppercase",
                }}
              >
                Effective Capabilities:
              </div>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: 18,
                  fontSize: 11,
                  color: "#334155",
                  lineHeight: 1.6,
                }}
              >
                {r.permissions.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* SUBTAB 3: SAFE PERMISSIONS MATRIX */}
      {activeSubTab === "permissions" && (
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #CBD5E1",
            borderRadius: 2,
            overflowX: "auto",
          }}
        >
          <div
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid #CBD5E1",
              background: "#F8FAFC",
            }}
          >
            <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0F172A" }}>
              Enterprise Safe Rights & Authorization Grid
            </h3>
            <p style={{ margin: "2px 0 0 0", fontSize: 11, color: "#64748B" }}>
              Reflects exact rights granted to internal user personas across active business Safes.
            </p>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
            <thead>
              <tr
                style={{
                  background: "#F1F5F9",
                  borderBottom: "1px solid #CBD5E1",
                  color: "#334155",
                  textAlign: "center",
                }}
              >
                <th style={{ padding: "10px 14px", textAlign: "left", width: "20%" }}>
                  User / Persona
                </th>
                <th style={{ padding: "10px 14px", textAlign: "left", width: "18%" }}>
                  Assigned Role
                </th>
                <th style={{ padding: "10px 8px", width: "10%" }}>List Accounts</th>
                <th style={{ padding: "10px 8px", width: "10%" }}>Use (PSM)</th>
                <th style={{ padding: "10px 8px", width: "10%" }}>Retrieve (View)</th>
                <th style={{ padding: "10px 8px", width: "10%" }}>Add / Update</th>
                <th style={{ padding: "10px 8px", width: "10%" }}>Initiate CPM</th>
                <th style={{ padding: "10px 8px", width: "12%" }}>Safe Admin</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isPamAdmin = u.role === "PAM Administrator";
                const isSafeAdmin = u.role === "Safe Administrator";
                const isOperator = u.role === "Security Operator" || u.role === "PSM Operator";
                const isAuditor = u.role === "Auditor";

                return (
                  <tr key={u.id} style={{ borderBottom: "1px solid #E2E8F0" }}>
                    <td
                      style={{
                        padding: "10px 14px",
                        textAlign: "left",
                        fontWeight: 700,
                        color: "#0F172A",
                      }}
                    >
                      {u.fullName}
                      <span
                        style={{
                          display: "block",
                          fontSize: 10,
                          color: "#64748B",
                          fontWeight: 400,
                        }}
                      >
                        {u.username}
                      </span>
                    </td>
                    <td style={{ padding: "10px 14px", textAlign: "left" }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#0078D4" }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: "8px", textAlign: "center" }}>
                      <span
                        style={{
                          color: "#107C41",
                          fontWeight: 700,
                          fontSize: 10,
                          background: "#E8F5E9",
                          padding: "2px 6px",
                          borderRadius: 2,
                        }}
                      >
                        ALLOW
                      </span>
                    </td>
                    <td style={{ padding: "8px", textAlign: "center" }}>
                      {isPamAdmin || isSafeAdmin || isOperator ? (
                        <span
                          style={{
                            color: "#107C41",
                            fontWeight: 700,
                            fontSize: 10,
                            background: "#E8F5E9",
                            padding: "2px 6px",
                            borderRadius: 2,
                          }}
                        >
                          ALLOW
                        </span>
                      ) : (
                        <span style={{ color: "#94A3B8", fontSize: 10 }}>DENY</span>
                      )}
                    </td>
                    <td style={{ padding: "8px", textAlign: "center" }}>
                      {isPamAdmin || isSafeAdmin ? (
                        <span
                          style={{
                            color: "#107C41",
                            fontWeight: 700,
                            fontSize: 10,
                            background: "#E8F5E9",
                            padding: "2px 6px",
                            borderRadius: 2,
                          }}
                        >
                          ALLOW
                        </span>
                      ) : isOperator ? (
                        <span
                          style={{
                            color: "#B06000",
                            fontWeight: 700,
                            fontSize: 10,
                            background: "#FEF3C7",
                            padding: "2px 6px",
                            borderRadius: 2,
                          }}
                        >
                          APPROVAL
                        </span>
                      ) : (
                        <span style={{ color: "#94A3B8", fontSize: 10 }}>DENY</span>
                      )}
                    </td>
                    <td style={{ padding: "8px", textAlign: "center" }}>
                      {isPamAdmin || isSafeAdmin ? (
                        <span
                          style={{
                            color: "#107C41",
                            fontWeight: 700,
                            fontSize: 10,
                            background: "#E8F5E9",
                            padding: "2px 6px",
                            borderRadius: 2,
                          }}
                        >
                          ALLOW
                        </span>
                      ) : (
                        <span style={{ color: "#94A3B8", fontSize: 10 }}>DENY</span>
                      )}
                    </td>
                    <td style={{ padding: "8px", textAlign: "center" }}>
                      {isPamAdmin || u.role === "CPM Operator" ? (
                        <span
                          style={{
                            color: "#107C41",
                            fontWeight: 700,
                            fontSize: 10,
                            background: "#E8F5E9",
                            padding: "2px 6px",
                            borderRadius: 2,
                          }}
                        >
                          ALLOW
                        </span>
                      ) : (
                        <span style={{ color: "#94A3B8", fontSize: 10 }}>DENY</span>
                      )}
                    </td>
                    <td style={{ padding: "8px", textAlign: "center" }}>
                      {isPamAdmin ? (
                        <span
                          style={{
                            color: "#7C3AED",
                            fontWeight: 700,
                            fontSize: 10,
                            background: "#EDE9FE",
                            padding: "2px 6px",
                            borderRadius: 2,
                          }}
                        >
                          OWNER
                        </span>
                      ) : isSafeAdmin ? (
                        <span
                          style={{
                            color: "#107C41",
                            fontWeight: 700,
                            fontSize: 10,
                            background: "#E8F5E9",
                            padding: "2px 6px",
                            borderRadius: 2,
                          }}
                        >
                          DELEGATE
                        </span>
                      ) : (
                        <span style={{ color: "#94A3B8", fontSize: 10 }}>DENY</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* SUBTAB 4: SYSTEM & VAULT HEALTH */}
      {activeSubTab === "system" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #CBD5E1",
              borderRadius: 2,
              padding: "16px 20px",
            }}
          >
            <h3
              style={{
                margin: "0 0 12px 0",
                fontSize: 14,
                fontWeight: 700,
                color: "#0F172A",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Database size={16} style={{ color: "#0078D4" }} />
              Digital Vault Cluster Health
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "6px 0",
                  borderBottom: "1px solid #F1F5F9",
                }}
              >
                <span style={{ color: "#64748B" }}>Primary Vault Server:</span>
                <span style={{ fontWeight: 600, color: "#107C41" }}>CORP-PAM-VAULT01 (ONLINE)</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "6px 0",
                  borderBottom: "1px solid #F1F5F9",
                }}
              >
                <span style={{ color: "#64748B" }}>Disaster Recovery Node:</span>
                <span style={{ fontWeight: 600, color: "#1E293B" }}>
                  DR-PAM-VAULT02 (SYNCHRONIZED)
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "6px 0",
                  borderBottom: "1px solid #F1F5F9",
                }}
              >
                <span style={{ color: "#64748B" }}>Database Engine:</span>
                <span style={{ fontWeight: 600, color: "#1E293B" }}>
                  Hardened MySQL Vault Edition v8.0
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "6px 0",
                  borderBottom: "1px solid #F1F5F9",
                }}
              >
                <span style={{ color: "#64748B" }}>Replication Latency:</span>
                <span style={{ fontWeight: 600, color: "#107C41" }}>
                  0.04 ms (Real-time Synced)
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
                <span style={{ color: "#64748B" }}>HSM Hardware Key:</span>
                <span style={{ fontWeight: 600, color: "#107C41" }}>
                  FIPS 140-2 Level 3 (ACTIVE)
                </span>
              </div>
            </div>
          </div>

          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #CBD5E1",
              borderRadius: 2,
              padding: "16px 20px",
            }}
          >
            <h3
              style={{
                margin: "0 0 12px 0",
                fontSize: 14,
                fontWeight: 700,
                color: "#0F172A",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Server size={16} style={{ color: "#5C2D91" }} />
              Component Connectors Status
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "6px 0",
                  borderBottom: "1px solid #F1F5F9",
                }}
              >
                <span style={{ color: "#64748B" }}>Central Policy Manager (CPM):</span>
                <span style={{ fontWeight: 600, color: "#107C41" }}>
                  CPM-PROD-01 (HEARTBEAT OK)
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "6px 0",
                  borderBottom: "1px solid #F1F5F9",
                }}
              >
                <span style={{ color: "#64748B" }}>Privileged Session Manager (PSM):</span>
                <span style={{ fontWeight: 600, color: "#107C41" }}>
                  PSM-GW01 (PROXY CONNECTED)
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "6px 0",
                  borderBottom: "1px solid #F1F5F9",
                }}
              >
                <span style={{ color: "#64748B" }}>Active Directory LDAPS Sync:</span>
                <span style={{ fontWeight: 600, color: "#107C41" }}>
                  CORP.GFS.LOCAL:636 (SYNCHRONIZED)
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "6px 0",
                  borderBottom: "1px solid #F1F5F9",
                }}
              >
                <span style={{ color: "#64748B" }}>SIEM Syslog Forwarder (RFC 5424):</span>
                <span style={{ fontWeight: 600, color: "#107C41" }}>
                  PORT 514 / TLS (DELIVERING)
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
                <span style={{ color: "#64748B" }}>Active License Quota:</span>
                <span style={{ fontWeight: 600, color: "#0078D4" }}>
                  {state.accounts.length} / 500 Accounts Used
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PROVISION OPERATOR MODAL */}
      {isAddUserModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(2px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 4,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
              width: "100%",
              maxWidth: 500,
              border: "1px solid #CBD5E1",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                background: "#0F172A",
                color: "#FFFFFF",
                padding: "14px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <UserPlus size={18} style={{ color: "#38BDF8" }} />
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>
                  Provision Operator Identity
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddUserModalOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#94A3B8",
                  cursor: "pointer",
                }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitAdd} style={{ padding: 20 }}>
              {modalError && (
                <div
                  style={{
                    background: "#FEE2E2",
                    border: "1px solid #F87171",
                    color: "#991B1B",
                    padding: "8px 12px",
                    borderRadius: 2,
                    fontSize: 12,
                    marginBottom: 14,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <AlertCircle size={14} />
                  <span>{modalError}</span>
                </div>
              )}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#334155",
                      marginBottom: 4,
                    }}
                  >
                    Username *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., jsmith.admin"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "7px 10px",
                      fontSize: 12,
                      border: "1px solid #CBD5E1",
                      borderRadius: 2,
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#334155",
                      marginBottom: 4,
                    }}
                  >
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., John Smith"
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "7px 10px",
                      fontSize: 12,
                      border: "1px solid #CBD5E1",
                      borderRadius: 2,
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#334155",
                    marginBottom: 4,
                  }}
                >
                  Corporate Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g., jsmith@corp.gfs.local"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "7px 10px",
                    fontSize: 12,
                    border: "1px solid #CBD5E1",
                    borderRadius: 2,
                  }}
                />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#334155",
                    marginBottom: 4,
                  }}
                >
                  Assigned PAM Role *
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as PamUserRole)}
                  style={{
                    width: "100%",
                    padding: "7px 10px",
                    fontSize: 12,
                    border: "1px solid #CBD5E1",
                    borderRadius: 2,
                    background: "#FFFFFF",
                  }}
                >
                  <option value="Security Operator">Security Operator (Standard PSM Access)</option>
                  <option value="Safe Administrator">
                    Safe Administrator (Safe Ownership & Onboarding)
                  </option>
                  <option value="Auditor">Auditor (Read-Only Compliance & Forensics)</option>
                  <option value="PSM Operator">
                    PSM Operator (Session Monitoring & Termination)
                  </option>
                  <option value="CPM Operator">
                    CPM Operator (Password Engine Troubleshooting)
                  </option>
                  <option value="PAM Administrator">
                    PAM Administrator (Full Vault Authority)
                  </option>
                </select>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#334155",
                    marginBottom: 4,
                  }}
                >
                  Department / Organizational Unit
                </label>
                <input
                  type="text"
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "7px 10px",
                    fontSize: 12,
                    border: "1px solid #CBD5E1",
                    borderRadius: 2,
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="pvwa-btn pvwa-btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="pvwa-btn pvwa-btn-primary">
                  Provision User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CHANGE ROLE MODAL */}
      {selectedUserForRoleEdit && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(2px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 4,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
              width: "100%",
              maxWidth: 440,
              border: "1px solid #CBD5E1",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                background: "#0F172A",
                color: "#FFFFFF",
                padding: "14px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ShieldAlert size={18} style={{ color: "#F59E0B" }} />
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>
                  Modify Role: {selectedUserForRoleEdit.username}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUserForRoleEdit(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#94A3B8",
                  cursor: "pointer",
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: 20 }}>
              <p style={{ fontSize: 12, color: "#475569", margin: "0 0 14px 0" }}>
                Select a new security persona for <b>{selectedUserForRoleEdit.fullName}</b>.
                Changing roles immediately adjusts authorization across all Safes.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                {ROLES_LIST.map((r) => (
                  <button
                    key={r.role}
                    type="button"
                    onClick={() => handleRoleChange(selectedUserForRoleEdit.id, r.role)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      border:
                        selectedUserForRoleEdit.role === r.role
                          ? "2px solid #0078D4"
                          : "1px solid #CBD5E1",
                      borderRadius: 2,
                      background: selectedUserForRoleEdit.role === r.role ? "#EFF6FF" : "#FFFFFF",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#0F172A" }}>
                        {r.role}
                      </div>
                      <div style={{ fontSize: 11, color: "#64748B" }}>
                        {r.permissions.slice(0, 2).join(", ")}
                      </div>
                    </div>
                    {selectedUserForRoleEdit.role === r.role && (
                      <Check size={16} style={{ color: "#0078D4" }} />
                    )}
                  </button>
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setSelectedUserForRoleEdit(null)}
                  className="pvwa-btn pvwa-btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
