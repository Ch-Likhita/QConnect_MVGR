export const PERMISSIONS = {
  // Question permissions
  ASK_QUESTION: 'ask_question',
  ANSWER_QUESTION: 'answer_question',
  EDIT_OWN_QUESTION: 'edit_own_question',
  DELETE_OWN_QUESTION: 'delete_own_question',
  
  // Admin permissions
  VERIFY_USERS: 'verify_users',
  ASSIGN_ROLES: 'assign_roles',
  MANAGE_CONTENT: 'manage_content',
  VIEW_ADMIN_PANEL: 'view_admin_panel',
  ADD_RECRUITER: 'add_recruiter',
  
  // Moderation
  FLAG_CONTENT: 'flag_content',
  EDIT_ANY_CONTENT: 'edit_any_content',
  DELETE_ANY_CONTENT: 'delete_any_content',
};

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  student: [
    PERMISSIONS.ASK_QUESTION,
    PERMISSIONS.EDIT_OWN_QUESTION,
    PERMISSIONS.DELETE_OWN_QUESTION,
  ],
  expert: [
    PERMISSIONS.ASK_QUESTION,
    PERMISSIONS.ANSWER_QUESTION, // ONLY IF VERIFIED (Check in UI/Rules)
    PERMISSIONS.EDIT_OWN_QUESTION,
    PERMISSIONS.DELETE_OWN_QUESTION,
  ],
  moderator: [
    PERMISSIONS.ASK_QUESTION,
    PERMISSIONS.ANSWER_QUESTION,
    PERMISSIONS.EDIT_OWN_QUESTION,
    PERMISSIONS.DELETE_OWN_QUESTION,
    PERMISSIONS.FLAG_CONTENT,
    PERMISSIONS.EDIT_ANY_CONTENT,
  ],
  admin: Object.values(PERMISSIONS),
};

export function hasPermission(role: string, permission: string): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}