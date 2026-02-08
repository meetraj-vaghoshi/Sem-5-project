import random
import sys

def calculate_parity_bit(data_str, mode="even"):
    ones = data_str.count('1')
    if mode == "even":
        return "0" if ones % 2 == 0 else "1"
    else:
        return "1" if ones % 2 == 0 else "0"

def flip_bits(data_str, num_flips):
    bit_list = list(data_str)
    num_to_flip = min(num_flips, len(bit_list))
    indices = random.sample(range(len(bit_list)), num_to_flip)
    for i in indices:
        bit_list[i] = '1' if bit_list[i] == '0' else '0'
    return "".join(bit_list), indices

def get_binary_input():
    while True:
        data = input("\nEnter binary data (or 'q' to quit): ").strip().lower()
        if data == 'q': return None
        if all(bit in '01' for bit in data) and len(data) > 0:
            return data
        print("❌ Invalid! Use only 0s and 1s.")

def get_mode_input():
    while True:
        mode = input("Select Parity Mode (even/odd) or 'q': ").lower().strip()
        if mode == 'q': return None
        if mode in ['even', 'odd']:
            return mode
        print("❌ Invalid! Type 'even' or 'odd'.")

def run_system():
    print("--- 🛠️ Pro Parity Analyzer ---")
    
    while True:
        # STEP 1: Setup Data and Mode
        user_data = get_binary_input()
        if user_data is None: break
        
        mode = get_mode_input()
        if mode is None: break
        
        p_bit = calculate_parity_bit(user_data, mode)
        encoded = user_data + p_bit
        
        # STEP 2: Trial Loop
        while True:
            print(f"\n[CURRENT SETTINGS] Data: {user_data} | Mode: {mode} | Encoded: {encoded}")
            print("-" * 50)
            print("Options: [Number] = bits to flip | 'r' = Reset/New Data | 'q' = Quit")
            choice = input("Your choice: ").strip().lower()

            if choice == 'q':
                print("Exiting... Have a Good Day  Buddy!")
                sys.exit()
            if choice == 'r':
                print("\n🔄 Resetting... back to main menu.")
                break # Breaks trial loop to restart setup loop
            
            if not choice.isdigit():
                print("❌ Invalid choice. Enter a number, 'r', or 'q'.")
                continue

            num_errors = int(choice)
            if num_errors > len(encoded):
                print(f"❌ Error: Max flips possible is {len(encoded)}.")
                continue

            # STEP 3: Execution & Results
            corrupted, flipped_indices = flip_bits(encoded, num_errors)
            ones_count = corrupted.count('1')
            is_valid = (ones_count % 2 == 0) if mode == "even" else (ones_count % 2 != 0)
                
            print(f"\n--- TRIAL RESULT ---")
            print(f"Received: {corrupted}")
            print(f"Flipped : {flipped_indices}")
            
            if is_valid:
                print("Status: ✅ PASSED" + (" (ERROR NOT DETECTED! ⚠️)" if num_errors > 0 else ""))
            else:
                print("Status: ❌ ERROR DETECTED")

if __name__ == "__main__":
    run_system()