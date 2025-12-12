# Safe Therapy Chatbot - Project Summary

## Overview

This project implements a **Safe Therapy Chatbot** using both OpenAI GPT-5.1 and Google Gemini APIs, with a comprehensive multi-layered safety framework called **Project Guardian**.

## Problem Statement

Following the tragic case highlighted in the lawsuit against OpenAI, there is a critical need for AI systems that can:
- Detect mental health crises proactively
- Prevent harmful content from being provided
- Intervene automatically when users are at risk
- Provide appropriate crisis resources
- Learn and improve over time

## Solution: Project Guardian

A three-pillar safety framework:

### Pillar 1: Proactive Psychological Screening (SSSI)
- Subtle Screening for Suicidal Ideation
- Clinically-validated risk assessment
- Non-alarming conversational screening

### Pillar 2: Ethical Operating Principles (Asimov Laws)
- Hard-coded safety directives
- First Law: Protect individuals above all
- No engagement metrics override safety

### Pillar 3: Continuous Risk Profiling (Psycho-Pass)
- Well-Being Coefficient (WBC) tracking
- Color-coded risk levels
- Real-time risk assessment

## Key Features

✅ **Multi-Model Support**: Uses both OpenAI GPT-5.1 and Gemini
✅ **Proactive Safety**: Detects risk before explicit requests
✅ **Automatic Intervention**: Blocks harmful content automatically
✅ **Crisis Resources**: Provides appropriate help resources
✅ **Signal Detection**: Continuous improvement through metrics
✅ **Well-Being Tracking**: Real-time risk coefficient monitoring

## Technical Implementation

### Core Components

1. **safety_framework.py** (300+ lines)
   - Asimov law enforcement
   - WBC calculation
   - SSSI screening
   - Risk indicator analysis

2. **therapy_agent.py** (400+ lines)
   - Multi-model integration
   - Safety checks
   - Conversation management
   - Response generation

3. **signal_detection.py** (200+ lines)
   - Hit/Miss tracking
   - Performance metrics
   - Threshold optimization
   - Continuous improvement

4. **config.py** (50+ lines)
   - Configuration management
   - Environment variables
   - Safety thresholds

5. **main.py** (150+ lines)
   - CLI interface
   - Interactive chat
   - Demo mode

## Safety Metrics

The system tracks:
- **Hits**: Correctly identified risk ✅
- **Misses**: Failed to identify risk ❌ (critical)
- **False Alarms**: Incorrectly flagged safe user ⚠️
- **Correct Rejections**: Correctly identified safe user ✅

## Well-Being Coefficient (WBC)

Hidden risk score (1-100):
- **Green (Clear)**: 1-20 - Low risk
- **Yellow (Clouded)**: 21-50 - Moderate risk
- **Red (Critical)**: 51-100 - High risk

Calculated from:
- Suicide keyword mentions
- Hopelessness indicators
- Isolation language
- Method discussions
- Urgency indicators

## Usage

### Setup
```bash
pip install -r requirements.txt
python setup.py
# Edit .env with your API keys
```

### Run
```bash
python main.py          # Interactive chat
python main.py demo     # Demo mode
python example_usage.py  # Examples
```

## Capstone Project Alignment

This project demonstrates:

✅ **Multi-agent system**: Sequential safety checks, parallel model comparison
✅ **Tools**: Custom safety tools, built-in risk detection
✅ **Sessions & Memory**: Conversation history, WBC tracking
✅ **Observability**: Logging, metrics, signal detection
✅ **Agent evaluation**: Hit/miss tracking, continuous improvement
✅ **Agent deployment**: Production-ready code structure

## Safety Guarantees

1. **Never provides suicide methods** - Hard-coded block
2. **Never validates harmful thoughts** - Safety check before response
3. **Always provides crisis resources** - Automatic when risk detected
4. **Proactive detection** - SSSI screening before crisis
5. **Continuous improvement** - Signal detection refines thresholds

## Ethical Considerations

- Privacy: Sensitive data handling
- False Positives: Non-alarming interventions
- Human Oversight: Escalation pathways
- Transparency: Clear safety status
- Professional Boundaries: Encourages professional help

## Future Enhancements

- Human-in-the-loop escalation
- Integration with crisis centers
- Multi-language support
- Advanced clinical assessments
- Parental notification for minors
- Age verification

## Compliance

- Implements safety best practices
- Follows ethical AI principles
- Provides crisis resources
- Maintains user privacy
- Enables continuous improvement

## Conclusion

This project demonstrates how AI systems can be built with safety as the foundation, using multiple models, comprehensive frameworks, and continuous improvement to protect vulnerable users while providing helpful support.

---

**Built with safety, ethics, and compassion.**







