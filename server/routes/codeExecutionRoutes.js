import express from 'express';
import CodeExecutionService from '../services/codeExecutionService.js';

const router = express.Router();

/**
 * Execute code in a sandboxed environment
 * POST /api/code/execute
 * Body: { language: string, code: string }
 */
router.post('/execute', async (req, res) => {
  try {
    const { language, code } = req.body;
    
    if (!language || !code) {
      return res.status(400).json({ error: 'Language and code are required' });
    }
    
    // Validate language
    const supportedLanguages = ['javascript', 'python', 'java'];
    if (!supportedLanguages.includes(language.toLowerCase())) {
      return res.status(400).json({ error: `Unsupported language: ${language}. Supported languages are: ${supportedLanguages.join(', ')}` });
    }
    
    // Execute code
    const result = await CodeExecutionService.executeCode(language, code);
    
    res.json(result);
  } catch (error) {
    console.error('Code execution error:', error);
    res.status(500).json({ error: error.message || 'Failed to execute code' });
  }
});

export default router;