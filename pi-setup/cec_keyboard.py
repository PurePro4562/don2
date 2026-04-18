#!/usr/bin/env python3
import subprocess
import re
import sys
import time

try:
    from evdev import UInput, ecodes as e
except ImportError:
    print("Please install evdev: sudo apt-get install python3-evdev")
    sys.exit(1)

# Map CEC remote buttons to standard keyboard keys
# These match the keyboard event listeners in the React app
KEY_MAP = {
    'up': e.KEY_UP,
    'down': e.KEY_DOWN,
    'left': e.KEY_LEFT,
    'right': e.KEY_RIGHT,
    'select': e.KEY_ENTER,
    'exit': e.KEY_ESC,
    'back': e.KEY_BACKSPACE,
    'return': e.KEY_BACKSPACE,
    'clear': e.KEY_BACKSPACE,
    'play': e.KEY_P,
    'pause': e.KEY_SPACE,
    'stop': e.KEY_ESC,
    'rewind': e.KEY_R,
    'fast forward': e.KEY_F
}

def main():
    print("Starting HDMI-CEC to Keyboard bridge...")
    
    # Create a virtual keyboard device at the kernel level
    # This works on both X11 and Wayland (Raspberry Pi OS Bookworm)
    ui = UInput(name="CEC-Virtual-Keyboard")
    
    # Start cec-client to listen to HDMI-CEC events from the TV
    process = subprocess.Popen(
        ['cec-client'], 
        stdout=subprocess.PIPE, 
        stderr=subprocess.STDOUT, 
        text=True
    )
    
    try:
        for line in iter(process.stdout.readline, ''):
            # Look for key press events in the cec-client output
            if "key pressed:" in line:
                match = re.search(r'key pressed: (.*?) \(\d+\)', line)
                if match:
                    cec_key = match.group(1).lower()
                    print(f"Remote pressed: {cec_key}")
                    
                    if cec_key in KEY_MAP:
                        key_code = KEY_MAP[cec_key]
                        # Simulate key down and key up
                        ui.write(e.EV_KEY, key_code, 1)
                        ui.write(e.EV_KEY, key_code, 0)
                        ui.syn()
    except KeyboardInterrupt:
        print("Shutting down...")
    finally:
        process.terminate()
        ui.close()

if __name__ == "__main__":
    # Small delay to ensure HDMI is fully initialized on boot
    time.sleep(5)
    main()
