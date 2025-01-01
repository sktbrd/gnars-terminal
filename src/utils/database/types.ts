import { Database } from './database.types';

export type PropDate = Database['public']['Tables']['propdates']['Row'];
export type PropDateInsert =
  Database['public']['Tables']['propdates']['Insert'];

export type Proposal = Database['public']['Tables']['proposals']['Row'];
export type ProposalInsert =
  Database['public']['Tables']['proposals']['Insert'];

export type User = Database['public']['Tables']['users']['Row'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];

export type Like = Database['public']['Tables']['likes']['Row'];
export type LikeInsert = Database['public']['Tables']['likes']['Insert'];

export type Editor = Database['public']['Tables']['editors']['Row'];
export type DAO = Database['public']['Tables']['dao']['Row'];
