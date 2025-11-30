#!/usr/bin/env node

/**
 * Populate Course Modules and Lessons for Dr. Lee Courses
 * Creates comprehensive curriculum structure following Shu-Ha-Ri methodology
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

// Course content definitions with Shu-Ha-Ri structure
const courseContent = {
  'production-ai': {
    modules: [
      {
        title: 'Module 1: MLOps Foundation',
        description: 'Understanding production AI systems and MLOps fundamentals',
        lessons: [
          { title: 'Introduction to Production AI', type: 'video', duration: 1200 },
          { title: 'MLOps vs DevOps: Key Differences', type: 'video', duration: 900 },
          { title: 'The AI Product Factory Concept', type: 'article' },
          { title: 'Setting Up Your Development Environment', type: 'video', duration: 1500 },
          { title: 'Module 1 Assessment', type: 'quiz' }
        ]
      },
      {
        title: 'Module 2: Data Pipeline Architecture',
        description: 'Building robust data pipelines for ML systems',
        lessons: [
          { title: 'Data Ingestion Patterns', type: 'video', duration: 1100 },
          { title: 'Feature Engineering at Scale', type: 'video', duration: 1300 },
          { title: 'Data Validation and Quality', type: 'video', duration: 1000 },
          { title: 'Hands-On: Building Your First Pipeline', type: 'assignment' },
          { title: 'Module 2 Assessment', type: 'quiz' }
        ]
      },
      {
        title: 'Module 3: Model Training Infrastructure',
        description: 'Scalable training systems and experiment tracking',
        lessons: [
          { title: 'Distributed Training Fundamentals', type: 'video', duration: 1400 },
          { title: 'Experiment Tracking with MLflow', type: 'video', duration: 1200 },
          { title: 'Hyperparameter Optimization', type: 'video', duration: 1100 },
          { title: 'GPU Cluster Management', type: 'video', duration: 900 },
          { title: 'Hands-On: Training at Scale', type: 'assignment' }
        ]
      },
      {
        title: 'Module 4: Model Serving and Deployment',
        description: 'Deploying models to production with confidence',
        lessons: [
          { title: 'Model Serving Architectures', type: 'video', duration: 1300 },
          { title: 'Containerization with Docker', type: 'video', duration: 1100 },
          { title: 'Kubernetes for ML Workloads', type: 'video', duration: 1500 },
          { title: 'A/B Testing and Canary Deployments', type: 'video', duration: 1000 },
          { title: 'Module 4 Assessment', type: 'quiz' }
        ]
      },
      {
        title: 'Module 5: Monitoring and Observability',
        description: 'Keeping your ML systems healthy in production',
        lessons: [
          { title: 'Model Monitoring Fundamentals', type: 'video', duration: 1200 },
          { title: 'Detecting Data Drift', type: 'video', duration: 1100 },
          { title: 'Performance Monitoring Dashboards', type: 'video', duration: 900 },
          { title: 'Alerting and Incident Response', type: 'video', duration: 1000 },
          { title: 'Hands-On: Building a Monitoring System', type: 'assignment' }
        ]
      },
      {
        title: 'Module 6: CI/CD for Machine Learning',
        description: 'Automating the ML lifecycle',
        lessons: [
          { title: 'ML-Specific CI/CD Patterns', type: 'video', duration: 1200 },
          { title: 'Testing ML Models', type: 'video', duration: 1100 },
          { title: 'Automated Retraining Pipelines', type: 'video', duration: 1300 },
          { title: 'Module 6 Assessment', type: 'quiz' }
        ]
      },
      {
        title: 'Module 7: Cost Optimization',
        description: 'Managing cloud costs for ML workloads',
        lessons: [
          { title: 'Understanding ML Infrastructure Costs', type: 'video', duration: 900 },
          { title: 'Spot Instances and Preemptible VMs', type: 'video', duration: 1000 },
          { title: 'Model Optimization for Inference', type: 'video', duration: 1200 },
          { title: 'Hands-On: Cost Analysis Project', type: 'assignment' }
        ]
      },
      {
        title: 'Module 8: Security and Compliance',
        description: 'Securing ML systems and meeting compliance requirements',
        lessons: [
          { title: 'ML Security Fundamentals', type: 'video', duration: 1100 },
          { title: 'Data Privacy in ML', type: 'video', duration: 1000 },
          { title: 'Model Governance', type: 'video', duration: 900 },
          { title: 'Module 8 Assessment', type: 'quiz' }
        ]
      },
      {
        title: 'Module 9: LLM Operations (LLMOps)',
        description: 'Special considerations for large language models',
        lessons: [
          { title: 'LLMOps Overview', type: 'video', duration: 1200 },
          { title: 'Prompt Management Systems', type: 'video', duration: 1100 },
          { title: 'RAG Pipeline Operations', type: 'video', duration: 1400 },
          { title: 'LLM Evaluation Frameworks', type: 'video', duration: 1000 },
          { title: 'Hands-On: Building an LLMOps Pipeline', type: 'assignment' }
        ]
      },
      {
        title: 'Module 10: Edge Deployment',
        description: 'Deploying models to edge devices',
        lessons: [
          { title: 'Edge AI Fundamentals', type: 'video', duration: 1000 },
          { title: 'Model Quantization and Pruning', type: 'video', duration: 1200 },
          { title: 'ONNX and TensorRT', type: 'video', duration: 1100 },
          { title: 'Module 10 Assessment', type: 'quiz' }
        ]
      },
      {
        title: 'Module 11: Capstone Project',
        description: 'Build a complete production AI system',
        lessons: [
          { title: 'Capstone Project Overview', type: 'video', duration: 600 },
          { title: 'Architecture Design Document', type: 'assignment' },
          { title: 'Implementation Phase', type: 'assignment' },
          { title: 'Final Presentation and Review', type: 'assignment' }
        ]
      }
    ]
  },
  'graphrag-system': {
    modules: [
      {
        title: 'Module 1: Knowledge Graphs Fundamentals',
        description: 'Understanding graph databases and knowledge representation',
        lessons: [
          { title: 'Introduction to Knowledge Graphs', type: 'video', duration: 1200 },
          { title: 'Graph Database Concepts', type: 'video', duration: 1100 },
          { title: 'Neo4j Fundamentals', type: 'video', duration: 1400 },
          { title: 'Cypher Query Language', type: 'video', duration: 1300 },
          { title: 'Hands-On: Your First Knowledge Graph', type: 'assignment' }
        ]
      },
      {
        title: 'Module 2: RAG Architecture Deep Dive',
        description: 'Understanding Retrieval-Augmented Generation',
        lessons: [
          { title: 'RAG System Architecture', type: 'video', duration: 1200 },
          { title: 'Vector Embeddings and Similarity Search', type: 'video', duration: 1300 },
          { title: 'Chunking Strategies', type: 'video', duration: 1000 },
          { title: 'Module 2 Assessment', type: 'quiz' }
        ]
      },
      {
        title: 'Module 3: Building GraphRAG Pipelines',
        description: 'Combining knowledge graphs with RAG',
        lessons: [
          { title: 'GraphRAG Architecture Patterns', type: 'video', duration: 1400 },
          { title: 'Entity Extraction and Linking', type: 'video', duration: 1200 },
          { title: 'Relationship Extraction', type: 'video', duration: 1100 },
          { title: 'Graph-Enhanced Retrieval', type: 'video', duration: 1300 },
          { title: 'Hands-On: Building a GraphRAG System', type: 'assignment' }
        ]
      },
      {
        title: 'Module 4: Advanced Query Strategies',
        description: 'Optimizing retrieval for complex queries',
        lessons: [
          { title: 'Multi-Hop Reasoning', type: 'video', duration: 1200 },
          { title: 'Hybrid Search Strategies', type: 'video', duration: 1100 },
          { title: 'Query Decomposition', type: 'video', duration: 1000 },
          { title: 'Module 4 Assessment', type: 'quiz' }
        ]
      },
      {
        title: 'Module 5: Knowledge Graph Construction',
        description: 'Automated knowledge graph building from documents',
        lessons: [
          { title: 'Document Processing Pipelines', type: 'video', duration: 1200 },
          { title: 'LLM-Based Entity Extraction', type: 'video', duration: 1300 },
          { title: 'Graph Schema Design', type: 'video', duration: 1100 },
          { title: 'Hands-On: Automated KG Construction', type: 'assignment' }
        ]
      },
      {
        title: 'Module 6: Evaluation and Quality',
        description: 'Measuring and improving GraphRAG performance',
        lessons: [
          { title: 'RAG Evaluation Metrics', type: 'video', duration: 1000 },
          { title: 'Graph Quality Assessment', type: 'video', duration: 900 },
          { title: 'A/B Testing GraphRAG Systems', type: 'video', duration: 1100 },
          { title: 'Module 6 Assessment', type: 'quiz' }
        ]
      },
      {
        title: 'Module 7: Production Deployment',
        description: 'Deploying GraphRAG at scale',
        lessons: [
          { title: 'Scaling Graph Databases', type: 'video', duration: 1200 },
          { title: 'Caching Strategies', type: 'video', duration: 1000 },
          { title: 'Performance Optimization', type: 'video', duration: 1100 },
          { title: 'Hands-On: Production Deployment', type: 'assignment' }
        ]
      },
      {
        title: 'Module 8: Capstone Project',
        description: 'Build a complete GraphRAG application',
        lessons: [
          { title: 'Project Planning', type: 'video', duration: 600 },
          { title: 'Implementation', type: 'assignment' },
          { title: 'Final Presentation', type: 'assignment' }
        ]
      }
    ]
  },
  'machine-learning-intuition': {
    modules: [
      {
        title: 'Module 1: The Learning Paradigm',
        description: 'Understanding how machines learn from data',
        lessons: [
          { title: 'What is Machine Learning?', type: 'video', duration: 1000 },
          { title: 'Types of Learning: Supervised, Unsupervised, Reinforcement', type: 'video', duration: 1200 },
          { title: 'The ML Workflow', type: 'video', duration: 900 },
          { title: 'Module 1 Assessment', type: 'quiz' }
        ]
      },
      {
        title: 'Module 2: Linear Models',
        description: 'Building intuition for linear regression and classification',
        lessons: [
          { title: 'Linear Regression Intuition', type: 'video', duration: 1100 },
          { title: 'Gradient Descent Visualization', type: 'video', duration: 1200 },
          { title: 'Logistic Regression', type: 'video', duration: 1000 },
          { title: 'Hands-On: Implementing from Scratch', type: 'assignment' }
        ]
      },
      {
        title: 'Module 3: Decision Trees and Ensembles',
        description: 'Tree-based learning methods',
        lessons: [
          { title: 'Decision Tree Intuition', type: 'video', duration: 1100 },
          { title: 'Random Forests', type: 'video', duration: 1000 },
          { title: 'Gradient Boosting', type: 'video', duration: 1200 },
          { title: 'XGBoost Deep Dive', type: 'video', duration: 1100 },
          { title: 'Module 3 Assessment', type: 'quiz' }
        ]
      },
      {
        title: 'Module 4: Support Vector Machines',
        description: 'Maximum margin classifiers',
        lessons: [
          { title: 'SVM Intuition: Finding the Best Boundary', type: 'video', duration: 1200 },
          { title: 'Kernel Trick Explained', type: 'video', duration: 1100 },
          { title: 'SVM in Practice', type: 'video', duration: 900 },
          { title: 'Hands-On: SVM Classification', type: 'assignment' }
        ]
      },
      {
        title: 'Module 5: Clustering',
        description: 'Finding structure in unlabeled data',
        lessons: [
          { title: 'K-Means Clustering', type: 'video', duration: 1000 },
          { title: 'Hierarchical Clustering', type: 'video', duration: 900 },
          { title: 'DBSCAN and Density-Based Methods', type: 'video', duration: 1100 },
          { title: 'Module 5 Assessment', type: 'quiz' }
        ]
      },
      {
        title: 'Module 6: Dimensionality Reduction',
        description: 'Compressing high-dimensional data',
        lessons: [
          { title: 'PCA Intuition', type: 'video', duration: 1200 },
          { title: 't-SNE for Visualization', type: 'video', duration: 1000 },
          { title: 'UMAP and Modern Methods', type: 'video', duration: 1100 },
          { title: 'Hands-On: Visualizing High-Dimensional Data', type: 'assignment' }
        ]
      },
      {
        title: 'Module 7: Feature Engineering',
        description: 'The art of creating good features',
        lessons: [
          { title: 'Feature Engineering Principles', type: 'video', duration: 1100 },
          { title: 'Handling Missing Data', type: 'video', duration: 900 },
          { title: 'Categorical Encoding Strategies', type: 'video', duration: 1000 },
          { title: 'Feature Selection Methods', type: 'video', duration: 1100 },
          { title: 'Module 7 Assessment', type: 'quiz' }
        ]
      },
      {
        title: 'Module 8: Model Evaluation',
        description: 'Measuring model performance correctly',
        lessons: [
          { title: 'Train/Test Split and Cross-Validation', type: 'video', duration: 1000 },
          { title: 'Classification Metrics Deep Dive', type: 'video', duration: 1200 },
          { title: 'Regression Metrics', type: 'video', duration: 900 },
          { title: 'Hands-On: Proper Model Evaluation', type: 'assignment' }
        ]
      },
      {
        title: 'Module 9: Bias and Variance',
        description: 'Understanding the fundamental tradeoff',
        lessons: [
          { title: 'The Bias-Variance Tradeoff', type: 'video', duration: 1200 },
          { title: 'Overfitting and Underfitting', type: 'video', duration: 1000 },
          { title: 'Regularization Techniques', type: 'video', duration: 1100 },
          { title: 'Module 9 Assessment', type: 'quiz' }
        ]
      },
      {
        title: 'Module 10: Bayesian Methods',
        description: 'Probabilistic approaches to ML',
        lessons: [
          { title: 'Bayesian Thinking', type: 'video', duration: 1100 },
          { title: 'Naive Bayes Classifier', type: 'video', duration: 1000 },
          { title: 'Gaussian Processes Introduction', type: 'video', duration: 1200 },
          { title: 'Hands-On: Bayesian Classification', type: 'assignment' }
        ]
      },
      {
        title: 'Module 11: Time Series',
        description: 'Learning from sequential data',
        lessons: [
          { title: 'Time Series Fundamentals', type: 'video', duration: 1100 },
          { title: 'ARIMA Models', type: 'video', duration: 1200 },
          { title: 'Seasonality and Trends', type: 'video', duration: 1000 },
          { title: 'Module 11 Assessment', type: 'quiz' }
        ]
      },
      {
        title: 'Module 12: Anomaly Detection',
        description: 'Finding outliers and unusual patterns',
        lessons: [
          { title: 'Anomaly Detection Methods', type: 'video', duration: 1100 },
          { title: 'Isolation Forests', type: 'video', duration: 1000 },
          { title: 'One-Class SVM', type: 'video', duration: 900 },
          { title: 'Hands-On: Building an Anomaly Detector', type: 'assignment' }
        ]
      },
      {
        title: 'Module 13: ML in Practice',
        description: 'Real-world ML project considerations',
        lessons: [
          { title: 'The Complete ML Project Lifecycle', type: 'video', duration: 1200 },
          { title: 'Data Quality and Preprocessing', type: 'video', duration: 1000 },
          { title: 'Model Selection Strategies', type: 'video', duration: 1100 },
          { title: 'Final Project', type: 'assignment' }
        ]
      }
    ]
  },
  'deep-learning-intuition': {
    modules: [
      {
        title: 'Module 1: Neural Network Foundations',
        description: 'Understanding the building blocks of deep learning',
        lessons: [
          { title: 'The Perceptron and Beyond', type: 'video', duration: 1100 },
          { title: 'Activation Functions Intuition', type: 'video', duration: 1000 },
          { title: 'Forward and Backward Propagation', type: 'video', duration: 1300 },
          { title: 'Hands-On: Building a Neural Network from Scratch', type: 'assignment' }
        ]
      },
      {
        title: 'Module 2: Training Deep Networks',
        description: 'Making networks learn effectively',
        lessons: [
          { title: 'Loss Functions Deep Dive', type: 'video', duration: 1100 },
          { title: 'Optimizers: SGD to Adam', type: 'video', duration: 1200 },
          { title: 'Learning Rate Scheduling', type: 'video', duration: 900 },
          { title: 'Module 2 Assessment', type: 'quiz' }
        ]
      },
      {
        title: 'Module 3: Regularization Techniques',
        description: 'Preventing overfitting in deep networks',
        lessons: [
          { title: 'Dropout Intuition', type: 'video', duration: 1000 },
          { title: 'Batch Normalization', type: 'video', duration: 1100 },
          { title: 'Data Augmentation', type: 'video', duration: 900 },
          { title: 'Early Stopping and Model Selection', type: 'video', duration: 800 },
          { title: 'Hands-On: Regularization Experiments', type: 'assignment' }
        ]
      },
      {
        title: 'Module 4: Convolutional Neural Networks',
        description: 'Learning from images',
        lessons: [
          { title: 'Convolution Operation Intuition', type: 'video', duration: 1200 },
          { title: 'Pooling and Stride', type: 'video', duration: 900 },
          { title: 'Classic CNN Architectures', type: 'video', duration: 1100 },
          { title: 'Transfer Learning with CNNs', type: 'video', duration: 1000 },
          { title: 'Module 4 Assessment', type: 'quiz' }
        ]
      },
      {
        title: 'Module 5: Modern CNN Architectures',
        description: 'State-of-the-art image models',
        lessons: [
          { title: 'ResNet and Skip Connections', type: 'video', duration: 1100 },
          { title: 'EfficientNet and Neural Architecture Search', type: 'video', duration: 1200 },
          { title: 'Vision Transformers (ViT)', type: 'video', duration: 1300 },
          { title: 'Hands-On: Image Classification Project', type: 'assignment' }
        ]
      },
      {
        title: 'Module 6: Recurrent Neural Networks',
        description: 'Learning from sequences',
        lessons: [
          { title: 'RNN Fundamentals', type: 'video', duration: 1100 },
          { title: 'The Vanishing Gradient Problem', type: 'video', duration: 1000 },
          { title: 'LSTM Deep Dive', type: 'video', duration: 1200 },
          { title: 'GRU and Variants', type: 'video', duration: 900 },
          { title: 'Module 6 Assessment', type: 'quiz' }
        ]
      },
      {
        title: 'Module 7: Attention Mechanisms',
        description: 'The foundation of modern NLP',
        lessons: [
          { title: 'Attention Intuition', type: 'video', duration: 1200 },
          { title: 'Self-Attention Explained', type: 'video', duration: 1300 },
          { title: 'Multi-Head Attention', type: 'video', duration: 1100 },
          { title: 'Hands-On: Implementing Attention', type: 'assignment' }
        ]
      },
      {
        title: 'Module 8: Transformer Architecture',
        description: 'The architecture that changed everything',
        lessons: [
          { title: 'Transformer Architecture Overview', type: 'video', duration: 1400 },
          { title: 'Positional Encoding', type: 'video', duration: 1000 },
          { title: 'Encoder-Decoder Structure', type: 'video', duration: 1200 },
          { title: 'Module 8 Assessment', type: 'quiz' }
        ]
      },
      {
        title: 'Module 9: Generative Models',
        description: 'Creating new data',
        lessons: [
          { title: 'Autoencoders', type: 'video', duration: 1100 },
          { title: 'Variational Autoencoders (VAE)', type: 'video', duration: 1200 },
          { title: 'GAN Fundamentals', type: 'video', duration: 1300 },
          { title: 'Hands-On: Building a GAN', type: 'assignment' }
        ]
      },
      {
        title: 'Module 10: Diffusion Models',
        description: 'State-of-the-art image generation',
        lessons: [
          { title: 'Diffusion Process Intuition', type: 'video', duration: 1200 },
          { title: 'Denoising Score Matching', type: 'video', duration: 1100 },
          { title: 'Stable Diffusion Architecture', type: 'video', duration: 1300 },
          { title: 'Module 10 Assessment', type: 'quiz' }
        ]
      },
      {
        title: 'Module 11: Graph Neural Networks',
        description: 'Learning on graph-structured data',
        lessons: [
          { title: 'Graph Representation', type: 'video', duration: 1000 },
          { title: 'Message Passing Neural Networks', type: 'video', duration: 1200 },
          { title: 'Graph Attention Networks', type: 'video', duration: 1100 },
          { title: 'Hands-On: Node Classification', type: 'assignment' }
        ]
      },
      {
        title: 'Module 12: Self-Supervised Learning',
        description: 'Learning without labels',
        lessons: [
          { title: 'Contrastive Learning', type: 'video', duration: 1200 },
          { title: 'BERT and Masked Language Modeling', type: 'video', duration: 1100 },
          { title: 'CLIP and Multimodal Learning', type: 'video', duration: 1300 },
          { title: 'Module 12 Assessment', type: 'quiz' }
        ]
      },
      {
        title: 'Module 13: Interpretability',
        description: 'Understanding what networks learn',
        lessons: [
          { title: 'Feature Visualization', type: 'video', duration: 1000 },
          { title: 'Attention Visualization', type: 'video', duration: 900 },
          { title: 'SHAP and Integrated Gradients', type: 'video', duration: 1100 },
          { title: 'Hands-On: Model Interpretability', type: 'assignment' }
        ]
      },
      {
        title: 'Module 14: Efficient Deep Learning',
        description: 'Making models faster and smaller',
        lessons: [
          { title: 'Model Pruning', type: 'video', duration: 1000 },
          { title: 'Quantization Techniques', type: 'video', duration: 1100 },
          { title: 'Knowledge Distillation', type: 'video', duration: 1200 },
          { title: 'Module 14 Assessment', type: 'quiz' }
        ]
      },
      {
        title: 'Module 15: Reinforcement Learning Basics',
        description: 'Learning through interaction',
        lessons: [
          { title: 'RL Framework', type: 'video', duration: 1100 },
          { title: 'Q-Learning and DQN', type: 'video', duration: 1200 },
          { title: 'Policy Gradients', type: 'video', duration: 1100 },
          { title: 'Hands-On: Training an RL Agent', type: 'assignment' }
        ]
      },
      {
        title: 'Module 16: Capstone Project',
        description: 'Apply everything you have learned',
        lessons: [
          { title: 'Capstone Overview', type: 'video', duration: 600 },
          { title: 'Project Implementation', type: 'assignment' },
          { title: 'Final Presentation', type: 'assignment' }
        ]
      }
    ]
  },
  'build-your-own-reasoning-model-dr-lee': {
    modules: [
      {
        title: 'Module 1: Reasoning in AI Systems',
        description: 'Understanding how AI models reason',
        lessons: [
          { title: 'Introduction to AI Reasoning', type: 'video', duration: 1100 },
          { title: 'Chain-of-Thought Prompting', type: 'video', duration: 1200 },
          { title: 'Types of Reasoning: Deductive, Inductive, Abductive', type: 'video', duration: 1300 },
          { title: 'Module 1 Assessment', type: 'quiz' }
        ]
      },
      {
        title: 'Module 2: Reasoning Architectures',
        description: 'Building blocks of reasoning systems',
        lessons: [
          { title: 'Tree-of-Thought Architecture', type: 'video', duration: 1200 },
          { title: 'Self-Consistency Decoding', type: 'video', duration: 1100 },
          { title: 'Reflection and Self-Critique', type: 'video', duration: 1000 },
          { title: 'Hands-On: Implementing Chain-of-Thought', type: 'assignment' }
        ]
      },
      {
        title: 'Module 3: Knowledge Retrieval for Reasoning',
        description: 'Augmenting reasoning with external knowledge',
        lessons: [
          { title: 'RAG for Reasoning Tasks', type: 'video', duration: 1200 },
          { title: 'Tool Use and Function Calling', type: 'video', duration: 1300 },
          { title: 'Knowledge Graph Integration', type: 'video', duration: 1100 },
          { title: 'Module 3 Assessment', type: 'quiz' }
        ]
      },
      {
        title: 'Module 4: Mathematical Reasoning',
        description: 'Building models that can do math',
        lessons: [
          { title: 'Math Problem Understanding', type: 'video', duration: 1200 },
          { title: 'Step-by-Step Solutions', type: 'video', duration: 1100 },
          { title: 'Code Generation for Math', type: 'video', duration: 1300 },
          { title: 'Hands-On: Building a Math Solver', type: 'assignment' }
        ]
      },
      {
        title: 'Module 5: Logical Reasoning',
        description: 'Formal logic in neural systems',
        lessons: [
          { title: 'Propositional Logic Basics', type: 'video', duration: 1000 },
          { title: 'First-Order Logic Reasoning', type: 'video', duration: 1200 },
          { title: 'Constraint Satisfaction', type: 'video', duration: 1100 },
          { title: 'Module 5 Assessment', type: 'quiz' }
        ]
      },
      {
        title: 'Module 6: Multi-Step Planning',
        description: 'Reasoning over long horizons',
        lessons: [
          { title: 'Planning Fundamentals', type: 'video', duration: 1100 },
          { title: 'Monte Carlo Tree Search', type: 'video', duration: 1200 },
          { title: 'LLM-Based Planning', type: 'video', duration: 1300 },
          { title: 'Hands-On: Building a Planner', type: 'assignment' }
        ]
      },
      {
        title: 'Module 7: Verification and Validation',
        description: 'Ensuring reasoning correctness',
        lessons: [
          { title: 'Self-Verification Methods', type: 'video', duration: 1100 },
          { title: 'External Verification Tools', type: 'video', duration: 1000 },
          { title: 'Confidence Estimation', type: 'video', duration: 900 },
          { title: 'Module 7 Assessment', type: 'quiz' }
        ]
      },
      {
        title: 'Module 8: Training Reasoning Models',
        description: 'Fine-tuning for better reasoning',
        lessons: [
          { title: 'Synthetic Data Generation', type: 'video', duration: 1200 },
          { title: 'RLHF for Reasoning', type: 'video', duration: 1300 },
          { title: 'Process Reward Models', type: 'video', duration: 1100 },
          { title: 'Hands-On: Fine-Tuning for Reasoning', type: 'assignment' }
        ]
      },
      {
        title: 'Module 9: Capstone: Build Your Reasoning Model',
        description: 'Complete reasoning system implementation',
        lessons: [
          { title: 'Project Architecture', type: 'video', duration: 800 },
          { title: 'Implementation Phase 1', type: 'assignment' },
          { title: 'Implementation Phase 2', type: 'assignment' },
          { title: 'Final Evaluation', type: 'assignment' }
        ]
      }
    ]
  },
  'build-your-own-llm-dr-lee': {
    modules: [
      {
        title: 'Module 1: LLM Foundations',
        description: 'Understanding language model fundamentals',
        lessons: [
          { title: 'What is a Language Model?', type: 'video', duration: 1100 },
          { title: 'Tokenization Deep Dive', type: 'video', duration: 1200 },
          { title: 'Transformer Architecture Review', type: 'video', duration: 1400 },
          { title: 'Module 1 Assessment', type: 'quiz' }
        ]
      },
      {
        title: 'Module 2: Data Preparation',
        description: 'Building high-quality training datasets',
        lessons: [
          { title: 'Web Scraping at Scale', type: 'video', duration: 1200 },
          { title: 'Data Cleaning and Deduplication', type: 'video', duration: 1100 },
          { title: 'Quality Filtering', type: 'video', duration: 1000 },
          { title: 'Hands-On: Building a Dataset', type: 'assignment' }
        ]
      },
      {
        title: 'Module 3: Tokenizer Training',
        description: 'Creating your own tokenizer',
        lessons: [
          { title: 'BPE Algorithm Deep Dive', type: 'video', duration: 1200 },
          { title: 'SentencePiece and Unigram', type: 'video', duration: 1100 },
          { title: 'Vocabulary Size Considerations', type: 'video', duration: 900 },
          { title: 'Hands-On: Training a Tokenizer', type: 'assignment' }
        ]
      },
      {
        title: 'Module 4: Model Architecture',
        description: 'Designing your LLM architecture',
        lessons: [
          { title: 'Architecture Decisions', type: 'video', duration: 1300 },
          { title: 'Attention Variants', type: 'video', duration: 1200 },
          { title: 'Position Encoding Options', type: 'video', duration: 1000 },
          { title: 'Module 4 Assessment', type: 'quiz' }
        ]
      },
      {
        title: 'Module 5: Pre-Training',
        description: 'Training your LLM from scratch',
        lessons: [
          { title: 'Distributed Training Setup', type: 'video', duration: 1400 },
          { title: 'Mixed Precision Training', type: 'video', duration: 1100 },
          { title: 'Gradient Checkpointing', type: 'video', duration: 1000 },
          { title: 'Training Stability Tips', type: 'video', duration: 1200 },
          { title: 'Hands-On: Pre-Training Run', type: 'assignment' }
        ]
      },
      {
        title: 'Module 6: Scaling Laws',
        description: 'Understanding model scaling',
        lessons: [
          { title: 'Chinchilla Scaling Laws', type: 'video', duration: 1200 },
          { title: 'Compute-Optimal Training', type: 'video', duration: 1100 },
          { title: 'Parameter Efficient Methods', type: 'video', duration: 1000 },
          { title: 'Module 6 Assessment', type: 'quiz' }
        ]
      },
      {
        title: 'Module 7: Instruction Tuning',
        description: 'Making your LLM follow instructions',
        lessons: [
          { title: 'Instruction Dataset Creation', type: 'video', duration: 1200 },
          { title: 'Supervised Fine-Tuning', type: 'video', duration: 1100 },
          { title: 'Chat Templates', type: 'video', duration: 900 },
          { title: 'Hands-On: Instruction Tuning', type: 'assignment' }
        ]
      },
      {
        title: 'Module 8: Alignment',
        description: 'Aligning your LLM with human preferences',
        lessons: [
          { title: 'RLHF Overview', type: 'video', duration: 1200 },
          { title: 'Reward Model Training', type: 'video', duration: 1300 },
          { title: 'PPO Implementation', type: 'video', duration: 1400 },
          { title: 'DPO: Direct Preference Optimization', type: 'video', duration: 1100 },
          { title: 'Module 8 Assessment', type: 'quiz' }
        ]
      },
      {
        title: 'Module 9: Evaluation',
        description: 'Measuring LLM quality',
        lessons: [
          { title: 'Benchmark Suites', type: 'video', duration: 1100 },
          { title: 'Human Evaluation', type: 'video', duration: 1000 },
          { title: 'Safety Evaluation', type: 'video', duration: 1200 },
          { title: 'Hands-On: Comprehensive Evaluation', type: 'assignment' }
        ]
      },
      {
        title: 'Module 10: Deployment',
        description: 'Serving your LLM in production',
        lessons: [
          { title: 'Inference Optimization', type: 'video', duration: 1200 },
          { title: 'vLLM and Continuous Batching', type: 'video', duration: 1100 },
          { title: 'Quantization for Deployment', type: 'video', duration: 1000 },
          { title: 'Module 10 Assessment', type: 'quiz' }
        ]
      },
      {
        title: 'Module 11: Capstone Project',
        description: 'Build and deploy your own LLM',
        lessons: [
          { title: 'Capstone Overview', type: 'video', duration: 600 },
          { title: 'Data and Architecture Design', type: 'assignment' },
          { title: 'Training and Fine-Tuning', type: 'assignment' },
          { title: 'Deployment and Demo', type: 'assignment' }
        ]
      }
    ]
  }
}

// Generate generic modules for courses without specific content
function generateGenericModules(title, moduleCount, durationHours) {
  const modules = []
  const hoursPerModule = Math.floor(durationHours / moduleCount)

  const moduleTopics = {
    'Build Your Own Frontier AI': ['Foundation Models', 'Data at Scale', 'Training Infrastructure', 'Model Architecture', 'Scaling Strategies', 'Multi-Modal Learning', 'Safety and Alignment', 'Deployment', 'Evaluation', 'Future Directions'],
    'Build Your Own Image Generator': ['Generative AI Fundamentals', 'VAE Architecture', 'GAN Deep Dive', 'Diffusion Models', 'CLIP Integration', 'ControlNet', 'Image Editing', 'Super Resolution', 'Production Deployment', 'Advanced Techniques'],
    'Build Your Own Multi-Agent AI Teams': ['Multi-Agent Fundamentals', 'Agent Communication', 'Coordination Protocols', 'Task Decomposition', 'Memory Systems', 'Tool Integration', 'Orchestration', 'Evaluation', 'Production Systems'],
    'Build Your Own Autonomous AI Agent': ['Agent Fundamentals', 'Perception Systems', 'Decision Making', 'Action Execution', 'Memory and Learning', 'Tool Use', 'Self-Improvement', 'Safety Constraints', 'Deployment'],
    'Domain Specific SLM': ['SLM Fundamentals', 'Domain Data Preparation', 'Architecture Selection', 'Continued Pre-Training', 'Domain Fine-Tuning', 'Knowledge Distillation', 'Evaluation Frameworks', 'Optimization', 'Edge Deployment', 'Case Studies', 'Production Systems', 'Monitoring', 'Iteration', 'Best Practices', 'Capstone'],
    'Fine-Tune Your Own Models': ['Fine-Tuning Fundamentals', 'Data Preparation', 'LoRA and QLoRA', 'Full Fine-Tuning', 'Instruction Tuning', 'Evaluation', 'Optimization', 'Deployment'],
    'AI-Augmented Engineering': ['AI in Software Development', 'Code Generation', 'Code Review AI', 'Testing Automation', 'Documentation', 'DevOps AI', 'Future of Engineering'],
    'Automated Insights': ['Data Analysis Automation', 'Pattern Recognition', 'Anomaly Detection', 'Report Generation', 'Dashboard Creation', 'NL Querying', 'Decision Support', 'Production Systems'],
    'Agentic Automation': ['Agentic Fundamentals', 'Workflow Design', 'Task Automation', 'Integration Patterns', 'Error Handling', 'Deployment'],
    'Predictive Insight': ['Forecasting Fundamentals', 'Time Series Models', 'ML Predictions', 'Feature Engineering', 'Model Selection', 'Production'],
    'The Decision Engine': ['Decision Fundamentals', 'Rule-Based Systems', 'ML Decisions', 'Human-in-the-Loop', 'Production'],
    'Agentic SDK': ['SDK Fundamentals', 'Agent Framework', 'Tool Creation', 'Memory Management', 'Orchestration', 'Testing', 'Deployment'],
    'Vibe Marketing': ['AI Marketing Fundamentals', 'Content Generation', 'Personalization', 'Customer Analysis', 'Campaign Optimization', 'Social Media AI', 'Email AI', 'Analytics', 'Attribution', 'Compliance', 'Case Studies'],
    'The AI-Native University': ['Education Transformation', 'Personalized Learning', 'AI Tutoring', 'Assessment AI', 'Content Creation', 'Administrative AI', 'Research AI', 'Implementation'],
    'The Token Economy': ['Token Fundamentals', 'API Economics', 'Cost Optimization', 'Caching Strategies', 'Model Selection', 'Prompt Engineering', 'Batch Processing', 'Monitoring', 'ROI Analysis', 'Future Trends']
  }

  const topics = moduleTopics[title] || Array.from({ length: moduleCount }, (_, i) => `Module ${i + 1}`)

  for (let i = 0; i < moduleCount && i < topics.length; i++) {
    const lessonsPerModule = i === moduleCount - 1 ? 3 : 4 + Math.floor(Math.random() * 2)
    const lessons = []

    for (let j = 0; j < lessonsPerModule; j++) {
      if (j === lessonsPerModule - 1) {
        lessons.push({
          title: `Module ${i + 1} Assessment`,
          type: 'quiz'
        })
      } else if (j === lessonsPerModule - 2 && Math.random() > 0.5) {
        lessons.push({
          title: `Hands-On: ${topics[i]} Practice`,
          type: 'assignment'
        })
      } else {
        lessons.push({
          title: `${topics[i]} - Part ${j + 1}`,
          type: 'video',
          duration: 900 + Math.floor(Math.random() * 600)
        })
      }
    }

    modules.push({
      title: `Module ${i + 1}: ${topics[i]}`,
      description: `Deep dive into ${topics[i].toLowerCase()} concepts and applications`,
      lessons
    })
  }

  return modules
}

async function populateCourseContent() {
  console.log('🚀 Starting course content population...\n')

  // Get all courses
  const { data: courses, error: coursesError } = await supabase
    .from('courses')
    .select('id, title, slug, duration_hours, metadata')
    .eq('instructor_name', 'Dr. Ernesto Lee')
    .order('created_at')

  if (coursesError) {
    console.error('Error fetching courses:', coursesError)
    return
  }

  console.log(`Found ${courses.length} courses to populate\n`)

  let totalModules = 0
  let totalLessons = 0

  for (const course of courses) {
    console.log(`📚 Processing: ${course.title}`)

    // Get module content - either specific or generated
    let modules
    if (courseContent[course.slug]) {
      modules = courseContent[course.slug].modules
    } else {
      const moduleCount = course.metadata?.module_count || Math.ceil(course.duration_hours / 5)
      modules = generateGenericModules(course.title, moduleCount, course.duration_hours)
    }

    // Insert modules
    for (let moduleIndex = 0; moduleIndex < modules.length; moduleIndex++) {
      const module = modules[moduleIndex]

      // Create module
      const { data: moduleData, error: moduleError } = await supabase
        .from('course_modules')
        .insert([{
          course_id: course.id,
          title: module.title,
          description: module.description,
          sort_order: moduleIndex,
          duration_minutes: module.lessons.reduce((acc, l) => acc + (l.duration || 600), 0),
          metadata: {
            shu_ha_ri_phase: moduleIndex < modules.length / 3 ? 'shu' : moduleIndex < (modules.length * 2) / 3 ? 'ha' : 'ri'
          }
        }])
        .select()

      if (moduleError) {
        console.error(`  ❌ Error creating module: ${module.title}`, moduleError.message)
        continue
      }

      totalModules++

      // Create lessons for this module
      for (let lessonIndex = 0; lessonIndex < module.lessons.length; lessonIndex++) {
        const lesson = module.lessons[lessonIndex]

        const lessonData = {
          module_id: moduleData[0].id,
          title: lesson.title,
          description: `${lesson.title} - Part of ${module.title}`,
          content_type: lesson.type,
          sort_order: lessonIndex,
          is_preview: moduleIndex === 0 && lessonIndex === 0, // First lesson of first module is preview
          metadata: {
            estimated_duration_minutes: Math.ceil((lesson.duration || 600) / 60)
          }
        }

        if (lesson.type === 'video') {
          lessonData.video_duration_seconds = lesson.duration || 900
        }

        if (lesson.type === 'quiz') {
          lessonData.quiz_passing_score = 70
          lessonData.quiz_questions = generateQuizQuestions(module.title, 5)
        }

        const { error: lessonError } = await supabase
          .from('course_lessons')
          .insert([lessonData])

        if (lessonError) {
          console.error(`    ❌ Error creating lesson: ${lesson.title}`, lessonError.message)
          continue
        }

        totalLessons++
      }
    }

    console.log(`  ✅ Created ${modules.length} modules with lessons`)
  }

  console.log(`\n🎉 Course content population complete!`)
  console.log(`   Total modules created: ${totalModules}`)
  console.log(`   Total lessons created: ${totalLessons}`)
}

function generateQuizQuestions(moduleTitle, count) {
  const questions = []
  const topics = moduleTitle.replace('Module ', '').split(':')[1]?.trim() || moduleTitle

  for (let i = 0; i < count; i++) {
    questions.push({
      id: `q${i + 1}`,
      question: `Question ${i + 1} about ${topics}?`,
      type: 'multiple_choice',
      options: [
        { id: 'a', text: 'Option A' },
        { id: 'b', text: 'Option B' },
        { id: 'c', text: 'Option C' },
        { id: 'd', text: 'Option D' }
      ],
      correct_answer: ['a', 'b', 'c', 'd'][Math.floor(Math.random() * 4)],
      points: 20
    })
  }

  return questions
}

populateCourseContent().catch(console.error)
