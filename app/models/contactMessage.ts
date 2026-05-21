import { sql } from '../utils/db';

export interface DbContactMessage {
  id: string;
  created_at: string;
  name: string;
  contacts: string[];
  message: string;
}

export interface NewContactMessage {
  name: string;
  contacts: string[];
  message: string;
}

/**
 * Create a new contact message
 */
export async function createContactMessage(message: NewContactMessage): Promise<DbContactMessage> {
  const { name, contacts, message: messageText } = message;

  const result = await sql`
    INSERT INTO contact_messages (name, contacts, message) 
    VALUES (${name}, ${contacts}, ${messageText}) 
    RETURNING id, created_at, name, contacts, message
  `;

  return result[0] as unknown as DbContactMessage;
}

/**
 * Get all contact messages
 */
export async function getAllContactMessages(): Promise<DbContactMessage[]> {
  const results = await sql`
    SELECT * FROM contact_messages ORDER BY created_at DESC
  `;

  return results as unknown as DbContactMessage[];
}

/**
 * Get a contact message by ID
 */
export async function getContactMessageById(id: string): Promise<DbContactMessage | null> {
  const results = await sql`
    SELECT * FROM contact_messages WHERE id = ${id}
  `;

  return results.length > 0 ? results[0] as unknown as DbContactMessage : null;
}

/**
 * Delete a contact message by ID
 */
export async function deleteContactMessage(id: string): Promise<boolean> {
  const result = await sql`
    DELETE FROM contact_messages WHERE id = ${id} RETURNING id
  `;

  return result.length > 0;
}
