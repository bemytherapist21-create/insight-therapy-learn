"""
Setup script to help configure the Safe Therapy Agent
"""
import os
import shutil


def setup_environment():
    """Create .env file from .env.example if it doesn't exist"""
    env_file = ".env"
    env_example = ".env.example"
    
    if os.path.exists(env_file):
        print(f"✓ {env_file} already exists")
        response = input("Do you want to overwrite it? (y/N): ").strip().lower()
        if response != 'y':
            print("Keeping existing .env file")
            return
    
    if os.path.exists(env_example):
        shutil.copy(env_example, env_file)
        print(f"✓ Created {env_file} from {env_example}")
        print("\n⚠️  IMPORTANT: Please edit .env and add your API keys:")
        print("   - OPENAI_API_KEY")
        print("   - GEMINI_API_KEY")
    else:
        # Create .env from scratch
        env_content = """# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Safety Configuration
SAFETY_ENABLED=true
HUMAN_INTERVENTION_ENABLED=true
CRISIS_HOTLINE=988
"""
        with open(env_file, 'w') as f:
            f.write(env_content)
        print(f"✓ Created {env_file}")
        print("\n⚠️  IMPORTANT: Please edit .env and add your API keys")


def check_dependencies():
    """Check if required packages are installed"""
    required_packages = [
        'openai',
        'google.generativeai',
        'dotenv',
        'numpy',
        'pydantic'
    ]
    
    missing = []
    for package in required_packages:
        try:
            if package == 'dotenv':
                __import__('dotenv')
            elif package == 'google.generativeai':
                __import__('google.generativeai')
            else:
                __import__(package)
            print(f"✓ {package} is installed")
        except ImportError:
            print(f"✗ {package} is NOT installed")
            missing.append(package)
    
    if missing:
        print(f"\n⚠️  Missing packages: {', '.join(missing)}")
        print("Run: pip install -r requirements.txt")
        return False
    
    return True


if __name__ == "__main__":
    print("="*60)
    print("Safe Therapy Agent - Setup")
    print("="*60)
    print()
    
    print("1. Checking dependencies...")
    deps_ok = check_dependencies()
    print()
    
    print("2. Setting up environment...")
    setup_environment()
    print()
    
    if deps_ok:
        print("="*60)
        print("Setup complete!")
        print("="*60)
        print("\nNext steps:")
        print("1. Edit .env and add your API keys")
        print("2. Run: python main.py")
        print("   Or: python main.py demo")
    else:
        print("="*60)
        print("Setup incomplete - please install missing dependencies")
        print("="*60)







