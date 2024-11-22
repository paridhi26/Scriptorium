#!/bin/bash
FILE="/usr/src/app/$1"
LANGUAGE="$2"

echo "Debug: Starting script execution"
echo "File to execute: $FILE"
echo "Language: $LANGUAGE"

case "$LANGUAGE" in
    python)
        echo "Debug: Executing Python file"
        python3 "$FILE"
        ;;
    javascript)
        echo "Debug: Executing JavaScript file"
        node "$FILE"
        ;;
    java)
        echo "Debug: Compiling and executing Java file"
        javac "$FILE" && java -cp /usr/src/app Main
        ;;
    c)
        echo "Debug: Compiling and executing C file"
        gcc "$FILE" -o /usr/src/app/a.out && /usr/src/app/a.out
        ;;
    c++)
        echo "Debug: Compiling and executing C++ file"
        g++ "$FILE" -o /usr/src/app/a.out && /usr/src/app/a.out
        ;;
    *)
        echo "Debug: Unsupported language: $LANGUAGE"
        exit 1
        ;;
esac

echo "Debug: Script execution completed"
