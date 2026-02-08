// Workflow context type definitions

export type Channel = "web" | "email" | "sms";

export type Intent = "booking" | "cancel" | "reschedule" | "info" | "unknown";

export type WorkflowContext = {
  businessId: string;
  channel: Channel;
  rawMessage: string;
  
  // Extracted data
  intent?: Intent;
  customerName?: string;
  requestedDateTime?: Date;
  requestedService?: string;
  
  // Validation and execution
  validationErrors: string[];
  actionsTaken: string[];
  responseMessage?: string;
};

