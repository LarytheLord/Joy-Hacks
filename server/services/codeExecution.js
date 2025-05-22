import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const execAsync = promisify(exec);

// Supported languages and their file extensions
const LANGUAGES = {
  python: 'py',
  javascript: 'js',
  java: 'java',
  cpp: 'cpp',
  c: 'c'
};

// Language-specific compilation and execution commands
const COMMANDS = {
  python: {
    run: (filePath) => `python ${filePath}`
  },
  javascript: {
    run: (filePath) => `node ${filePath}`
  },
  java: {
    compile: (filePath) => `javac ${filePath}`,
    run: (filePath) => `java ${path.basename(filePath, '.java')}`
  },
  cpp: {
    compile: (filePath) => `g++ ${filePath} -o ${filePath}.out`,
    run: (filePath) => `${filePath}.out`
  },
  c: {
    compile: (filePath) => `gcc ${filePath} -o ${filePath}.out`,
    run: (filePath) => `${filePath}.out`
  }
};

// Execute code in the specified language
export const executeCode = async (code, language) => {
  if (!LANGUAGES[language]) {
    throw new Error(`Unsupported language: ${language}`);
  }

  const fileName = `${uuidv4()}.${LANGUAGES[language]}`;
  const filePath = path.join('/tmp', fileName);

  try {
    // Write code to temporary file
    await fs.promises.writeFile(filePath, code);

    let output = '';
    let error = '';

    // Compile if needed
    if (COMMANDS[language].compile) {
      try {
        await execAsync(COMMANDS[language].compile(filePath));
      } catch (compileError) {
        error = compileError.stderr;
        throw new Error(`Compilation error: ${error}`);
      }
    }

    // Execute code
    try {
      const { stdout, stderr } = await execAsync(COMMANDS[language].run(filePath));
      output = stdout;
      if (stderr) {
        error = stderr;
      }
    } catch (execError) {
      error = execError.stderr;
      throw new Error(`Execution error: ${error}`);
    }

    // Clean up
    await cleanup(filePath, language);

    return {
      output,
      error,
      language
    };
  } catch (error) {
    // Clean up on error
    await cleanup(filePath, language);
    throw error;
  }
};

// Clean up temporary files
const cleanup = async (filePath, language) => {
  try {
    await fs.promises.unlink(filePath);
    if (COMMANDS[language].compile) {
      await fs.promises.unlink(`${filePath}.out`);
    }
  } catch (error) {
    console.error('Error cleaning up files:', error);
  }
}; 