// Workflow template definition

export const WORKFLOW_TEMPLATE = {
  name: "Booking Assistant v1",
  trigger: "incoming_message",
  steps: [
    "detect_intent",
    "extract_name",
    "extract_datetime",
    "extract_service",
    "validate_required_fields",
    "validate_opening_hours",
    "create_airtable_lead",
    "create_airtable_booking",
    "build_response",
  ],
} as const;

export type WorkflowStep = typeof WORKFLOW_TEMPLATE.steps[number];

