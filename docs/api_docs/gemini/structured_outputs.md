# Gemini API Structured Outputs

## Overview

Google's Gemini API provides powerful structured output capabilities through JSON mode and schema validation. This allows developers to ensure that model responses conform to specific data structures, making them reliable for production applications.

## Key Features

- **JSON Mode**: Force the model to output valid JSON
- **Direct Schema Support**: Use Python TypedDict, Pydantic models, or JSON schemas
- **Type Safety**: Ensure responses match expected data structures
- **Multiple Schema Formats**: Support for various schema definition methods

## Basic Usage

### 1. JSON Mode with Prompt Schema

The simplest way to get structured output is to define the schema in your prompt:

```python
from google import genai

client = genai.Client()

prompt = """
List a few popular cookie recipes using this JSON schema:

Recipe = {'recipe_name': str}
Return: list[Recipe]
"""

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=prompt,
    config={
        'response_mime_type': 'application/json'
    }
)
```

### 2. Direct Schema with TypedDict

For more robust type safety, use Python's TypedDict:

```python
import typing_extensions as typing

class Recipe(typing.TypedDict):
    recipe_name: str
    recipe_description: str
    recipe_ingredients: list[str]

result = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="List a few imaginative cookie recipes",
    config={
        'response_mime_type': 'application/json',
        'response_schema': list[Recipe],
    }
)
```

### 3. Pydantic Models

Gemini also supports Pydantic models for more complex validation:

```python
from pydantic import BaseModel, Field

class Item(BaseModel):
    description: str = Field(description="The description of the item")
    quantity: float = Field(description="The quantity of the item")
    gross_worth: float = Field(description="The gross worth of the item")

class Invoice(BaseModel):
    """Extract invoice information"""
    invoice_number: str = Field(description="The invoice number")
    date: str = Field(description="The date of the invoice")
    items: list[Item] = Field(description="List of items")
    total_gross_worth: float = Field(description="Total gross worth")

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Extract data from this invoice: ...",
    config={
        'response_mime_type': 'application/json',
        'response_schema': Invoice
    }
)

# Access parsed data
invoice_data = response.parsed
```

## Advanced Examples

### Complex Nested Structures

```python
from typing_extensions import TypedDict

class Character(TypedDict):
    name: str
    description: str
    alignment: str

class Location(TypedDict):
    name: str
    description: str

class TextSummary(TypedDict):
    synopsis: str
    genres: list[str]
    locations: list[Location]
    characters: list[Character]

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=f"Summarize this story: {story_text}",
    config={
        "response_mime_type": "application/json",
        "response_schema": TextSummary
    }
)
```

### Using Enums for Constrained Values

```python
import enum
from typing_extensions import TypedDict

class Relevance(enum.Enum):
    WEAK = "weak"
    STRONG = "strong"

class Topic(TypedDict):
    topic: str
    relevance: Relevance

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=article,
    config={
        "system_instruction": "Extract topics from text",
        "response_mime_type": "application/json",
        "response_schema": list[Topic]
    }
)
```

### Entity Extraction

```python
from enum import Enum
from typing_extensions import TypedDict

class CategoryEnum(str, Enum):
    Person = 'Person'
    Company = 'Company'
    State = 'State'
    City = 'City'

class Entity(TypedDict):
    name: str
    category: CategoryEnum

class Entities(TypedDict):
    entities: list[Entity]

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=f"Extract entities from: {text}",
    config={
        "temperature": 0,
        "response_mime_type": "application/json",
        "response_schema": Entities
    }
)
```

## REST API Usage

You can also use structured outputs with the REST API:

```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=$GOOGLE_API_KEY" \
-H 'Content-Type: application/json' \
-d '{
    "contents": [{
        "parts":[{
            "text": "List cookie recipes using this schema: {'\''type'\'': '\''object'\'', '\''properties'\'': {'\''recipe_name'\'': {'\''type'\'': '\''string'\''}}}"
        }]
    }],
    "generationConfig": {
        "response_mime_type": "application/json"
    }
}'
```

## Configuration Options

### GenerationConfig

The `GenerationConfig` object supports various parameters:

```python
from google.genai import types

config = types.GenerateContentConfig(
    temperature=0,  # For deterministic output
    response_mime_type="application/json",
    response_schema=YourSchema,
    system_instruction="Your system prompt here"
)
```

### System Instructions

Combine structured outputs with system instructions for better control:

```python
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=user_input,
    config={
        "system_instruction": """
        You are a helpful assistant that extracts structured data.
        Be precise and accurate in your extractions.
        """,
        "response_mime_type": "application/json",
        "response_schema": YourSchema
    }
)
```

## Error Handling

Always handle potential parsing errors:

```python
try:
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config={
            "response_mime_type": "application/json",
            "response_schema": YourSchema
        }
    )
    
    # Access raw JSON
    json_data = json.loads(response.text)
    
    # Or access parsed object (if using Pydantic)
    parsed_data = response.parsed
    
except Exception as e:
    print(f"Error generating structured output: {e}")
```

## Best Practices

1. **Use Specific Models**: Gemini 2.5 Flash and Pro models have the best structured output support
2. **Define Clear Schemas**: The clearer your schema, the better the output
3. **Use Temperature 0**: For deterministic outputs, set temperature to 0
4. **Validate Output**: Always validate the returned data matches your schema
5. **Provide Examples**: Include examples in your prompts for better results

## Function Declarations

For tool use and function calling, Gemini can also generate structured function declarations:

```python
import json
from google.genai import types

def set_light_color(rgb_hex: str):
    """Set the light color."""
    pass

# Generate schema from function
set_color_declaration = types.FunctionDeclaration.from_callable(
    callable=set_light_color,
    client=client
)

print(json.dumps(set_color_declaration.to_json_dict(), indent=4))
```

## Additional Resources

- [Gemini API Structured Output Documentation](https://ai.google.dev/gemini-api/docs/structured-output)
- [GenerationConfig API Reference](https://ai.google.dev/api/generate-content#generationconfig)
- [Gemini Cookbook Examples](https://github.com/google-gemini/cookbook) 