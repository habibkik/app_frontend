# MiroMind Backend API - Express/Node.js Example

This is a sample backend structure for the MiroMind API using Express and the Anthropic Claude SDK.

## Setup

```bash
npm install express cors anthropic dotenv
```

## Environment Variables (.env.local)

```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
PORT=3001
```

## Server Code (server.js)

```javascript
require('dotenv').config({ path: '.env.local' });
const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk').default;

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Large limit for base64 images

// System prompt for product analysis
const PRODUCT_ANALYSIS_PROMPT = `You are MiroMind, an expert product analyst specializing in identifying components and materials from product images. 

Your task is to analyze the provided product image and identify:
1. The product name and category
2. All visible components with their specifications
3. Materials used
4. Estimated unit costs based on your knowledge of manufacturing

For each component, provide:
- name: A clear, descriptive name
- category: The component category (e.g., "Electronics", "Structural", "Fasteners", "Display", "Power", "Connectivity")
- quantity: Estimated quantity visible or typically required
- unit: Unit of measurement (piece, set, meters, etc.)
- estimatedUnitCost: Your best estimate in USD based on typical manufacturing costs
- specifications: Technical specifications you can infer
- material: Primary material(s)
- confidence: Your confidence level (0-100) in this identification

Be thorough but accurate. Only include components you can reasonably identify or infer from the image.

Respond with a JSON object in this exact format:
{
  "productName": "string",
  "productCategory": "string",
  "components": [...],
  "suggestedTags": ["tag1", "tag2"],
  "attributes": {"key": "value"},
  "overallConfidence": number
}`;

/**
 * POST /api/miromind/analyze
 * Analyzes a product image using Claude Vision
 */
app.post('/api/miromind/analyze', async (req, res) => {
  try {
    const { image, mimeType, context, systemPrompt } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Image is required' });
    }

    // Build the message content
    const userContent = [
      {
        type: 'image',
        source: {
          type: 'base64',
          media_type: mimeType || 'image/jpeg',
          data: image,
        },
      },
      {
        type: 'text',
        text: context 
          ? `Analyze this product image. Additional context: ${context}` 
          : 'Analyze this product image and identify all components.',
      },
    ];

    // Call Claude Vision API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt || PRODUCT_ANALYSIS_PROMPT,
      messages: [
        {
          role: 'user',
          content: userContent,
        },
      ],
    });

    // Extract text response
    const textContent = response.content.find(c => c.type === 'text');
    if (!textContent) {
      throw new Error('No text response from Claude');
    }

    // Parse JSON from response
    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from response');
    }

    const analysisResult = JSON.parse(jsonMatch[0]);

    res.json(analysisResult);
  } catch (error) {
    console.error('MiroMind analyze error:', error);
    res.status(500).json({ 
      error: 'Analysis failed', 
      details: error.message 
    });
  }
});

/**
 * POST /api/miromind/generate-content
 * Generates marketing content for a product
 */
app.post('/api/miromind/generate-content', async (req, res) => {
  try {
    const { 
      productName, 
      productCategory, 
      components, 
      attributes, 
      contentType, 
      systemPrompt,
      maxLength 
    } = req.body;

    if (!productName) {
      return res.status(400).json({ error: 'Product name is required' });
    }

    // Build context for content generation
    const productContext = `
Product: ${productName}
Category: ${productCategory || 'General'}
Components: ${components?.map(c => c.name).join(', ') || 'N/A'}
Attributes: ${JSON.stringify(attributes || {})}
Content Type: ${contentType || 'description'}
${maxLength ? `Maximum Length: ${maxLength} words` : ''}
    `.trim();

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt || 'You are MiroMind, a skilled product copywriter. Generate compelling content based on the product details provided.',
      messages: [
        {
          role: 'user',
          content: `Generate ${contentType || 'description'} content for this product:\n\n${productContext}`,
        },
      ],
    });

    const textContent = response.content.find(c => c.type === 'text');
    
    res.json({
      content: textContent?.text || '',
      contentType: contentType || 'description',
    });
  } catch (error) {
    console.error('MiroMind generate-content error:', error);
    res.status(500).json({ 
      error: 'Content generation failed', 
      details: error.message 
    });
  }
});

/**
 * Health check endpoint
 */
app.get('/api/miromind/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'MiroMind API',
    version: '1.0.0',
    hasApiKey: !!process.env.ANTHROPIC_API_KEY,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`MiroMind API server running on port ${PORT}`);
  console.log(`Anthropic API Key configured: ${!!process.env.ANTHROPIC_API_KEY}`);
});
```

## TypeScript Version (server.ts)

```typescript
import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';

const app = express();
const PORT = process.env.PORT || 3001;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));

interface AnalyzeRequest {
  image: string;
  mimeType?: string;
  context?: string;
  systemPrompt?: string;
}

interface GenerateContentRequest {
  productName: string;
  productCategory?: string;
  components?: Array<{ name: string; material?: string }>;
  attributes?: Record<string, string>;
  contentType?: 'description' | 'social' | 'ad' | 'technical';
  systemPrompt?: string;
  maxLength?: number;
}

// ... (same implementation as above with TypeScript types)

app.listen(PORT, () => {
  console.log(`MiroMind API server running on port ${PORT}`);
});
```

## Frontend Configuration

In your Lovable project, set the environment variable to point to your backend:

```
VITE_MIROMIND_API_ENDPOINT=http://localhost:3001/api/miromind
```

For production, replace with your deployed backend URL.

## Usage

1. Start your backend: `node server.js`
2. The MiroMind agent in your Lovable app will automatically call these endpoints
3. Upload a product image in the BOM page to test

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/miromind/analyze` | POST | Analyze product image for BOM (Producer mode) |
| `/api/miromind/analyze-for-sourcing` | POST | Analyze product for supplier discovery (Buyer mode) |
| `/api/miromind/analyze-for-selling` | POST | Analyze product for market intelligence (Seller mode) |
| `/api/miromind/generate-content` | POST | Generate marketing content |
| `/api/miromind/health` | GET | Health check |

---

## New Endpoints for Multi-Mode Support

### POST /api/miromind/analyze-for-sourcing (Buyer Mode)

Analyzes a product image to find matching suppliers and alternatives.

```javascript
app.post('/api/miromind/analyze-for-sourcing', async (req, res) => {
  try {
    const { image, mimeType, context, systemPrompt } = req.body;

    const userContent = [
      {
        type: 'image',
        source: { type: 'base64', media_type: mimeType || 'image/jpeg', data: image },
      },
      {
        type: 'text',
        text: context 
          ? `Analyze this product for sourcing. Context: ${context}` 
          : 'Analyze this product image and identify sourcing requirements.',
      },
    ];

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userContent }],
    });

    const textContent = response.content.find(c => c.type === 'text');
    const jsonMatch = textContent?.text.match(/\{[\s\S]*\}/);
    const result = JSON.parse(jsonMatch?.[0] || '{}');

    res.json(result);
  } catch (error) {
    console.error('Sourcing analysis error:', error);
    res.status(500).json({ error: 'Analysis failed', details: error.message });
  }
});
```

### POST /api/miromind/analyze-for-selling (Seller Mode)

Analyzes a product image for market intelligence and competitive positioning.

```javascript
app.post('/api/miromind/analyze-for-selling', async (req, res) => {
  try {
    const { image, mimeType, context, systemPrompt } = req.body;

    const userContent = [
      {
        type: 'image',
        source: { type: 'base64', media_type: mimeType || 'image/jpeg', data: image },
      },
      {
        type: 'text',
        text: context 
          ? `Analyze this product for market positioning. Context: ${context}` 
          : 'Analyze this product for market intelligence and pricing strategy.',
      },
    ];

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userContent }],
    });

    const textContent = response.content.find(c => c.type === 'text');
    const jsonMatch = textContent?.text.match(/\{[\s\S]*\}/);
    const result = JSON.parse(jsonMatch?.[0] || '{}');

    res.json(result);
  } catch (error) {
    console.error('Market analysis error:', error);
    res.status(500).json({ error: 'Analysis failed', details: error.message });
  }
});
```
