#!/usr/bin/env python3
"""
Setup script to configure Minimax API credentials in .env file
"""

import os

def setup_minimax_env():
    """Add Minimax credentials to .env file"""
    
    # Minimax credentials
    MINIMAX_API_KEY = "sk-api-ofMWekAQeCaLWd4yhbdulrADKtgmTFp1qOAYE0VKvk7SYBx1pWg-VT5SCIo3i_DfaDUmkxqXAXgM72ggWDH18YPd9gqqIFXCuUxEJ_sN-bsGfa8EF9rrnww"
    MINIMAX_VOICE_ID = "moss_audio_bccfab56-ed6a-11f0-b6f2-dec5318e06e3"
    
    env_file_path = ".env"
    
    # Read existing .env file
    env_lines = []
    if os.path.exists(env_file_path):
        with open(env_file_path, 'r') as f:
            env_lines = f.readlines()
    
    # Check if Minimax variables already exist
    has_api_key = any('MINIMAX_API_KEY' in line for line in env_lines)
    has_voice_id = any('MINIMAX_VOICE_ID' in line for line in env_lines)
    
    # Add Minimax variables if they don't exist
    if not has_api_key or not has_voice_id:
        with open(env_file_path, 'a') as f:
            if not has_api_key:
                f.write(f"\nMINIMAX_API_KEY={MINIMAX_API_KEY}\n")
                print("✅ Added MINIMAX_API_KEY to .env")
            else:
                print("ℹ️  MINIMAX_API_KEY already exists in .env")
            
            if not has_voice_id:
                f.write(f"MINIMAX_VOICE_ID={MINIMAX_VOICE_ID}\n")
                print("✅ Added MINIMAX_VOICE_ID to .env")
            else:
                print("ℹ️  MINIMAX_VOICE_ID already exists in .env")
    else:
        print("ℹ️  Minimax credentials already configured in .env")
    
    print("\n🎉 Setup complete!")
    print("\nNext steps:")
    print("1. Install dependencies: pip install -r requirements.txt")
    print("2. Test the integration: python test_minimax.py")
    print("3. Start the server: python main.py")

if __name__ == "__main__":
    print("=" * 50)
    print("  MINIMAX VOICE AI SETUP")
    print("=" * 50)
    print()
    setup_minimax_env()
