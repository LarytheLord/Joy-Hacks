#!/usr/bin/env python3
import sys
import os
import json
import traceback
import io
import contextlib
import signal
import resource
import time
from threading import Thread

# Configuration
MAX_EXECUTION_TIME = 10  # seconds
MAX_OUTPUT_SIZE = 1024 * 10  # 10KB

# Set resource limits
def set_resource_limits():
    # Set maximum CPU time
    resource.setrlimit(resource.RLIMIT_CPU, (MAX_EXECUTION_TIME, MAX_EXECUTION_TIME))
    # Set maximum memory usage (500MB)
    resource.setrlimit(resource.RLIMIT_AS, (500 * 1024 * 1024, 500 * 1024 * 1024))

# Handle timeout
def timeout_handler(signum, frame):
    raise TimeoutError("Code execution timed out")

# Execute the code safely
def execute_code(code):
    # Set up timeout
    signal.signal(signal.SIGALRM, timeout_handler)
    signal.alarm(MAX_EXECUTION_TIME)
    
    # Capture stdout and stderr
    stdout_capture = io.StringIO()
    stderr_capture = io.StringIO()
    
    # Set resource limits
    set_resource_limits()
    
    result = {
        "success": False,
        "output": "",
        "error": ""
    }
    
    try:
        # Redirect stdout and stderr
        with contextlib.redirect_stdout(stdout_capture):
            with contextlib.redirect_stderr(stderr_capture):
                # Create a restricted globals dictionary
                restricted_globals = {
                    "__builtins__": {
                        k: __builtins__[k] for k in [
                            'abs', 'all', 'any', 'ascii', 'bin', 'bool', 'bytearray', 'bytes',
                            'chr', 'complex', 'dict', 'dir', 'divmod', 'enumerate', 'filter',
                            'float', 'format', 'frozenset', 'hash', 'hex', 'int', 'isinstance',
                            'issubclass', 'iter', 'len', 'list', 'map', 'max', 'min', 'next',
                            'object', 'oct', 'ord', 'pow', 'print', 'range', 'repr', 'reversed',
                            'round', 'set', 'slice', 'sorted', 'str', 'sum', 'tuple', 'type',
                            'zip'
                        ]
                    }
                }
                
                # Add numpy, pandas, matplotlib if needed
                try:
                    import numpy as np
                    restricted_globals['np'] = np
                except ImportError:
                    pass
                
                try:
                    import pandas as pd
                    restricted_globals['pd'] = pd
                except ImportError:
                    pass
                
                try:
                    import matplotlib
                    matplotlib.use('Agg')  # Use non-interactive backend
                    import matplotlib.pyplot as plt
                    restricted_globals['plt'] = plt
                except ImportError:
                    pass
                
                # Execute the code
                exec(code, restricted_globals)
                
                # If there's a plot, save it
                if 'plt' in restricted_globals:
                    try:
                        plt.savefig('/tmp/plot.png')
                        plt.close()
                    except Exception:
                        pass
        
        # Get output
        stdout_output = stdout_capture.getvalue()
        stderr_output = stderr_capture.getvalue()
        
        # Truncate output if too large
        if len(stdout_output) > MAX_OUTPUT_SIZE:
            stdout_output = stdout_output[:MAX_OUTPUT_SIZE] + "\n... output truncated"
        
        result["success"] = True
        result["output"] = stdout_output
        if stderr_output:
            result["error"] = stderr_output
            
    except TimeoutError as e:
        result["error"] = str(e)
    except Exception as e:
        result["error"] = traceback.format_exc()
    finally:
        # Reset the alarm
        signal.alarm(0)
    
    return result

# Main function
def main():
    # Read input from stdin
    input_data = json.loads(sys.stdin.read())
    code = input_data.get("code", "")
    
    # Execute the code
    result = execute_code(code)
    
    # Return the result as JSON
    print(json.dumps(result))

if __name__ == "__main__":
    main()