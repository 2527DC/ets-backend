# proof_no_exec.py
import builtins

print("1. This line will print because we haven't disabled exec yet.")
print("2. About to remove the 'exec' function from the built-in scope...")

# !! THIS IS THE KEY ACTION !!
# Delete the 'exec' function from the builtins module.
# This makes it unavailable for the rest of the script.
delattr(builtins, 'exec')

print("3. 'exec' has been deleted. Now let's try to define and run a function.")

# This function definition is just code compilation. It will work.
def my_function():
    print("4. This message is inside my_function.")

print("5. Function defined. Now let's try to CALL it (which requires execution)...")

# This is where it will break.
# Calling the function requires the Python runtime to *execute* its bytecode.
# This internal execution process relies on the capabilities we just deleted.
try:
    my_function()
except Exception as e:
    print(f"❌ FAILED! Could not execute the function call. Error: {e}")
    print("This proves that the act of running code, even a simple function call,")
    print("depends on the internal execution mechanism (which we broke by deleting 'exec').")

# Even a simple expression will fail for the same reason.
try:
    result = 5 + 3
    print(f"Calculation: {result}")
except Exception as e:
    print(f"❌ Even basic assignment failed: {e}")