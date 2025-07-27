import markdown
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.platypus import Table, TableStyle
from reportlab.lib.enums import TA_JUSTIFY, TA_LEFT, TA_CENTER
from reportlab.lib import colors
import re
import html

def convert_markdown_to_pdf(md_file, pdf_file):
    # Read markdown content
    with open(md_file, 'r', encoding='utf-8') as f:
        md_content = f.read()
    
    # Create PDF document
    doc = SimpleDocTemplate(pdf_file, pagesize=letter,
                            rightMargin=72, leftMargin=72,
                            topMargin=72, bottomMargin=18)
    
    # Container for the 'Flowable' objects
    story = []
    
    # Define styles
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name='Justify', alignment=TA_JUSTIFY))
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#4B0082'),
        spaceAfter=30,
        alignment=TA_CENTER
    )
    
    heading1_style = ParagraphStyle(
        'CustomHeading1',
        parent=styles['Heading1'],
        fontSize=18,
        textColor=colors.HexColor('#4B0082'),
        spaceAfter=12
    )
    
    heading2_style = ParagraphStyle(
        'CustomHeading2',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=colors.HexColor('#663399'),
        spaceAfter=10
    )
    
    heading3_style = ParagraphStyle(
        'CustomHeading3',
        parent=styles['Heading3'],
        fontSize=14,
        textColor=colors.HexColor('#663399'),
        spaceAfter=8
    )
    
    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['BodyText'],
        fontSize=11,
        leading=14,
        spaceAfter=12
    )
    
    bullet_style = ParagraphStyle(
        'BulletStyle',
        parent=body_style,
        leftIndent=20,
        bulletIndent=10
    )
    
    # Split content into lines
    lines = md_content.split('\n')
    
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        
        # Skip empty lines
        if not line:
            story.append(Spacer(1, 0.1*inch))
            i += 1
            continue
        
        # Handle headers
        if line.startswith('# '):
            text = line[2:].strip()
            # Check if it's the main title
            if i == 0:
                story.append(Paragraph(text, title_style))
            else:
                story.append(Paragraph(text, heading1_style))
        elif line.startswith('## '):
            text = line[3:].strip()
            story.append(Paragraph(text, heading2_style))
        elif line.startswith('### '):
            text = line[4:].strip()
            story.append(Paragraph(text, heading3_style))
        elif line.startswith('#### '):
            text = line[5:].strip()
            story.append(Paragraph(f"<b>{text}</b>", body_style))
        elif line.startswith('---'):
            story.append(Spacer(1, 0.2*inch))
            # Add a line
            story.append(Paragraph('<para><font color="#cccccc">_' * 80 + '</font></para>', body_style))
            story.append(Spacer(1, 0.2*inch))
        elif line.startswith('- ') or line.startswith('• '):
            # Handle bullet points
            text = line[2:].strip()
            # Process markdown formatting
            text = process_markdown_formatting(text)
            story.append(Paragraph(f"• {text}", bullet_style))
        elif line.startswith('```'):
            # Handle code blocks
            code_lines = []
            i += 1
            while i < len(lines) and not lines[i].strip().startswith('```'):
                code_lines.append(lines[i])
                i += 1
            code_text = '<font name="Courier" size="9">' + html.escape('\n'.join(code_lines)) + '</font>'
            story.append(Paragraph(code_text, body_style))
        elif re.match(r'^\d+\.\s', line):
            # Handle numbered lists
            text = re.sub(r'^\d+\.\s', '', line).strip()
            text = process_markdown_formatting(text)
            story.append(Paragraph(f"{line.split('.')[0]}. {text}", bullet_style))
        else:
            # Regular paragraph
            text = process_markdown_formatting(line)
            story.append(Paragraph(text, body_style))
        
        i += 1
    
    # Build PDF
    doc.build(story)
    print(f"PDF created successfully: {pdf_file}")

def process_markdown_formatting(text):
    """Convert markdown formatting to ReportLab HTML-like tags"""
    # Bold
    text = re.sub(r'\*\*([^*]+)\*\*', r'<b>\1</b>', text)
    # Italic
    text = re.sub(r'\*([^*]+)\*', r'<i>\1</i>', text)
    # Inline code
    text = re.sub(r'`([^`]+)`', r'<font name="Courier">\1</font>', text)
    # Links (just show the text, not the URL)
    text = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', text)
    
    return text

if __name__ == "__main__":
    # Convert the markdown file to PDF
    convert_markdown_to_pdf(
        'glueiq_assessment_offering.md',
        'HumanGlue_GlueIQ_Assessment_Offering.pdf'
    )