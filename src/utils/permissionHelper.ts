export const canEditTask = (currentUser: string, taskAssignee: string) => {
  if (!currentUser || !taskAssignee) return false;
  
  const normalizedUser = currentUser.toLowerCase().trim();
  const normalizedAssignee = taskAssignee.toLowerCase().trim();
  
  return (
    normalizedUser === normalizedAssignee || 
    normalizedAssignee.includes(normalizedUser) || 
    normalizedUser.includes(normalizedAssignee)
  );
};
