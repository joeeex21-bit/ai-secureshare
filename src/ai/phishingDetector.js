/**
 * AI-Powered Phishing Detection Engine & Threat Analyzer
 * Analyzes text, email headers, URLs, and attachment parameters to identify phishing attacks,
 * domain spoofing, urgency traps, and malicious indicators.
 */

// Known high-risk TLDs and typosquatting domain patterns
const SUSPICIOUS_TLDS = ['.xyz', '.top', '.tk', '.ml', '.ga', '.cf', '.gq', '.work', '.click', '.zip', '.mov', '.ru', '.cn', '.cc'];
const LEGITIMATE_BRAND_DOMAINS = {
  paypal: ['paypal.com', 'paypal.me'],
  microsoft: ['microsoft.com', 'office365.com', 'live.com', 'outlook.com', 'azure.com'],
  google: ['google.com', 'gmail.com', 'drive.google.com'],
  apple: ['apple.com', 'icloud.com'],
  amazon: ['amazon.com', 'aws.amazon.com'],
  chase: ['chase.com'],
  wellsfargo: ['wellsfargo.com'],
  bankofamerica: ['bankofamerica.com']
};

// Urgency and social engineering keywords
const URGENCY_TRIGGERS = [
  { phrase: 'account suspended', weight: 25 },
  { phrase: 'immediate action required', weight: 25 },
  { phrase: 'verify your account', weight: 20 },
  { phrase: 'unauthorized login attempt', weight: 20 },
  { phrase: 'password expires today', weight: 20 },
  { phrase: 'tax refund pending', weight: 25 },
  { phrase: 'wire transfer', weight: 15 },
  { phrase: 'urgent payment', weight: 20 },
  { phrase: 'security threat detected', weight: 20 },
  { phrase: 'update billing details', weight: 20 },
  { phrase: 'claim your prize', weight: 25 },
  { phrase: 'account blocked', weight: 25 },
  { phrase: 'final notice', weight: 20 },
  { phrase: 'click here immediately', weight: 20 }
];

// Suspicious executable extensions often disguised as documents
const EXECUTABLE_EXTENSIONS = ['.exe', '.scr', '.vbs', '.js', '.bat', '.cmd', '.ps1', '.hta', '.jar', '.iso'];

/**
 * Parses raw text or URLs and extracts contained links
 */
export function extractUrls(text) {
  const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`]+)/gi;
  return text.match(urlRegex) || [];
}

/**
 * Detects domain spoofing / typosquatting (e.g., paypaI.com with capital i or micros0ft.com)
 */
function analyzeDomain(domain) {
  const cleanDomain = domain.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
  const domainParts = cleanDomain.split('.');
  const tld = domainParts.length > 1 ? '.' + domainParts[domainParts.length - 1] : '';

  const findings = [];
  let domainRisk = 0;

  // Check TLD
  if (SUSPICIOUS_TLDS.includes(tld)) {
    findings.push({
      type: 'SUSPICIOUS_TLD',
      severity: 'HIGH',
      message: `Uses high-risk top-level domain '${tld}', frequently used in phishing campaigns.`
    });
    domainRisk += 30;
  }

  // Check character substitution (leetspeak / homograph simulation)
  if (/[0-9]/.test(cleanDomain) && (cleanDomain.includes('0') || cleanDomain.includes('1') || cleanDomain.includes('3') || cleanDomain.includes('@'))) {
    for (const [brand, legitDomains] of Object.entries(LEGITIMATE_BRAND_DOMAINS)) {
      const normalizedDomain = cleanDomain.replace(/0/g, 'o').replace(/1/g, 'l').replace(/3/g, 'e').replace(/@/g, 'a');
      if (normalizedDomain.includes(brand) && !legitDomains.some(d => cleanDomain.endsWith(d))) {
        findings.push({
          type: 'HOMOGRAPH_SPOOF',
          severity: 'CRITICAL',
          message: `Spoofed brand domain detected: '${cleanDomain}' impersonates '${brand}' with character substitutions.`
        });
        domainRisk += 45;
      }
    }
  }

  // Check brand keyword inside subdomains or path (e.g. login-paypal-secure-verify.net)
  for (const [brand, legitDomains] of Object.entries(LEGITIMATE_BRAND_DOMAINS)) {
    if (cleanDomain.includes(brand) && !legitDomains.some(d => cleanDomain === d || cleanDomain.endsWith('.' + d))) {
      findings.push({
        type: 'BRAND_IMPERSONATION',
        severity: 'CRITICAL',
        message: `Impersonates brand '${brand.toUpperCase()}' on non-official domain '${cleanDomain}'.`
      });
      domainRisk += 40;
    }
  }

  // Check excessive subdomains or hyphens (e.g. secure.login.verify.update.auth-service.com)
  const hyphenCount = (cleanDomain.match(/-/g) || []).length;
  if (hyphenCount >= 3) {
    findings.push({
      type: 'EXCESSIVE_HYPHENS',
      severity: 'MEDIUM',
      message: `Domain contains suspicious excessive hyphens (${hyphenCount}), common in phishing links.`
    });
    domainRisk += 15;
  }

  return { cleanDomain, domainRisk, findings };
}

/**
 * Main AI Threat Assessment Function
 * @param {Object} input - { type: 'text'|'url'|'attachment', content: string, senderEmail?: string, fileName?: string }
 */
export function analyzePhishingThreat(input) {
  const { type, content = '', senderEmail = '', fileName = '' } = input;

  let totalScore = 0;
  const indicators = [];
  const highlightedTokens = [];

  const textToAnalyze = content.toLowerCase();

  // 1. Social Engineering & Urgency Analysis
  let urgencyScore = 0;
  URGENCY_TRIGGERS.forEach(trigger => {
    if (textToAnalyze.includes(trigger.phrase)) {
      urgencyScore += trigger.weight;
      indicators.push({
        category: 'Urgency & Coercion',
        trigger: trigger.phrase,
        weight: trigger.weight,
        severity: trigger.weight >= 25 ? 'HIGH' : 'MEDIUM',
        description: `Coercive language detected: "${trigger.phrase}". Phishers use urgency to bypass critical thinking.`
      });
      highlightedTokens.push(trigger.phrase);
    }
  });
  totalScore += Math.min(urgencyScore, 40);

  // 2. URL & Link Analysis
  const foundUrls = extractUrls(content);
  let urlRiskScore = 0;

  if (type === 'url') {
    foundUrls.push(content);
  }

  foundUrls.forEach(urlStr => {
    const domainAnalysis = analyzeDomain(urlStr);
    urlRiskScore += domainAnalysis.domainRisk;

    domainAnalysis.findings.forEach(f => {
      indicators.push({
        category: 'URL & Domain Integrity',
        trigger: domainAnalysis.cleanDomain,
        weight: f.severity === 'CRITICAL' ? 40 : 25,
        severity: f.severity,
        description: f.message
      });
    });
  });
  totalScore += Math.min(urlRiskScore, 45);

  // 3. Sender Verification & Spoofing Analysis
  if (senderEmail) {
    const senderLower = senderEmail.toLowerCase();
    const senderDomain = senderLower.split('@')[1] || '';

    // Free webmail impersonating corporate security
    if (senderDomain.includes('gmail.com') || senderDomain.includes('yahoo.com') || senderDomain.includes('hotmail.com')) {
      if (textToAnalyze.includes('bank') || textToAnalyze.includes('support') || textToAnalyze.includes('security team')) {
        totalScore += 25;
        indicators.push({
          category: 'Sender Authentication',
          trigger: senderEmail,
          weight: 25,
          severity: 'HIGH',
          description: `Official security message sent from a public webmail address (${senderDomain}).`
        });
      }
    }
  }

  // 4. File Attachment Analysis
  if (fileName) {
    const nameLower = fileName.toLowerCase();
    
    // Check double extension (e.g. invoice.pdf.exe)
    if (/\.[a-z0-9]+\.(exe|scr|vbs|bat|js|cmd)$/i.test(nameLower)) {
      totalScore += 50;
      indicators.push({
        category: 'Attachment Threat',
        trigger: fileName,
        weight: 50,
        severity: 'CRITICAL',
        description: `Double file extension detected in "${fileName}". Executable disguised as a harmless document.`
      });
    }

    // Check executable extension
    EXECUTABLE_EXTENSIONS.forEach(ext => {
      if (nameLower.endsWith(ext)) {
        totalScore += 45;
        indicators.push({
          category: 'Attachment Threat',
          trigger: fileName,
          weight: 45,
          severity: 'CRITICAL',
          description: `High-risk executable extension "${ext}" detected in file attachment.`
        });
      }
    });
  }

  // Normalize final score to 0 - 100
  const finalScore = Math.min(Math.max(Math.round(totalScore), 0), 100);

  // Determine Severity Level
  let severity = 'SAFE';
  let badgeColor = 'emerald';
  if (finalScore >= 75) {
    severity = 'CRITICAL';
    badgeColor = 'red';
  } else if (finalScore >= 50) {
    severity = 'HIGH';
    badgeColor = 'rose';
  } else if (finalScore >= 25) {
    severity = 'MODERATE';
    badgeColor = 'amber';
  } else if (finalScore > 0) {
    severity = 'LOW';
    badgeColor = 'blue';
  }

  // Generate Recommendations based on findings
  const recommendations = [];
  if (severity === 'CRITICAL' || severity === 'HIGH') {
    recommendations.push('Do NOT click any links or download attachments from this message.');
    recommendations.push('Verify the identity of the sender through an official, independent contact method.');
    recommendations.push('Report this message to your security administrator immediately.');
  } else if (severity === 'MODERATE') {
    recommendations.push('Exercise caution. Check the destination URL carefully before entering credentials.');
    recommendations.push('If sharing sensitive files with this sender, encrypt them with a unique key first.');
  } else {
    recommendations.push('No obvious phishing indicators detected.');
    recommendations.push('Remember to encrypt sensitive data before sharing over public channels.');
  }

  return {
    score: finalScore,
    severity,
    badgeColor,
    indicators,
    foundUrls,
    highlightedTokens,
    recommendations,
    scannedAt: new Date().toISOString()
  };
}
