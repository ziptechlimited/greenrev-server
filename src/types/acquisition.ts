export type AcquisitionStatus =
  | "pending"
  | "accepted"
  | "receipt_uploaded"
  | "payment_confirmed"
  | "completed";

export type AcquisitionEventAction =
  | "created"
  | "vendor_accepted"
  | "receipt_uploaded"
  | "payment_confirmed"
  | "client_completed"
  | "admin_flagged"
  | "admin_resolved";

