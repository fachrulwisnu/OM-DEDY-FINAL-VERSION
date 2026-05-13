export const MIGRATION_STATUSES = [
  'On Queue',
  'FSD On Progress',
  'Dev On Queue',
  'Dev On Progress',
  'SIT On Progress',
  'UAT On Queue',
  'UAT On Progress',
  'Change Request On Progress',
  'Hold By Owner',
  'Hold By IT',
  'Hold By Client/Vendor',
  'Canceled',
  'Live On Queue',
  'Live On Monitoring'
];

export const STATUS_COLORS: Record<string, string> = {
  'On Queue': 'bg-gray-800 text-gray-300 border-gray-600',
  'FSD On Progress': 'bg-blue-900/50 text-blue-300 border-blue-700',
  'Dev On Queue': 'bg-indigo-900/50 text-indigo-300 border-indigo-700',
  'Dev On Progress': 'bg-indigo-700/50 text-indigo-100 border-indigo-500',
  'SIT On Progress': 'bg-cyan-900/50 text-cyan-300 border-cyan-700',
  'UAT On Queue': 'bg-purple-900/50 text-purple-300 border-purple-700',
  'UAT On Progress': 'bg-purple-700/50 text-purple-100 border-purple-500',
  'Change Request On Progress': 'bg-pink-900/50 text-pink-300 border-pink-700',
  'Hold By Owner': 'bg-red-900/50 text-red-300 border-red-700',
  'Hold By IT': 'bg-red-900/50 text-red-300 border-red-700',
  'Hold By Client/Vendor': 'bg-red-900/50 text-red-300 border-red-700',
  'Canceled': 'bg-red-950/50 text-red-400 border-red-900',
  'Live On Queue': 'bg-emerald-900/50 text-emerald-300 border-emerald-700',
  'Live On Monitoring': 'bg-green-900/50 text-green-300 border-green-700'
};
