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
