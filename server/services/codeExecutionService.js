import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to code execution directory
const CODE_DIR = path.join(__dirname, '..', 'code-execution');

/**
 * Service to handle code execution in a sandboxed Docker environment
 */
const CodeExecutionService = {
  /**
   * Execute code in a sandboxed environment
   * @param {string} language - Programming language (javascript, python, java)
   * @param {string} code - Source code to execute
   * @returns {Promise<{output: string, error: string}>} - Execution result
   */
  async executeCode(language, code) {
    // Generate unique ID for this execution
    const executionId = uuidv4();
    
    // Determine file extension based on language
    let fileExtension;
    switch (language.toLowerCase()) {
      case 'javascript':
        fileExtension = 'js';
        break;
      case 'python':
        fileExtension = 'py';
        break;
      case 'java':
        fileExtension = 'java';
        break;
      default:
        throw new Error(`Unsupported language: ${language}`);
    }
    
    // Create file path
    const fileName = `${executionId}.${fileExtension}`;
    const filePath = path.join(CODE_DIR, fileName);
    
    try {
      // Write code to file
      await fs.promises.writeFile(filePath, code);
      
      // Execute code in Docker container
      const result = await this.runInDocker(language, fileName);
      
      // Clean up file
      await fs.promises.unlink(filePath).catch(err => console.error('File cleanup error:', err));
      
      return result;
    } catch (error) {
      // Clean up file in case of error
      await fs.promises.unlink(filePath).catch(() => {});
      throw error;
    }
  },
  
  /**
   * Run code in Docker container
   * @param {string} language - Programming language
   * @param {string} fileName - Name of the file to execute
   * @returns {Promise<{output: string, error: string}>} - Execution result
   */
  runInDocker(language, fileName) {
    return new Promise((resolve, reject) => {
      // Command to execute code in Docker container
      const command = `docker exec joy-hacks-code-executor /app/run.sh ${language} /app/code/${fileName}`;
      
      exec(command, (error, stdout, stderr) => {
        // Read output file
        fs.readFile(path.join(CODE_DIR, 'output', 'result.txt'), 'utf8', (err, data) => {
          if (err) {
            resolve({ output: '', error: 'Failed to read execution output' });
            return;
          }
          
          resolve({ 
            output: data, 
            error: error ? error.message : ''
          });
        });
      });
    });
  }
};

export default CodeExecutionService;