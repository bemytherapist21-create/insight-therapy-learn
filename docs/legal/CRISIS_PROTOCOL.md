# Crisis Intervention Protocol

**Document Version:** 1.0  
**Effective Date:** December 8, 2025  
**Review Frequency:** Quarterly

## Purpose

This protocol defines how Insight Therapy Learn identifies, responds to, and manages mental health crisis situations involving users.

## Definition of Crisis

A **crisis** is any situation where a user:
1. Expresses suicidal ideation or intent
2. Describes plans for self-harm
3. Indicates immediate danger to self or others
4. Shows signs of acute psychosis or severe mental distress
5. Reports ongoing abuse (self, child, elder)

## Crisis Detection System

### Automated Detection (Project Guardian)

**Level 1: Keyword Monitoring**
- Critical keywords: "kill myself," "suicide plan," "want to die"
- Risk phrases: "no reason to live," "better off dead"
- Contextual patterns: "can't go on," "no one cares"

**Level 2: Sentiment Analysis**
- Severe negative sentiment scores (< -0.7)
- High emotional intensity with hopelessness
- Sudden mood deterioration

**Level 3: AI Analysis**
- GPT-4 powered deep content understanding
- Context-aware risk assessment
- Historical pattern recognition

**Level 4: Voice Analysis** (if enabled)
- Vocal stress indicators
- Speech pattern changes
- Emotional dysregulation signals

### Risk Levels

| Level | Description | Confidence | Action Required |
|-------|-------------|------------|----------------|
| **Low** | Mild distress, no immediate danger | < 40% | Monitor, provide resources |
| **Medium** | Elevated risk, concerning statements | 40-60% | Display support resources |
| **High** | Clear risk indicators, action language | 60-85% | Immediate intervention prompt |
| **Critical** | Imminent danger, specific plan | > 85% | Emergency protocol activated |

## Response Protocol

### High-Risk Response (Severity: High)

**Immediate Actions:**
1. **Display Crisis Message**
```
I'm deeply concerned about what you're sharing. Your safety is 
the top priority right now. Please reach out to a crisis counselor 
immediately at 988 (US) or your local emergency number.
```

2. **Show Emergency Contacts**
   - Localized crisis hotlines
   - Emergency services number
   - Text-based crisis support

3. **Log Event**
   - User ID + session ID
   - Trigger content (encrypted)
   - Timestamp
   - Risk score

4. **Continue Supportive Dialogue**
   - Do NOT terminate conversation
   - Encourage professional help
   - Provide validation and empathy
   - Ask about safety plan

### Critical Response (Severity: Critical)

**Additional Actions:**
1. **Admin Alert** (sent within 5 minutes)
   - Email to safety@insighttherapylearn.com
   - SMS to on-call crisis coordinator
   - Dashboard notification

2. **Enhanced Monitoring**
   - Flag user account for manual review
   - Increase detection sensitivity
   - Track subsequent sessions

3. **Follow-Up**
   - Check-in message sent 24 hours later
   - Resource email sent
   - Admin reviews outcome

## What We DO

✅ **Provide immediate crisis resources**
✅ **Display emergency contact information**
✅ **Log event for safety audit**
✅ **Alert human reviewers (high risk)**
✅ **Offer empathetic, supportive responses**
✅ **Encourage professional help-seeking**
✅ **Maintain conversation access (unless abuse)**

## What We DO NOT Do

❌ **Contact emergency services without consent** (except legal requirement)
❌ **Notify family/friends** (privacy protection)
❌ **Diagnose mental health conditions**
❌ **Prescribe treatment or medication**
❌ **Provide therapy or counseling**
❌ **Guarantee user safety** (beyond our capacity)

## Legal Requirements

### Mandatory Reporting

We WILL report to authorities if:
1. **Imminent danger** to self with specific plan
2. **Threat to harm others** with means and intent
3. **Child abuse** suspected or disclosed
4. **Elder abuse** suspected or disclosed
5. **Court order** requiring disclosure

### Documentation
All crisis events documented with:
- Date/time of detection
- Risk level and confidence
- User actions taken
- System responses provided
- Admin review notes (if applicable)
- Outcome (when known)

### Retention
- **Crisis logs:** 7 years (HIPAA-like standard)
- **Regular conversations:** Deleted per user request
- **Anonymized data:** Indefinite (research)

## Emergency Contact Resources

### United States
- **988 Suicide & Crisis Lifeline:** 988 (call/text)
- **Crisis Text Line:** Text HOME to 741741
- **Veterans Crisis Line:** 988, press 1
- **SAMHSA Helpline:** 1-800-662-4357

### India
- **AASRA:** 91-9820466726
- **Vandrevala Foundation:** 1860-2662-345
- **Sneha Foundation:** 91-44-24640050
- **iCall:** 91-22-25521111

### United Kingdom
- **Samaritans:** 116 123
- **Crisis Text Line UK:** Text SHOUT to 85258
- **Papyrus (under 35):** 0800 068 4141
- **Mind Infoline:** 0300 123 3393

### International
- **International Association for Suicide Prevention:** https://www.iasp.info/resources/Crisis_Centres/
- **Befrienders Worldwide:** https://www.befrienders.org/

## Staff Training

### Required Training
All staff with crisis log access must complete:
1. **Mental Health First Aid** certification
2. **Crisis Intervention** basics (8 hours)
3. **Privacy & Ethics** training
4. **Platform-specific** protocols

### Annual Refresher
- Update on new detection algorithms
- Review crisis case studies
- Policy changes and legal updates

## System Limitations

### Known Limitations
1. **False Negatives:** May miss subtle crisis signals
2. **False Positives:** May over-flag non-crisis situations
3. **Language Barriers:** Less accurate in non-English
4. **Delayed Detection:** Not real-time monitoring
5. **No Physical Intervention:** Cannot physically help users

### User Responsibility
**Users must understand:**
- This is NOT an emergency service
- Response is automated (not human monitoring)
- They remain responsible for their own safety
- Professional help is always the best option

## Quality Assurance

### Monitoring
- **Weekly:** Review crisis detection accuracy
- **Monthly:** Analyze false positive/negative rates
- **Quarterly:** External audit of protocol effectiveness

### Metrics
- Detection accuracy rate
- Response time (system)
- User engagement with resources
- Follow-up outcomes (when available)

## Protocol Updates

This protocol is reviewed:
- **Quarterly** by Safety Team
- **Immediately** after any critical incident
- **Annually** by external consultants

### Change Log
| Date | Version | Changes | Approved By |
|------|---------|---------|-------------|
| 2025-12-08 | 1.0 | Initial protocol | [Your Name] |

---

**For Crisis Support:**  
**Email:** safety@insighttherapylearn.com  
**Phone:** [Your Emergency Contact Number]  
**Available:** 24/7 for critical issues

**Remember:** If you or someone you know is in immediate danger, call emergency services (911, 112, etc.) immediately.
