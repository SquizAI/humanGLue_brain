# Anthropic Claude Structured Outputs

## Overview

Anthropic's Claude models achieve structured outputs through the tool use feature. By defining a single tool with a JSON schema and setting `tool_choice` appropriately, you can ensure Claude generates responses that conform to your specified structure. This approach leverages Claude's native tool-calling capabilities for reliable JSON generation.

## Key Concepts

- **Tool Use for JSON**: Define a tool that represents your desired output schema
- **Forced Tool Use**: Set `tool_choice` to ensure the model uses your schema
- **JSON Schema**: Define precise structure using standard JSON Schema
- **No Execution Required**: The tool doesn't need to be executable - it's just for structuring output

## Basic Usage

### 1. Simple Structured Output

```bash
curl https://api.anthropic.com/v1/messages \
  -H "content-type: application/json" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "claude-opus-4-20250514",
    "max_tokens": 1024,
    "tools": [{
      "name": "record_summary",
      "description": "Record summary of an image using well-structured JSON.",
      "input_schema": {
        "type": "object",
        "properties": {
          "description": {
            "type": "string",
            "description": "Image description. One to two sentences max."
          },
          "key_colors": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "r": { "type": "number", "description": "red value [0.0, 1.0]" },
                "g": { "type": "number", "description": "green value [0.0, 1.0]" },
                "b": { "type": "number", "description": "blue value [0.0, 1.0]" },
                "name": { "type": "string", "description": "Human-readable color name" }
              },
              "required": ["r", "g", "b", "name"]
            }
          }
        },
        "required": ["description", "key_colors"]
      }
    }],
    "tool_choice": {"type": "tool", "name": "record_summary"},
    "messages": [{
      "role": "user",
      "content": "Analyze this image and provide a summary."
    }]
  }'
```

### 2. Python SDK Example

```python
import anthropic

client = anthropic.Anthropic()

response = client.messages.create(
    model="claude-opus-4-20250514",
    max_tokens=1024,
    tools=[{
        "name": "extract_customer_info",
        "description": "Extract customer information from text",
        "input_schema": {
            "type": "object",
            "properties": {
                "name": {
                    "type": "string",
                    "description": "Customer's full name"
                },
                "email": {
                    "type": "string",
                    "description": "Customer's email address"
                },
                "phone": {
                    "type": "string",
                    "description": "Customer's phone number"
                },
                "address": {
                    "type": "object",
                    "properties": {
                        "street": {"type": "string"},
                        "city": {"type": "string"},
                        "state": {"type": "string"},
                        "zip": {"type": "string"}
                    },
                    "required": ["street", "city", "state", "zip"]
                }
            },
            "required": ["name", "email"]
        }
    }],
    tool_choice={"type": "tool", "name": "extract_customer_info"},
    messages=[{
        "role": "user",
        "content": "John Doe, john@example.com, (555) 123-4567, 123 Main St, Anytown, CA 12345"
    }]
)

# Extract the structured data
tool_use = response.content[0]  # Assuming first content block is tool_use
structured_data = tool_use.input
```

## Advanced Examples

### Complex Nested Structures

```python
response = client.messages.create(
    model="claude-opus-4-20250514",
    max_tokens=2048,
    tools=[{
        "name": "analyze_document",
        "description": "Analyze and structure document content",
        "input_schema": {
            "type": "object",
            "properties": {
                "document_type": {
                    "type": "string",
                    "enum": ["invoice", "receipt", "contract", "report"]
                },
                "metadata": {
                    "type": "object",
                    "properties": {
                        "date": {"type": "string", "description": "ISO 8601 date"},
                        "document_id": {"type": "string"},
                        "total_pages": {"type": "integer"}
                    },
                    "required": ["date", "document_id"]
                },
                "sections": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "title": {"type": "string"},
                            "content": {"type": "string"},
                            "importance": {
                                "type": "string",
                                "enum": ["high", "medium", "low"]
                            }
                        },
                        "required": ["title", "content"]
                    }
                },
                "entities": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "name": {"type": "string"},
                            "type": {
                                "type": "string",
                                "enum": ["person", "organization", "location", "date", "money"]
                            },
                            "context": {"type": "string"}
                        },
                        "required": ["name", "type"]
                    }
                }
            },
            "required": ["document_type", "metadata", "sections"]
        }
    }],
    tool_choice={"type": "tool", "name": "analyze_document"},
    messages=[{
        "role": "user",
        "content": f"Analyze this document: {document_text}"
    }]
)
```

### Data Extraction with Validation

```python
# Define a tool for extracting financial data
financial_tool = {
    "name": "extract_financial_data",
    "description": "Extract structured financial information",
    "input_schema": {
        "type": "object",
        "properties": {
            "transactions": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "date": {
                            "type": "string",
                            "pattern": "^\\d{4}-\\d{2}-\\d{2}$",
                            "description": "Date in YYYY-MM-DD format"
                        },
                        "amount": {
                            "type": "number",
                            "description": "Transaction amount"
                        },
                        "currency": {
                            "type": "string",
                            "enum": ["USD", "EUR", "GBP", "JPY"]
                        },
                        "category": {
                            "type": "string",
                            "enum": ["income", "expense", "transfer"]
                        },
                        "description": {"type": "string"}
                    },
                    "required": ["date", "amount", "currency", "category"]
                }
            },
            "summary": {
                "type": "object",
                "properties": {
                    "total_income": {"type": "number"},
                    "total_expenses": {"type": "number"},
                    "net_balance": {"type": "number"},
                    "currency": {"type": "string"}
                },
                "required": ["total_income", "total_expenses", "net_balance", "currency"]
            }
        },
        "required": ["transactions", "summary"]
    }
}

response = client.messages.create(
    model="claude-opus-4-20250514",
    max_tokens=2048,
    tools=[financial_tool],
    tool_choice={"type": "tool", "name": "extract_financial_data"},
    messages=[{
        "role": "user",
        "content": "Extract financial data from: " + financial_report
    }]
)
```

### Multi-Language Sentiment Analysis

```python
sentiment_tool = {
    "name": "analyze_sentiment",
    "description": "Analyze sentiment across multiple languages",
    "input_schema": {
        "type": "object",
        "properties": {
            "overall_sentiment": {
                "type": "string",
                "enum": ["positive", "negative", "neutral", "mixed"]
            },
            "confidence": {
                "type": "number",
                "minimum": 0,
                "maximum": 1,
                "description": "Confidence score between 0 and 1"
            },
            "language": {
                "type": "string",
                "description": "Detected language code (ISO 639-1)"
            },
            "emotions": {
                "type": "array",
                "items": {
                    "type": "string",
                    "enum": ["joy", "sadness", "anger", "fear", "surprise", "disgust"]
                },
                "description": "Detected emotions"
            },
            "key_phrases": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "phrase": {"type": "string"},
                        "sentiment": {
                            "type": "string",
                            "enum": ["positive", "negative", "neutral"]
                        }
                    },
                    "required": ["phrase", "sentiment"]
                }
            }
        },
        "required": ["overall_sentiment", "confidence", "language"]
    }
}
```

## Working with Tool Results

When Claude uses a tool for structured output, the response follows this pattern:

```python
# Example response structure
{
    "id": "msg_01Aq9w938a90dw8q",
    "model": "claude-opus-4-20250514",
    "stop_reason": "tool_use",
    "role": "assistant",
    "content": [
        {
            "type": "text",
            "text": "<thinking>I need to extract the information...</thinking>"
        },
        {
            "type": "tool_use",
            "id": "toolu_01A09q90qw90lq917835lq9",
            "name": "your_tool_name",
            "input": {
                # Your structured data here
            }
        }
    ]
}

# Extract the structured data
for content in response.content:
    if content.type == "tool_use":
        structured_data = content.input
        break
```

## Best Practices

### 1. Clear Tool Descriptions

```python
# Good: Specific and actionable
"description": "Extract all personal information including names, addresses, and contact details"

# Less effective: Vague
"description": "Get info from text"
```

### 2. Detailed Property Descriptions

```python
"properties": {
    "date": {
        "type": "string",
        "description": "Publication date in ISO 8601 format (YYYY-MM-DD)"
    },
    "amount": {
        "type": "number",
        "description": "Total amount in USD, excluding taxes"
    }
}
```

### 3. Use Enums for Constrained Values

```python
"category": {
    "type": "string",
    "enum": ["technology", "finance", "healthcare", "education"],
    "description": "Primary category of the article"
}
```

### 4. Handle Optional Fields

```python
"input_schema": {
    "type": "object",
    "properties": {
        "required_field": {"type": "string"},
        "optional_field": {"type": "string"}
    },
    "required": ["required_field"]  # Only list truly required fields
}
```

## Error Handling

### Check for Tool Use

```python
def extract_structured_data(response):
    """Safely extract structured data from Claude's response"""
    for content in response.content:
        if content.type == "tool_use":
            return content.input
    
    # Handle case where no tool was used
    raise ValueError("No structured output found in response")
```

### Validate Output

```python
import jsonschema

def validate_output(data, schema):
    """Validate the structured output against the schema"""
    try:
        jsonschema.validate(instance=data, schema=schema)
        return True
    except jsonschema.exceptions.ValidationError as e:
        print(f"Validation error: {e}")
        return False
```

## Common Patterns

### 1. Report Generation

```python
report_schema = {
    "name": "generate_report",
    "description": "Generate a structured report",
    "input_schema": {
        "type": "object",
        "properties": {
            "title": {"type": "string"},
            "executive_summary": {"type": "string"},
            "sections": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "heading": {"type": "string"},
                        "content": {"type": "string"},
                        "recommendations": {
                            "type": "array",
                            "items": {"type": "string"}
                        }
                    }
                }
            },
            "conclusions": {"type": "array", "items": {"type": "string"}}
        }
    }
}
```

### 2. Data Classification

```python
classification_schema = {
    "name": "classify_data",
    "description": "Classify and categorize input data",
    "input_schema": {
        "type": "object",
        "properties": {
            "primary_category": {"type": "string"},
            "subcategories": {
                "type": "array",
                "items": {"type": "string"}
            },
            "confidence_scores": {
                "type": "object",
                "additionalProperties": {"type": "number"}
            },
            "tags": {
                "type": "array",
                "items": {"type": "string"}
            }
        }
    }
}
```

## Tips for Optimal Results

1. **Be Specific**: The more detailed your schema and descriptions, the better the output
2. **Use Examples**: Include examples in your tool description when dealing with complex formats
3. **Test Iteratively**: Start with simple schemas and gradually add complexity
4. **Consider Context**: Provide sufficient context in your user message
5. **Model Selection**: Use Claude Opus or Sonnet for best results with complex schemas

## Limitations and Considerations

- The tool must be defined even though it won't be executed
- Output is limited by the model's context window
- Very complex schemas may require more tokens
- Always validate the output programmatically for critical applications

## Additional Resources

- [Anthropic Tool Use Documentation](https://docs.anthropic.com/en/docs/tool-use)
- [JSON Schema Specification](https://json-schema.org/)
- [Anthropic API Reference](https://docs.anthropic.com/en/api) 