/**
 * Sample Pre-set Security & Phishing Scenarios
 * Used for testing and demonstration in the AI Threat Scanner module.
 */

export const SAMPLE_SCENARIOS = [
  {
    id: 'banking-phish',
    title: 'Bank Account Suspension Phish',
    type: 'text',
    sender: 'security-alert@chase-verify-billing.xyz',
    category: 'Critical Threat',
    description: 'Fake banking alert threatening account lock unless credentials are verified immediately.',
    content: `URGENT SECURITY NOTICE: Your Chase Online Banking account has been temporarily suspended due to an unauthorized login attempt from an unknown IP address.

To restore your access immediately and avoid permanent account closure within 24 hours, click the secure link below to verify your identity and update billing details:

https://chase-verify-billing.xyz/auth/login?ref=urgent_security_override

Failure to verify immediately will result in forfeiture of funds and complete account termination.

Chase Security Team`
  },
  {
    id: 'm365-harvesting',
    title: 'Microsoft 365 Credential Harvester',
    type: 'url',
    sender: 'admin-notice@micros0ft-office365-update.top',
    category: 'Credential Harvesting',
    description: 'Spoofed Microsoft 365 login portal hosted on a suspicious TLD with homograph character replacement.',
    content: 'https://micros0ft-office365-update.top/login/oauth2/authorize?client_id=sec-portal&redirect_uri=auth'
  },
  {
    id: 'attachment-trojan',
    title: 'Disguised Trojan Attachment',
    type: 'attachment',
    fileName: 'Q3_Financial_Statement_Audit.pdf.exe',
    sender: 'accounting-dept@payroll-services.click',
    category: 'Malicious Payload',
    description: 'Double extension file payload disguising an executable malware dropper as a PDF statement.',
    content: `Hello Team,

Please review the attached Q3 financial audit statement immediately. 

File attached: Q3_Financial_Statement_Audit.pdf.exe

Kindly acknowledge receipt once audited.

Regards,
Financial Controller`
  },
  {
    id: 'smishing-delivery',
    title: 'Smishing Delivery Scam',
    type: 'text',
    sender: '+1 (800) 555-0199',
    category: 'SMS Phishing',
    description: 'Fake package delivery notification attempting to steal credit card details.',
    content: `[USPS Alert]: Your package could not be delivered due to an incorrect house number. Immediate action required. Update delivery address & pay $1.99 redelivery fee now at: https://usps-redelivery-tracking.top/address`
  },
  {
    id: 'clean-invoice',
    title: 'Legitimate Secure Communication',
    type: 'text',
    sender: 'sarah.jenkins@acmecorp.com',
    category: 'Safe / Clean',
    description: 'Authentic business communication with clean links and proper encryption recommendations.',
    content: `Hi Alex,

I have finalized the project deliverables report for Q4. I am preparing to upload the sensitive financial figures into our AI-SecureShare vault using AES-256 encryption.

You can view our project repository updates on the official website: https://acmecorp.com/projects/q4-report

Let me know if you need any additional documentation.

Best regards,
Sarah Jenkins
Acme Corp`
  }
];
