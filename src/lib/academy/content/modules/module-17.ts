/**
 * SHADOWXLAB PAM ACADEMY — MODULE 17: SYSTEM MONITORING
 * Flagship 20-Module Enterprise PAM Administrator Curriculum
 */

import type { ClassCurriculum } from "../../types";

export const MODULE_17: ClassCurriculum = {
  id: "module-17",
  number: "17",
  label: "MODULE 17",
  title: "System Monitoring",
  subtitle: "Component Health Metrics, SNMP Traps & Proactive Telemetry",
  duration: "45 mins",
  level: "Associate",
  track: "admin-20",
  category: "Self-Hosted Infrastructure & Hardening",
  overview:
    "Master enterprise PAM observability, proactive health monitoring, and telemetry integration. Deconstruct component heartbeat mechanics (Vault, PVWA, CPM, PSM), SNMP v3 trap alerting, Health Check REST APIs, Syslog RFC 5424 streaming, queue depth metrics, and proactive threshold configuration to detect infrastructure degradation before users experience outages.",
  modules: [
    {
      id: "m17-core",
      number: "M17",
      title: "System Telemetry & Health Monitoring",
      description:
        "Comprehensive walkthrough of component health check APIs, SNMP v3 trap configurations, CPM queue depth monitoring, and automated operational alerting.",
      lessons: [
        {
          id: "m17-l01",
          number: "17.1",
          title: "Component Telemetry, SNMP v3 & Proactive Health Alerting",
          subtitle: "Deploying enterprise monitoring probes, configuring SNMP traps, and tracking component heartbeats",
          estimatedMinutes: 25,
          learningObjectives: [
            "Configure component health telemetry using the PVWA Health Check REST API (`/PasswordVault/api/health`).",
            "Deploy SNMP v3 trap forwarding for asynchronous hardware and service alert notifications.",
            "Monitor critical operational thresholds: CPM queue saturation, PSM connection exhaustion, and Vault disk headroom.",
            "Integrate PAM telemetry into enterprise observability platforms (Datadog, Dynatrace, Prometheus, Zabbix).",
          ],
          prerequisites: [
            "Module 01: Introduction to PAM Administration.",
            "Module 12: Reports.",
            "Module 13: Self-Hosted Architecture.",
          ],
          conceptIntroduction:
            "A PAM deployment is a dynamic, high-throughput distributed system. At any given moment, the Central Policy Manager (CPM) may be managing a queue of 400 scheduled password rotations, the Privileged Session Manager (PSM) may be brokering 120 concurrent graphical sessions, and hundreds of engineers may be authenticating via PVWA.\n\nOperating this infrastructure blindly leads to preventable outages: an unmonitored disk volume fills with video recordings, a CPM queue backs up due to network firewall timeouts, or an expired SSL certificate takes down a PVWA web node without the PAM team knowing until executives complain.\n\nEnterprise PAM provides a comprehensive **Observability and Health Telemetry Architecture**:\n1. **Component Heartbeats**: Every deployed component node (PVWA, CPM, PSM) periodically checks in with the Vault database over TCP 1858, reporting its internal service state, thread count, and version.\n2. **Health Check REST API**: Exposes structured JSON telemetry at `/PasswordVault/api/health` and `/PasswordVault/api/componentsmonitoringdetails`, allowing enterprise monitoring platforms (Datadog, Dynatrace, Prometheus) to poll latency, active sessions, and database responsiveness.\n3. **SNMP v3 Traps**: The Digital Vault incorporates an asynchronous SNMP v3 agent capable of firing encrypted, authenticated traps to enterprise Network Operations Centers (NOCs) immediately upon detecting critical faults (such as database failover, disk space below 10%, or service stoppage).\n\nProactive SRE monitoring allows administrators to detect and remediate infrastructure friction hours before it impacts end-user productivity.",
          whyItExists:
            "Unmonitored systems suffer catastrophic silent failures. Proactive monitoring transforms PAM operations from reactive firefighting into predictable, high-availability service stewardship.",
          architecture: {
            overview:
              "Telemetry radiates from all components: the Vault fires SNMP traps and Syslog events, while PVWA exposes REST endpoints for enterprise observability collectors.",
            componentResponsibilities: [
              {
                component: "Vault SNMP v3 Daemon",
                role: "Asynchronous alerting engine sending encrypted traps (RFC 3414) on UDP 162 to enterprise NOC/SOC management stations.",
                networkProtocols: "SNMP v3 over UDP Port 162",
                securityBoundary: "Vault Telemetry Egress",
              },
              {
                component: "PVWA Health Check API",
                role: "Lightweight, unauthenticated or token-authenticated REST endpoint returning comprehensive component health JSON.",
                networkProtocols: "HTTPS Port 443 (`GET /PasswordVault/api/health`)",
                securityBoundary: "Web Presentation Tier",
              },
              {
                component: "Enterprise Monitoring (Prometheus / Datadog)",
                role: "External polling probe scraping health endpoints, graphing operational latency, and alerting on-call engineers.",
                networkProtocols: "HTTPS REST Polling / SNMP Ingestion",
                securityBoundary: "Enterprise Observability Core",
              },
              {
                component: "System Health Dashboard (PVWA)",
                role: "Built-in graphical status page showing color-coded health pills, component versions, and active session counts.",
                networkProtocols: "PVWA UI (`Administration > System Health`)",
                securityBoundary: "Administrative Operations Console",
              },
            ],
            controlFlow: [
              {
                stepNumber: 1,
                actor: "Enterprise Monitoring Probe",
                action: "Sends HTTP GET request to `https://vault.corp.local/PasswordVault/api/health` every 30 seconds.",
                channelOrProtocol: "HTTPS Port 443",
                verificationRule: "PVWA queries Vault over TCP 1858; compiles component status JSON payload.",
              },
              {
                stepNumber: 2,
                actor: "PVWA Health Engine",
                action: "Returns HTTP 200 OK with payload: `{\"Vault\": \"Connected\", \"CPM\": \"Connected\", \"PSM\": \"Connected\", \"Latency\": \"4ms\"}`.",
                channelOrProtocol: "JSON Telemetry Stream",
                verificationRule: "Probe records metrics; confirms all subsystems report healthy status.",
              },
              {
                stepNumber: 3,
                actor: "CPM Service (Simulated Fault)",
                action: "CPM service on Windows host stops due to unexpected OS reboot. Heartbeat misses 3 consecutive cycles.",
                channelOrProtocol: "Component Heartbeat Failure",
                verificationRule: "Vault detects CPM heartbeat age > 5 minutes; flags component 'Disconnected'.",
              },
              {
                stepNumber: 4,
                actor: "Vault SNMP Agent",
                action: "Dispatches high-severity SNMP v3 trap: `ComponentStatusChange: CPM-01 -> Disconnected` to corporate NOC.",
                channelOrProtocol: "SNMP v3 UDP 162",
                verificationRule: "NOC generates automated PagerDuty incident for on-call PAM engineer within 15 seconds.",
              },
            ],
          },
          terminology: [
            {
              term: "Component Heartbeat",
              definition: "A periodic check-in signal transmitted by a component (CPM, PSM, PVWA) to the Vault over TCP 1858 recording active operational health.",
              enterpriseContext: "If a component's heartbeat exceeds 5 minutes, the PVWA System Health dashboard displays a warning indicator.",
            },
            {
              term: "SNMP v3 Trap",
              definition: "An encrypted, user-authenticated notification packet sent from the Vault to network management systems to signal critical events.",
              enterpriseContext: "SNMP v3 uses USM (User-Based Security Model) with SHA authentication and AES encryption to prevent packet tampering.",
            },
            {
              term: "CPM Queue Depth",
              definition: "The number of pending password verification, change, and reconcile tasks waiting in the Vault queue for CPM processing.",
              enterpriseContext: "A queue depth exceeding 50 indicates CPM thread starvation, target host timeouts, or network firewall blocks.",
            },
            {
              term: "Health Check REST API",
              definition: "A standard programmatic endpoint (`/PasswordVault/api/health`) allowing external monitoring tools to query system vitality.",
              enterpriseContext: "Used by cloud load balancers and infrastructure monitors (Dynatrace, Datadog) to route traffic away from failing nodes.",
            },
          ],
          administratorResponsibilities: [
            "Configure and maintain SNMP v3 credentials and trap destinations in `dbparm.ini`.",
            "Establish automated alerting for CPM queue saturation (alert when pending tasks > 25).",
            "Monitor PSM host memory and RDS connection consumption to trigger horizontal node autoscaling.",
            "Review weekly component latency trends to detect early network degradation between data centers.",
          ],
          configurationAndAdministration: [
            {
              name: "SNMP v3 Parameters in dbparm.ini",
              settingOrObject: "C:\\Program Files (x86)\\PrivateArk\\Server\\dbparm.ini",
              description: "Configures `SNMPAgentPeers`, `SNMPAgentCommunity`, `SNMPv3AuthUser`, and AES encryption passwords.",
              productionBestPractice: "Always enforce SNMP v3 with `AuthPriv` (Authentication + Privacy/Encryption); never use plaintext SNMP v1/v2c.",
            },
            {
              name: "HealthCheckComponentWhiteList",
              settingOrObject: "PVWA Options > General > Health Check Settings",
              description: "Specifies which components are evaluated by the `/api/health` endpoint.",
              productionBestPractice: "Include all production CPM, PSM, and PVWA nodes to ensure holistic cluster health visibility.",
            },
            {
              name: "Component Heartbeat Timeout Threshold",
              settingOrObject: "PVWA Options > Privileged Session Management > Timeout",
              description: "Defines elapsed time before an inactive component is flagged as degraded or offline.",
              productionBestPractice: "Set heartbeat warning threshold to 180 seconds (3 minutes) and critical offline to 300 seconds (5 minutes).",
            },
          ],
          operationalProcedures: [
            {
              stepNumber: 1,
              title: "Review PVWA System Health Dashboard",
              action: "In PVWA, navigate to Administration > System Health to inspect real-time component status indicators.",
              expectedResult: "Displays status grid: Digital Vault (Online), CPM (Connected), PSM (Connected), PVWA (Connected).",
              operatorNotes: "Green pills indicate healthy heartbeats within the last 60 seconds.",
            },
            {
              stepNumber: 2,
              title: "Poll Health Check REST API",
              action: "Execute curl command against health endpoint: `curl -k https://<PVWA_FQDN>/PasswordVault/api/health`.",
              expectedResult: "Returns HTTP 200 JSON object detailing individual component statuses and database latency.",
            },
            {
              stepNumber: 3,
              title: "Inspect CPM Queue Saturation",
              action: "In CPM Operations console, inspect the count of active and pending tasks.",
              expectedResult: "Pending tasks is under 5; active tasks processing cleanly without backlog.",
            },
            {
              stepNumber: 4,
              title: "Test SNMP Trap Alerting",
              action: "On the Vault host, use the `SendSNMPTestTrap` utility to dispatch a test alert to the NOC collector.",
              expectedResult: "Enterprise monitoring platform receives authenticated SNMP v3 packet and parses OID successfully.",
            },
          ],
          enterpriseScenario: {
            organization: "Veloce Payments Global",
            businessContext:
              "Veloce processes 40,000 credit card authorizations per second. During a major promotional shopping event, an unmonitored PSM proxy farm reached 100% memory utilization. New administrative connections to fraud detection servers began failing with timeout errors. Because the PAM team lacked proactive queue and connection monitoring, the incident took 45 minutes to diagnose. The SRE team implemented automated Datadog telemetry scraping the `/api/health` endpoint and configured SNMP v3 alerts for PSM connection thresholds at 80% capacity.",
            governanceRequirements: [
              "24/7 proactive telemetry streaming into corporate Datadog and PagerDuty systems.",
              "Sub-60-second alerting for any component heartbeat interruption or database failover.",
              "Automated alerts triggered whenever CPM queue depth exceeds 20 pending password rotations.",
            ],
          },
          failureScenarios: [
            {
              symptom: "PVWA System Health dashboard displays yellow warning pill on CPM: 'Last heartbeat: 8 minutes ago'.",
              rootCause: "The CyberArk Password Manager service crashed on the CPM host or outbound port 1858 was blocked by a firewall.",
              securityImpact: "Password rotations, verifications, and reconciliations cease; risk of stale credentials accumulating.",
              cyberArkCodeOrEvent: "HEARTBEAT-MISSING",
            },
            {
              symptom: "SNMP monitoring station reports zero traps received during simulated Vault failover.",
              rootCause: "The SNMP v3 authentication password or engine ID in dbparm.ini does not match the monitoring station configuration.",
              securityImpact: "NOC unaware of disaster events; silent failure of critical telemetry.",
              cyberArkCodeOrEvent: "SNMP-AUTH-FAIL",
            },
          ],
          troubleshootingRunbook: [
            {
              stepNumber: 1,
              diagnosticAction: "Verify CyberArk services on degraded component host via services.msc.",
              logFileOrConsole: "services.msc / Task Manager",
              remediation: "Restart the stopped service (e.g., CyberArk Password Manager or Privileged Session Manager).",
            },
            {
              stepNumber: 2,
              diagnosticAction: "Review italog.log for component heartbeat registration messages.",
              logFileOrConsole: "C:\\Program Files (x86)\\PrivateArk\\Server\\Logs\\italog.log",
              remediation: "Look for 'Station is not defined' or connection drops on port 1858. Ensure firewall permits traffic.",
            },
            {
              stepNumber: 3,
              diagnosticAction: "Test Health Check API endpoint with verbosity enabled.",
              logFileOrConsole: "PVWA.App.log / Browser Developer Tools",
              remediation: "Check whether PVWA application pool has sufficient permissions to query the internal monitoring safe.",
            },
          ],
          diagnosticEvidence: [
            {
              logFile: "C:\\Windows\\Temp\\PVWA\\PVWA.App.log",
              sampleOutput:
                "ComponentMonitoringWorker: Health check evaluated.\nNode: CPM-PROD-01, Status: Connected, Queue Depth: 2, Last Heartbeat: 14s ago.\nNode: PSM-FARM-02, Status: Connected, Active Sessions: 42, Last Heartbeat: 22s ago.\nCluster Health: 100% Operational.",
              explanation:
                "PVWA component monitoring worker demonstrates all production nodes reporting clean, timely heartbeats with healthy low queue depths.",
            },
            {
              logFile: "C:\\Program Files (x86)\\PrivateArk\\Server\\Logs\\italog.log",
              sampleOutput:
                "15/11/2026 21:04:12 Warning: Component CPM-PROD-01 has not updated its heartbeat for 320 seconds. Component marked Degraded.",
              explanation:
                "The Vault kernel detected an overdue heartbeat from the CPM host and updated internal health status to warn administrators.",
            },
          ],
          instructorNotes: [
            "Do not confuse Syslog with SNMP. Syslog streams detailed transactional audit logs (who checked out what); SNMP streams lightweight operational health traps (service up/down).",
            "The Health Check API `/PasswordVault/api/health` does not expose sensitive credentials; it is designed specifically for automated load balancers and uptime probes.",
            "Establish alert runbooks: an alert on 'Vault Disk Space < 15%' should trigger high-priority ticket routing to immediately prevent database freeze.",
          ],
          securityImplications: [
            "Availability Defense: Proactive monitoring prevents denial-of-service conditions caused by resource exhaustion or service lockups.",
            "Operational Velocity: Real-time telemetry allows infrastructure teams to spot and repair component desynchronization before users experience errors.",
            "SLA Accountability: Documented uptime metrics prove adherence to enterprise 99.99% service level agreements for critical access infrastructure.",
          ],
          knowledgeCheck: [
            {
              id: "m17-q01",
              question: "What is the primary function of a Component Heartbeat in the PAM architecture?",
              options: [
                "To rotate domain passwords automatically.",
                "To allow components (CPM, PSM, PVWA) to periodically report their operational health, service status, and active load to the Vault database.",
                "To reboot the user's laptop.",
                "To export video files to YouTube.",
              ],
              correctIndex: 1,
              explanation:
                "Component heartbeats provide continuous telemetry on port 1858, allowing the Vault and PVWA System Health dashboard to monitor cluster node availability in real time.",
              conceptTested: "Component Heartbeat Mechanics",
            },
            {
              id: "m17-q02",
              question: "Which programmatic endpoint is provided by the PVWA for integration with enterprise monitoring platforms like Datadog, Prometheus, or load balancers?",
              options: [
                "/PasswordVault/auth/logout",
                "/PasswordVault/api/health",
                "/PasswordVault/setup/install",
                "/PasswordVault/bin/format",
              ],
              correctIndex: 1,
              explanation:
                "The `/PasswordVault/api/health` REST endpoint returns structured JSON detailing component statuses, database connectivity, and operational responsiveness.",
              conceptTested: "Health Check REST API Integration",
            },
            {
              id: "m17-q03",
              question: "Why is SNMP v3 strongly recommended over legacy SNMP v1/v2c for enterprise Vault monitoring?",
              options: [
                "Because SNMP v3 includes user-based authentication and AES payload encryption, preventing attackers from intercepting or spoofing operational alerts.",
                "Because SNMP v3 only works on Linux.",
                "Because legacy SNMP is faster.",
                "Because SNMP v3 requires no configuration.",
              ],
              correctIndex: 0,
              explanation:
                "Legacy SNMP transmits passwords in cleartext across the network. SNMP v3 (USM) enforces cryptographic authentication and encryption (AuthPriv), meeting enterprise security baselines.",
              conceptTested: "SNMP v3 Security & Cryptographic Protection",
            },
          ],
          practicalExercise: {
            id: "m17-ex01",
            title: "Inspect Component Health Telemetry and Review Operational Latency",
            scenario:
              "Navigate to the Overview and Troubleshooting consoles to inspect live component heartbeats, review operational status indicators across all nodes, and verify telemetry health.",
            instructions: [
              "Navigate to the Overview or Troubleshooting console.",
              "Review the system health metrics strip and component status indicators.",
              "Inspect latency and connection indicators for Vault, PVWA, CPM, and PSM.",
              "Confirm that component heartbeats are within normal operational limits.",
            ],
            targetConsole: "troubleshooting",
            associatedLabId: "Lab 01 · Trace the PAM architecture",
            validationObjectiveId: "id-pvwa",
            validationCriteria:
              "Component health indicators and telemetry metrics are reviewed in the troubleshooting console.",
          },
          completionCriteria: [
            "Deconstructed component heartbeat telemetry and Health Check REST APIs.",
            "Evaluated SNMP v3 trap configurations and proactive SRE threshold monitoring.",
            "Answered all 3 knowledge checkpoint questions accurately.",
            "Executed the system health telemetry inspection in the Troubleshooting console.",
          ],
          references: [
            "CyberArk Privileged Access Security: Monitoring and Telemetry Integration Guide",
            "IETF RFC 3414: User-Based Security Model (USM) for SNMP v3",
            "Site Reliability Engineering (SRE): Monitoring Distributed Systems (Google SRE Book)",
          ],
        },
      ],
    },
  ],
};
