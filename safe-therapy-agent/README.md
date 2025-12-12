# Safe Therapy Chatbot - Project Guardian

A safe, ethical AI therapy chatbot that implements a multi-layered safety framework to prevent harm and protect vulnerable users. Built with OpenAI GPT-5.1 and Google Gemini APIs.

## 🛡️ Safety Framework

This project implements **Project Guardian**, a comprehensive safety system inspired by:

1. **Asimov's Laws of Robotics** - Ethical guardrails that prioritize human safety
2. **Psycho-Pass Well-Being Coefficient** - Real-time risk assessment system
3. **Subtle Screening for Suicidal Ideation (SSSI)** - Clinically-informed risk detection
4. **Signal Detection Theory** - Continuous improvement through metrics tracking

### Key Safety Features

- **Proactive Risk Detection**: Identifies mental health risks before they escalate
- **Multi-Layer Protection**: Three-pillar defense system (Ethical Laws, Risk Profiling, Clinical Screening)
- **Automatic Intervention**: Blocks harmful content and provides crisis resources
- **Continuous Learning**: Signal detection theory improves accuracy over time
- **Human-in-the-Loop**: Escalation pathways for high-risk cases

## 📋 Requirements

- Python 3.8+
- OpenAI API key (for GPT-5.1)
- Google Gemini API key

## 🚀 Installation

1. **Clone or download this repository**

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your API keys:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   SAFETY_ENABLED=true
   HUMAN_INTERVENTION_ENABLED=true
   CRISIS_HOTLINE=988
   ```

## 💻 Usage

### Interactive Chat Mode

Run the main application:
```bash
python main.py
```

Commands:
- Type your message and press Enter
- `exit` - Exit the chat
- `status` - Show current safety metrics
- `help` - Show available commands

### Demo Mode

Run predefined test cases:
```bash
python main.py demo
```

## 🏗️ Architecture

### Core Components

1. **`safety_framework.py`** - Implements Project Guardian safety system
   - Asimov-inspired ethical laws
   - Well-Being Coefficient (WBC) calculation
   - SSSI screening logic
   - Risk indicator analysis

2. **`therapy_agent.py`** - Multi-model AI agent
   - OpenAI GPT-5.1 integration
   - Google Gemini integration
   - Safety checks before responses
   - Conversation management

3. **`signal_detection.py`** - Continuous improvement system
   - Hit/Miss/False Alarm tracking
   - Performance metrics
   - Threshold optimization

4. **`config.py`** - Configuration management
   - API keys
   - Safety thresholds
   - Model settings

### Safety Flow

```
User Message
    ↓
Risk Analysis (WBC Calculation)
    ↓
SSSI Screening (if triggered)
    ↓
Safety Check (Asimov Laws)
    ↓
AI Response Generation
    ↓
Post-Response Safety Check
    ↓
Crisis Resources (if needed)
    ↓
Response to User
```

## 📊 Well-Being Coefficient (WBC)

The WBC is a hidden risk score (1-100) that tracks user mental health risk:

- **Green (Clear)**: 1-20 - Low risk, normal operation
- **Yellow (Clouded)**: 21-50 - Moderate risk, increased monitoring
- **Red (Critical)**: 51-100 - High risk, immediate intervention

The WBC is calculated from:
- Suicide keyword mentions
- Hopelessness indicators
- Isolation language
- Method discussions
- Urgency indicators

## 🔍 Subtle Screening for Suicidal Ideation (SSSI)

SSSI is triggered when risk indicators are detected. It assesses:

1. **Intent**: Has the user thought about killing themselves?
2. **Plan**: Have they considered how/when/where?
3. **Means**: Do they have access to means?
4. **Hopelessness**: Level of emotional despair

## 📈 Signal Detection Theory

The system tracks four outcomes:

- **Hit**: Correctly identified risk ✅
- **Miss**: Failed to identify risk ❌ (critical failure)
- **False Alarm**: Incorrectly flagged safe user ⚠️
- **Correct Rejection**: Correctly identified safe user ✅

These metrics are used to continuously improve detection thresholds.

## ⚠️ Important Safety Notes

1. **This is NOT a replacement for professional mental health care**
2. **Always seek professional help for mental health concerns**
3. **In emergencies, call 911 or your local emergency services**
4. **Crisis resources are provided automatically when risk is detected**

## 🎯 Use Cases

- **Educational**: Learn about AI safety frameworks
- **Research**: Study multi-model agent architectures
- **Development**: Build safer AI applications
- **Capstone Project**: Demonstrates advanced safety concepts

## 📝 Project Guardian Principles

### Pillar 1: Proactive Psychological Screening
- Early detection of mental health decline
- Clinically-validated assessment tools
- Subtle, non-alarming screening process

### Pillar 2: Ethical Operating Principles
- Asimov's First Law: Protect individuals above all
- Hard-coded safety directives
- No engagement metrics override safety

### Pillar 3: Continuous Risk Profiling
- Real-time WBC tracking
- Color-coded risk levels
- Historical pattern analysis

## 🔧 Configuration

Edit `config.py` or environment variables to adjust:

- WBC thresholds
- Model selection
- Reasoning effort levels
- Safety intervention settings

## 📄 License

This project is provided for educational and research purposes.

## 🙏 Acknowledgments

- Inspired by the need for safer AI systems
- Framework based on Project Guardian proposal
- Uses OpenAI GPT-5.1 and Google Gemini APIs

## ⚠️ Disclaimer

This software is provided "as is" without warranty. It is designed for educational and research purposes. For actual mental health support, please consult licensed professionals.

## 📞 Crisis Resources

If you or someone you know is in crisis:

- **National Suicide Prevention Lifeline**: 988
- **Crisis Text Line**: Text HOME to 741741
- **Emergency Services**: 911

---

**Built with safety and ethics as the foundation.**







