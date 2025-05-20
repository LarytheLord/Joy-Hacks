#!/bin/sh

# Script to execute code in a sandboxed environment
# Usage: ./run.sh <language> <file_path>

LANGUAGE=$1
FILE_PATH=$2
OUTPUT_DIR="/app/output"

# Create output directory if it doesn't exist
mkdir -p $OUTPUT_DIR

# Set execution timeout (5 seconds)
TIMEOUT=5

case $LANGUAGE in
  "javascript")
    timeout $TIMEOUT node $FILE_PATH > $OUTPUT_DIR/result.txt 2>&1
    ;;
  "python")
    timeout $TIMEOUT python3 $FILE_PATH > $OUTPUT_DIR/result.txt 2>&1
    ;;
  "java")
    FILENAME=$(basename $FILE_PATH .java)
    javac $FILE_PATH -d $OUTPUT_DIR
    timeout $TIMEOUT java -cp $OUTPUT_DIR $FILENAME > $OUTPUT_DIR/result.txt 2>&1
    ;;
  *)
    echo "Unsupported language: $LANGUAGE" > $OUTPUT_DIR/result.txt
    exit 1
    ;;
esac

EXIT_CODE=$?

if [ $EXIT_CODE -eq 124 ]; then
  echo "Execution timed out after $TIMEOUT seconds" >> $OUTPUT_DIR/result.txt
fi

exit $EXIT_CODE