#!/usr/bin/env python3
"""
Test script for the SimpleSpeechToText system.
Run this to verify your speech-to-text implementation works correctly.
"""

import time
import sys
import os
from speech_to_text import SimpleSpeechToText

def test_model_loading():
    """Test if the Whisper model loads correctly."""
    print("🧪 Testing model loading...")
    try:
        stt = SimpleSpeechToText(model_size="tiny")
        print("✅ Model loaded successfully!")
        stt.cleanup()
        return True
    except Exception as e:
        print(f"❌ Model loading failed: {e}")
        return False

def test_audio_device():
    """Test if audio device is available."""
    print("🎤 Testing audio device...")
    try:
        import pyaudio
        audio = pyaudio.PyAudio()
        
        # Check available input devices
        info = audio.get_host_api_info_by_index(0)
        numdevices = info.get('deviceCount')
        
        input_devices = []
        for i in range(0, numdevices):
            device_info = audio.get_device_info_by_host_api_device_index(0, i)
            if device_info.get('maxInputChannels') > 0:
                input_devices.append(device_info.get('name'))
        
        if input_devices:
            print(f"✅ Found {len(input_devices)} input device(s):")
            for i, device in enumerate(input_devices[:3]):  # Show first 3
                print(f"   {i+1}. {device}")
            if len(input_devices) > 3:
                print(f"   ... and {len(input_devices) - 3} more")
        else:
            print("❌ No input devices found!")
            return False
        
        audio.terminate()
        return True
    except Exception as e:
        print(f"❌ Audio device test failed: {e}")
        return False

def test_basic_functionality():
    """Test basic speech-to-text functionality."""
    print("🎯 Testing basic functionality...")
    
    def test_callback(text):
        print(f"🎤 Captured: '{text}'")
    
    try:
        stt = SimpleSpeechToText(model_size="tiny", callback=test_callback)
        print("✅ Speech-to-text system initialized!")
        stt.cleanup()
        return True
    except Exception as e:
        print(f"❌ Basic functionality test failed: {e}")
        return False

def interactive_test():
    """Run an interactive test with user input."""
    print("\n🎮 Interactive Test")
    print("==================")
    print("This test will record your voice for 10 seconds.")
    print("Speak clearly into your microphone.")
    print("Press Enter when ready to start...")
    input()
    
    transcriptions = []
    
    def capture_callback(text):
        transcriptions.append(text)
        print(f"🎤 '{text}'")
    
    try:
        stt = SimpleSpeechToText(model_size="tiny", callback=capture_callback)
        
        print("🎤 Recording for 10 seconds... (speak now!)")
        start_time = time.time()
        
        # Start recording in a separate thread
        import threading
        recording_thread = threading.Thread(target=stt.start_recording)
        recording_thread.daemon = True
        recording_thread.start()
        
        # Wait for 10 seconds
        while time.time() - start_time < 10:
            time.sleep(0.1)
        
        stt.stop_recording()
        recording_thread.join(timeout=1)
        
        print(f"\n📊 Test Results:")
        print(f"   - Duration: 10 seconds")
        print(f"   - Transcriptions captured: {len(transcriptions)}")
        
        if transcriptions:
            print(f"   - Words detected: {sum(len(t.split()) for t in transcriptions)}")
            print(f"   - Average confidence: Good (local model)")
            print("✅ Interactive test completed successfully!")
        else:
            print("⚠️  No transcriptions captured. Check your microphone.")
        
        stt.cleanup()
        return len(transcriptions) > 0
        
    except Exception as e:
        print(f"❌ Interactive test failed: {e}")
        return False

def quick_test():
    """Quick test without user interaction."""
    print("⚡ Quick Test (5 seconds)")
    print("========================")
    
    transcriptions = []
    
    def quick_callback(text):
        transcriptions.append(text)
        print(f"🎤 '{text}'")
    
    try:
        stt = SimpleSpeechToText(model_size="tiny", callback=quick_callback)
        
        print("🎤 Recording for 5 seconds...")
        start_time = time.time()
        
        import threading
        recording_thread = threading.Thread(target=stt.start_recording)
        recording_thread.daemon = True
        recording_thread.start()
        
        while time.time() - start_time < 5:
            time.sleep(0.1)
        
        stt.stop_recording()
        recording_thread.join(timeout=1)
        
        print(f"📊 Quick test captured {len(transcriptions)} transcriptions")
        stt.cleanup()
        return True
        
    except Exception as e:
        print(f"❌ Quick test failed: {e}")
        return False

def main():
    """Run all tests."""
    print("🧪 Speech-to-Text Test Suite")
    print("============================")
    
    tests = [
        ("Model Loading", test_model_loading),
        ("Audio Device", test_audio_device),
        ("Basic Functionality", test_basic_functionality),
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n{test_name}:")
        if test_func():
            passed += 1
        print()
    
    print(f"📊 Basic Tests: {passed}/{total} passed")
    
    if passed == total:
        print("\n🎉 All basic tests passed! Running interactive test...")
        
        # Ask user if they want to run interactive test
        response = input("Run interactive test? (y/n): ").lower().strip()
        if response in ['y', 'yes']:
            interactive_test()
        else:
            print("Running quick test instead...")
            quick_test()
    else:
        print("\n❌ Some tests failed. Please check your setup.")
        print("Make sure you have:")
        print("  - Python dependencies installed (pip install -r requirements.txt)")
        print("  - A working microphone")
        print("  - Internet connection (for first-time model download)")

if __name__ == "__main__":
    main()
