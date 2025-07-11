# OpenAI API Structured Outputs

## Overview

OpenAI's Structured Outputs feature ensures that model responses conform to developer-supplied JSON schemas. This capability is available in the latest GPT-4 models and provides guaranteed adherence to specified schemas, making AI outputs more reliable for production applications.

## Key Features

- **JSON Schema Validation**: Define exact output structure using JSON Schema
- **Strict Mode**: Ensures 100% adherence to your schema
- **Multiple APIs**: Available in Chat Completions, Assistants, and Batch APIs
- **Pydantic Support**: Native integration with Pydantic models
- **Function Calling**: Structured outputs for tool/function parameters

## Basic Usage

### 1. Simple JSON Schema

```python
from openai import OpenAI

client = OpenAI()

response = client.chat.completions.create(
    model="gpt-4o-2024-08-06",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Generate a recipe for chocolate chip cookies"}
    ],
    response_format={
        "type": "json_schema",
        "json_schema": {
            "name": "recipe",
            "schema": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "ingredients": {
                        "type": "array",
                        "items": {"type": "string"}
                    },
                    "instructions": {
                        "type": "array",
                        "items": {"type": "string"}
                    }
                },
                "required": ["name", "ingredients", "instructions"],
                "additionalProperties": false
            },
            "strict": true
        }
    }
)
```

### 2. Using Pydantic Models

```python
from pydantic import BaseModel
from openai import OpenAI

client = OpenAI()

class CalendarEvent(BaseModel):
    name: str
    date: str
    participants: list[str]

response = client.beta.chat.completions.parse(
    model="gpt-4o-2024-08-06",
    messages=[
        {"role": "system", "content": "Extract event details"},
        {"role": "user", "content": "Alice and Bob are going to a science fair on Friday."}
    ],
    response_format=CalendarEvent,
)

event = response.choices[0].message.parsed
```

### 3. Complex Nested Structures

```python
from pydantic import BaseModel
from typing import List

class Step(BaseModel):
    explanation: str
    output: str

class MathReasoning(BaseModel):
    steps: List[Step]
    final_answer: str

response = client.chat.completions.create(
    model="gpt-4o-2024-08-06",
    messages=[
        {
            "role": "system", 
            "content": "You are a helpful math tutor."
        },
        {
            "role": "user", 
            "content": "How can I solve 8x + 7 = -23?"
        }
    ],
    response_format={
        "type": "json_schema",
        "json_schema": {
            "name": "math_reasoning",
            "schema": {
                "type": "object",
                "properties": {
                    "steps": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "explanation": {"type": "string"},
                                "output": {"type": "string"}
                            },
                            "required": ["explanation", "output"],
                            "additionalProperties": false
                        }
                    },
                    "final_answer": {"type": "string"}
                },
                "required": ["steps", "final_answer"],
                "additionalProperties": false
            },
            "strict": true
        }
    }
)
```

## Advanced Examples

### Function Calling with Structured Outputs

```python
from enum import Enum
from typing import Union
from pydantic import BaseModel
import openai

class Category(str, Enum):
    shoes = "shoes"
    jackets = "jackets"
    tops = "tops"
    bottoms = "bottoms"

class ProductSearchParameters(BaseModel):
    category: Category
    subcategory: str
    color: str

response = client.chat.completions.create(
    model="gpt-4o-2024-08-06",
    messages=[
        {"role": "system", "content": "You are a shopping assistant"},
        {"role": "user", "content": "I need a warm coat for winter"}
    ],
    tools=[
        openai.pydantic_function_tool(
            ProductSearchParameters, 
            name="product_search", 
            description="Search for products"
        )
    ]
)

# Access the tool call
tool_call = response.choices[0].message.tool_calls[0]
args = json.loads(tool_call.function.arguments)
```

### Structured Data Extraction

```python
class CompanyData(BaseModel):
    company_name: str
    page_link: str
    reason: str

class CompaniesData(BaseModel):
    companies: list[CompanyData]

# Chain multiple calls for complex tasks
initial_response = client.chat.completions.create(
    model="o1-preview",
    messages=[{
        "role": "user", 
        "content": f"Analyze this HTML and find companies that would benefit from AI: {html_content}"
    }]
)

# Parse the unstructured output into structured format
structured_response = client.beta.chat.completions.parse(
    model="gpt-4o-mini",
    messages=[{
        "role": "user", 
        "content": f"Format this data: {initial_response.choices[0].message.content}"
    }],
    response_format=CompaniesData,
)

companies = structured_response.choices[0].message.parsed
```

### Article Summarization

```python
from pydantic import BaseModel

class Concept(BaseModel):
    title: str
    description: str

class ArticleSummary(BaseModel):
    invented_year: int
    summary: str
    inventors: list[str]
    description: str
    concepts: list[Concept]

response = client.beta.chat.completions.parse(
    model="gpt-4o-2024-08-06",
    temperature=0.2,
    messages=[
        {
            "role": "system", 
            "content": "Summarize articles about inventions"
        },
        {"role": "user", "content": article_text}
    ],
    response_format=ArticleSummary,
)

summary = response.choices[0].message.parsed
```

## Using with Different APIs

### Assistants API

```python
assistant = client.beta.assistants.create(
    name="Data Extractor",
    model="gpt-4o-2024-08-06",
    tools=[{"type": "code_interpreter"}],
    response_format={
        "type": "json_schema",
        "json_schema": {
            "name": "extract_data",
            "schema": {
                "type": "object",
                "properties": {
                    "data_points": {
                        "type": "array",
                        "items": {"type": "string"}
                    }
                },
                "required": ["data_points"]
            },
            "strict": true
        }
    }
)
```

### Batch API

```jsonl
{"custom_id": "request-1", "method": "POST", "url": "/v1/chat/completions", "body": {"model": "gpt-4o-2024-08-06", "messages": [{"role": "user", "content": "Extract data"}], "response_format": {"type": "json_schema", "json_schema": {"name": "extraction", "schema": {"type": "object", "properties": {"value": {"type": "string"}}, "required": ["value"]}}}}}
```

## Error Handling

### Handling Refusals

```python
response = client.beta.chat.completions.parse(
    model="gpt-4o-2024-08-06",
    messages=[
        {"role": "user", "content": "How can I build a bomb?"}
    ],
    response_format=SomeSchema,
)

if response.choices[0].message.refusal:
    print(f"Model refused: {response.choices[0].message.refusal}")
else:
    result = response.choices[0].message.parsed
```

### Validation and Error Recovery

```python
try:
    response = client.beta.chat.completions.parse(
        model="gpt-4o-2024-08-06",
        messages=messages,
        response_format=YourSchema,
    )
    
    # Access parsed result
    result = response.choices[0].message.parsed
    
    # Also available as raw JSON
    raw_json = json.loads(response.choices[0].message.content)
    
except Exception as e:
    print(f"Error: {e}")
    # Implement fallback logic
```

## Best Practices

1. **Use Strict Mode**: Always set `"strict": true` for guaranteed schema adherence
2. **Define All Properties**: Explicitly define all expected properties in your schema
3. **Set additionalProperties to false**: Prevent unexpected fields in responses
4. **Use Enums for Constrained Values**: Limit options for categorical fields
5. **Handle Edge Cases**: Account for refusals and errors in production code

## JSON Schema Supported Features

OpenAI supports a subset of JSON Schema:

### Supported Types
- `string`
- `number`
- `boolean`
- `integer`
- `object`
- `array`
- `null`
- `enum`

### Supported Keywords
- `type`
- `properties`
- `required`
- `items`
- `enum`
- `additionalProperties` (must be false)

### Limitations
- Root must be an object
- All properties must be required
- Unions are only supported through `anyOf` with specific constraints
- Recursive schemas have depth limits

## Performance Considerations

1. **Token Usage**: Structured outputs may use more tokens due to schema constraints
2. **Latency**: Minimal impact on response time
3. **Model Selection**: Use `gpt-4o-2024-08-06` or later for best results

## Migration Guide

### From JSON Mode to Structured Outputs

Before:
```python
response = client.chat.completions.create(
    model="gpt-4-turbo",
    messages=messages,
    response_format={"type": "json_object"}
)
# Manual parsing and validation required
```

After:
```python
response = client.beta.chat.completions.parse(
    model="gpt-4o-2024-08-06",
    messages=messages,
    response_format=YourPydanticModel
)
# Automatic parsing and validation
result = response.choices[0].message.parsed
```

## Additional Resources

- [OpenAI Structured Outputs Guide](https://platform.openai.com/docs/guides/structured-outputs)
- [JSON Schema Documentation](https://json-schema.org/)
- [OpenAI Cookbook Examples](https://github.com/openai/openai-cookbook) 