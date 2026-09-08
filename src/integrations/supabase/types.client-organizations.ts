// Transitional aliases for the organization access feature.
// The canonical generated Supabase types remain in types.ts and can be regenerated
// in the normal project workflow after this branch is validated.

export type ClientOrganization = {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type ClientOrganizationMember = {
  id: string;
  organization_id: string;
  user_id: string | null;
  email: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type OrganizationContentLink = {
  organization_id: string;
  content_id: string;
  created_at?: string;
};

export type ExclusiveContentAccessScope = "global" | "organization";
