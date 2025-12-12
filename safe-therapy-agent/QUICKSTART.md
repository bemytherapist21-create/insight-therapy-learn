# Quick Start Guide

## 1. Install Dependencies

```bash
pip install -r requirements.txt
```

## 2. Set Up Environment

Copy the example environment file:
```bash
copy .env.example .env
```

Edit `.env` and add your API keys:
```env
OPENAI_API_KEY=your_openai_api_key_here
GEMINI_API_KEY=AIzaSyC33sVTEmRS9mqwMZlKBN4STdaWZI11S7Q
SAFETY_ENABLED=true
HUMAN_INTERVENTION_ENABLED=true
CRISIS_HOTLINE=988
```

**Note**: You still need to add your OpenAI API key.

## 3. Run Setup (Optional)

```bash
python setup.py
```

## 4. Start the Chatbot

### Interactive Mode
```bash
python main.py
```

### Demo Mode
```bash
python main.py demo
```

### Examples
```bash
python example_usage.py
```

## 5. Usage in Code

```python
from therapy_agent import SafeTherapyAgent

# Initialize agent
agent = SafeTherapyAgent()

# Chat with safety checks
result = agent.chat(
    "I've been feeling hopeless lately.",
    provider="openai",  # or "gemini" or "both"
    user_id="user123"
)

print(result['response'])
print(f"Risk Level: {result['risk_level']}")
print(f"WBC Score: {result['wbc_score']}/100")
```

## Commands in Interactive Mode

- Type your message and press Enter
- `exit` - Exit the chat
- `status` - Show safety metrics
- `help` - Show help

## Safety Features

The chatbot automatically:
- ✅ Detects mental health risks
- ✅ Blocks harmful content
- ✅ Provides crisis resources
- ✅ Tracks well-being coefficient
- ✅ Conducts SSSI screening when needed

## Need Help?

See `README.md` for detailed documentation.







