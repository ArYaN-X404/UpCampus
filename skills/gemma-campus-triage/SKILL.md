---
name: gemma-campus-triage
description: >-
  Autonomous multimodal campus safety, hazard triage, and infrastructure governance agent 
  powered by Google Gemma 4. Ingests campus defect photographs, student contextual descriptions, 
  and spatial landmarks to diagnose failure severity, identify safety risks, route to responsible 
  university departments, and generate structured tickets with zero manual overhead.
version: 1.0.0
author: UpCampus Contributors
license: MIT
metadata:
  model_family: gemma-4
  modality: multimodal (vision + text)
  specification_compliance: Agent Skill Open Standard v1.0
inputs:
  image:
    type: string
    description: Base64 data URL or absolute URI to the captured campus hazard or amenity photograph
    required: false
  text:
    type: string
    description: Student or staff contextual observations regarding the defect or proposal
    required: true
  location:
    type: string
    description: Reported physical landmark, hall, floor, or quadrangle
    required: false
outputs:
  category:
    type: string
    enum: [Complaint, Suggestion]
    description: Classification between reactive infrastructure repair vs. proactive campus enhancement
  department:
    type: string
    enum: [Maintenance & Electrical, Sanitation & Plumbing, IT & Network Infrastructure, Estate & Civil Works, Campus Security & Safety, Academic & Welfare]
    description: Official university department accountable for resolving this issue
  urgency:
    type: string
    enum: [urgent, medium, low]
    description: Urgency level based on pedestrian safety, electrical risk, or operational disruption
  severity:
    type: number
    description: Defect severity index between 1.0 and 10.0
  confidence:
    type: number
    description: Classifier certainty percentage (0 to 100)
  suggestedTitle:
    type: string
    description: Concise, actionable ticket title (under 10 words)
  suggestedLocation:
    type: string
    description: Standardized campus location
  hazardSummary:
    type: string
    description: Technical evaluation of physical risk, safety liabilities, and secondary damage
  recommendedAction:
    type: string
    description: Tactical SOP dispatch instruction for campus facilities staff
---

# UpCampus Gemma 4 Multimodal Campus Triage Agent Skill

The **Gemma 4 Campus Triage Skill** is an open-standard agent skill designed to automate university infrastructure governance. It bridges student field reports directly into verified, prioritized maintenance work-orders.

## 1. Taxonomic Classification Engine

The agent classifies all campus inputs into one of two root classes:
- **Complaint (`grievance`):** Physical breakdown, water leak, electrical hazard, structural defect, network outage, or sanitation failure requiring immediate corrective intervention.
- **Suggestion (`suggestion`):** Proactive proposal for student life enhancements, library study amenities, ergonomic additions, or campus greening.

### Department Routing Matrix
| Department | Scope & Physical Landmarks | Typical Escalation Threshold |
| :--- | :--- | :--- |
| **Maintenance & Electrical** | Streetlights, high-voltage conduits, circuit breakers, backup generators, elevator power | Urgent if exposed wires or total darkness in pedestrian corridors |
| **Sanitation & Plumbing** | Washrooms, ruptured water mains, overhead tanks, sewer drains, standing water | Urgent if continuous water leakage or blackwater contamination |
| **IT & Network Infrastructure** | Wi-Fi access points, fiber conduits, lab computers, lecture hall projectors, smartboards | Medium for lecture disruption; Urgent for whole-campus backbone outage |
| **Estate & Civil Works** | Broken concrete pathways, potholes, cracked classroom furniture, doors, windows, railings | Urgent if railing or ceiling plaster structural failure |
| **Campus Security & Safety** | Perimeter fencing, access gates, emergency call boxes, security cameras | Urgent for gate compromise or unlocked high-voltage substations |
| **Academic & Welfare** | Study rooms, library cubicles, student lounges, cafeteria seating, water dispensers | Low/Medium for amenity upgrade suggestions |

## 2. Urgency & Severity Scoring Standard

The severity score is calculated dynamically using a 3-factor metric:
$$\text{Severity} = \min(10.0, \; \text{SafetyRisk} \times 0.5 + \text{DisruptionScope} \times 0.3 + \text{Immediacy} \times 0.2)$$

- **`urgent` (Severity $\ge 7.5$):** 
  - Life-safety risks: exposed electrical wires, gas leaks, structural ceiling cracks.
  - Active flood or water supply contamination.
  - Total pathway illumination loss on student night routes.
- **`medium` (Severity $4.5 - 7.4$):**
  - Academic disruption: classroom projector failure, broken air conditioning during exams, single stall plumbing failure.
- **`low` (Severity $< 4.5$):**
  - Cosmetic defects, student amenity requests, aesthetic garden suggestions.

## 3. Invocation Protocol & Schema Validation

When this skill is executed by an AI agent harness (e.g. Antigravity, Claude Code, or LangGraph):

### Input Contract
```json
{
  "image": "data:image/jpeg;base64,...",
  "text": "The streetlight pole near Girls Hostel 3 has fallen wires sparking on the grass.",
  "location": "Girls Hostel 3 Pathway"
}
```

### Output Contract
```json
{
  "category": "Complaint",
  "department": "Maintenance & Electrical",
  "urgency": "urgent",
  "severity": 9.4,
  "confidence": 98,
  "suggestedTitle": "High-voltage fallen streetlight wiring sparking near Hostel 3",
  "suggestedLocation": "Girls Hostel 3 Pathway, North Perimeter",
  "suggestedDescription": "Fallen streetlight pole with live sparking wiring on grass pathway poses immediate electrocution hazard to students.",
  "hazardSummary": "Critical life-safety electrocution and grassfire risk.",
  "recommendedAction": "Immediate emergency circuit de-energization and dispatch of high-voltage maintenance crew.",
  "modelUsed": "gemma-4-multimodal"
}
```

## 4. Resilience & Fallback Invariant

In headless or low-connectivity edge deployments where upstream cloud model APIs are unreachable:
1. The skill must fall back gracefully to the deterministic **Local Heuristic Inference Matrix**.
2. Under no circumstance may the agent crash, throw unhandled rejections, or emit malformed non-JSON output.
3. Completeness and urgency ratings must remain physically defensible.
