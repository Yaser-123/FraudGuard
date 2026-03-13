// schema.js - Database schema for complaint form
import { pgTable, serial, text, timestamp, jsonb, varchar } from 'drizzle-orm/pg-core';

export const complaints = pgTable('complaints', {
  id: serial('id').primaryKey(),
  
  // Customer information
  customerName: varchar('customer_name', { length: 255 }).notNull(),
  phoneNumber: varchar('phone_number', { length: 50 }).notNull(),
  
  // Complaint details
  complaintId: varchar('complaint_id', { length: 100 }).notNull().unique(),
  issueSummary: text('issue_summary').notNull(),
  fraudMessage: text('fraud_message'),
  
  // System information
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  deviceInfo: jsonb('device_info'),
  ipAddress: varchar('ip_address', { length: 45 }),
  
  // File information
  screenshotPath: varchar('screenshot_path', { length: 500 }),
  screenshotOriginalName: varchar('screenshot_original_name', { length: 255 }),
  
  // API response
  omniResponseData: jsonb('omni_response_data'),
  callDispatchSuccess: varchar('call_dispatch_success', { length: 10 }).default('pending'),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});
