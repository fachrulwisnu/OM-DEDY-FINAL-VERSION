import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import { PHASE_ORDER } from '../constants';

/**
 * Higher-order export utility for Om Dedy Dashboard
 * Generates a management-ready styled XLSX report
 */
export const exportToExcel = async (project: any, tasks: any[]) => {
  if (!project || !tasks) {
    console.error("Export failed: Missing project or tasks data");
    return;
  }

  // 1. Sort tasks chronologically by PHASE_ORDER
  const sortedTasks = [...tasks].sort((a, b) => {
    const phaseA = (a.phase_type || a.title || a.name || '').toUpperCase();
    const phaseB = (b.phase_type || b.title || b.name || '').toUpperCase();
    
    // Check if the title starts with one of the phases
    const getOrder = (p: string) => {
       for (const key in PHASE_ORDER) {
          if (p.includes(key)) return PHASE_ORDER[key];
       }
       return 99;
    };

    const orderA = getOrder(phaseA);
    const orderB = getOrder(phaseB);
    
    if (orderA !== orderB) return orderA - orderB;
    
    // Secondary sort by date if same phase or unknown
    return new Date(a.start_time || a.plan_start_date).getTime() - new Date(b.start_time || b.plan_start_date).getTime();
  });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Timeline Approval');

  // 1. SET COLUMN WIDTHS
  sheet.columns = [
    { header: 'Project Name', key: 'projectName', width: 30 },
    { header: 'Phase L1', key: 'phaseL1', width: 25 },
    { header: 'Task', key: 'task', width: 35 },
    { header: 'Type Task', key: 'taskType', width: 20 },
    { header: 'Components', key: 'components', width: 30 },
    { header: 'Detail Breakdown', key: 'detail', width: 40 },
    { header: 'Man Hours', key: 'manHours', width: 15 },
    { header: 'Man Hours (In Minutes)', key: 'manHoursMin', width: 22 },
    { header: 'Start Date', key: 'planStart', width: 18 },
    { header: 'End Date', key: 'planEnd', width: 18 },
    { header: 'Status', key: 'status', width: 20 },
    { header: 'Fachrul Feedback', key: 'feedback1', width: 30 },
    { header: 'Barra Feedback', key: 'feedback2', width: 30 },
  ];

  // 2. ADD TITLE
  sheet.mergeCells('A1:M1');
  const titleCell = sheet.getCell('A1');
  titleCell.value = 'OM DEDY - PROJECT TIMELINE & BREAKDOWN REPORT';
  titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FF1E3A8A' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

  sheet.addRow([]); // Row 2 Spacer

  // 3. ADD SUMMARY INFO
  const addSummaryRow = (label1: string, val1: string, label2: string, val2: string) => {
    const row = sheet.addRow([label1, val1, '', label2, val2]);
    row.getCell(1).font = { bold: true };
    row.getCell(4).font = { bold: true };
    sheet.mergeCells(`B${row.number}:C${row.number}`);
    sheet.mergeCells(`E${row.number}:M${row.number}`);
    return row;
  };

  // Helper to format date safely
  const formatDate = (date: any) => {
    if (!date) return '-';
    try {
      return format(new Date(date), 'MMM dd, yyyy');
    } catch {
      return date.toString();
    }
  };

  // Calculate total man hours dynamically
  const totalHours = tasks.reduce((sum, task) => sum + (parseFloat(task.man_hours) || 0), 0);

  addSummaryRow(
    'Project Name', 
    project.project_name || project.name || 'UNTITLED PROJECT', 
    'Global Status', 
    project.global_status || project.status || 'TO DO'
  ); // Row 3
  addSummaryRow(
    'Start Date', 
    formatDate(project.plan_start_date || project.start_date), 
    'Total Man Hours', 
    `${totalHours.toFixed(1)} Hours`
  ); // Row 4
  addSummaryRow(
    'End Date', 
    formatDate(project.plan_end_date || project.end_date), 
    'PIC', 
    project.pic_name || project.leader_email || 'Unassigned'
  ); // Row 5
  
  sheet.addRow([]); // Row 6 Spacer before table

  // 4. ADD TABLE HEADERS
  const headerRow = sheet.addRow([
    'Project Name', 'Phase L1', 'Task', 'Type Task', 'Components', 'Detail Breakdown', 'Man Hours', 'Man Hours (In Minutes)', 'Start Date', 'End Date', 'Status', 'Fachrul Feedback', 'Barra Feedback'
  ]); // Row 7
  
  headerRow.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } }; // Dark Blue
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = { top: { style:'thin' }, left: { style:'thin' }, bottom: { style:'thin' }, right: { style:'thin' } };
  });

  // 5. ADD DATA ROWS WITH hierarchy logic
  const l1Phases = sortedTasks.filter(t => !t.parent_id);
  const l2Tasks = sortedTasks.filter(t => t.parent_id);

  const dataStartRow = 8;
  let currentRow = dataStartRow;

  l1Phases.forEach(l1 => {
    const l1Status = (l1.current_status || l1.status || 'TO DO').toUpperCase();
    const l1Hours = parseFloat(l1.man_hours) || 0;
    const l1Minutes = l1Hours * 60;

    // Add L1 Row
    const rowL1 = sheet.addRow([
      project.project_name || project.name || '-',
      l1.phase_type || l1.title || l1.name || '-',
      '-', // Task (L2)
      '', // Type Task (Empty for L1)
      '', // Components (Empty for L1)
      '', // Detail Breakdown (Empty for L1 per requirement)
      `${l1Hours} h`,
      `${l1Minutes} m`,
      formatDate(l1.plan_start_date || l1.start_time),
      formatDate(l1.plan_end_date || l1.end_time),
      l1Status,
      l1.fachrul_feedback || l1.suggestion_fachrul || '-',
      l1.barra_feedback || l1.suggestion_barra || '-'
    ]);
    currentRow++;

    rowL1.eachCell((cell, colNumber) => {
        cell.border = { top: { style:'thin' }, left: { style:'thin' }, bottom: { style:'thin' }, right: { style:'thin' } };
        cell.alignment = { vertical: 'middle' };
        if (colNumber >= 7 && colNumber <= 10) cell.alignment = { horizontal: 'center', vertical: 'middle' };
        if (colNumber === 11) {
            cell.font = { bold: true };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
        }
        // Bold L1 rows for visual hierarchy
        cell.font = { ...cell.font, bold: true };
    });

    // Add L2 Children
    const children = l2Tasks.filter(t => t.parent_id === l1.id);
    children.forEach(l2 => {
        const l2Status = (l2.current_status || l2.status || 'TO DO').toUpperCase();
        const l2Hours = parseFloat(l2.man_hours) || 0;
        const l2Minutes = l2Hours * 60;

        const rowL2 = sheet.addRow([
            project.project_name || project.name || '-',
            '', // Phase (L1) (blank for subrows)
            l2.title || l2.name || '-',
            l2.task_type || '-',
            (l2.components || []).join(', ') || '-',
            l2.detail_task || '-',
            `${l2Hours} h`,
            `${l2Minutes} m`,
            formatDate(l2.plan_start_date || l2.start_time),
            formatDate(l2.plan_end_date || l2.end_time),
            l2Status,
            l2.fachrul_feedback || l2.suggestion_fachrul || '-',
            l2.barra_feedback || l2.suggestion_barra || '-'
        ]);
        currentRow++;

        rowL2.eachCell((cell, colNumber) => {
            cell.border = { top: { style:'thin' }, left: { style:'thin' }, bottom: { style:'thin' }, right: { style:'thin' } };
            cell.alignment = { vertical: 'middle' };
            if (colNumber >= 7 && colNumber <= 10) cell.alignment = { horizontal: 'center', vertical: 'middle' };
            
            // Status Coloring Logic
            if (colNumber === 11) {
              cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
              const stat = l2Status;
              if (stat.includes('DONE') || stat.includes('EARLY') || stat.includes('LIVE')) {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF10B981' } }; // Emerald Green
              } else if (stat.includes('PROGRESS') || stat.includes('REVIEW')) {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3B82F6' } }; // Blue
              } else if (stat.includes('LATE') || stat.includes('OVERDUE')) {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEF4444' } }; // Red
              } else {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF6B7280' } }; // Gray (To Do/Hold/Cancel)
              }
              cell.alignment = { horizontal: 'center', vertical: 'middle' };
            }
        });
    });
  });

  // Dynamic Vertical Merge for Project Name (Column A)
  const endRow = currentRow - 1;
  if (endRow >= dataStartRow) {
    sheet.mergeCells(`A${dataStartRow}:A${endRow}`);
    const projectCell = sheet.getCell(`A${dataStartRow}`);
    projectCell.value = project.project_name || project.name || 'UNTITLED PROJECT';
    projectCell.alignment = { vertical: 'middle', horizontal: 'center' };
  }

  // 6. GENERATE & DOWNLOAD
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  // Format filename: OM_DEDY_Timeline_PROJECT_NAME.xlsx
  const projectName = project.project_name || project.name || 'Export';
  const safeProjectName = projectName.toString().replace(/[^a-zA-Z0-9]/g, '_');
  saveAs(blob, `OM_DEDY_Timeline_${safeProjectName}.xlsx`);
};
