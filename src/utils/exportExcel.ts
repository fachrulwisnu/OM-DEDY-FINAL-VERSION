import * as XLSX from 'xlsx-js-style';
import { format } from 'date-fns';

/**
 * Enhanced export utility for Om Dedy Dashboard
 * Generates an EXACT layout using AOA and xlsx-js-style
 */
export const exportToExcel = (project: any, hierarchicalPhases: any[]) => {
  if (!project || !hierarchicalPhases) {
    console.error("Export failed: Missing project or phases data");
    return;
  }

  // 1. New Clean Date Formatter Utility
  const formatDate = (dateStr: any) => {
    if (!dateStr || dateStr === '-') return '-';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr; // Return as-is if already formatted
      
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    } catch (e) {
      return dateStr;
    }
  };

  // 2. Man Days Formatter (9 Hours = 1 Day Rule)
  const formatManDays = (totalHours: number) => {
    if (!totalHours) return '0 Days, 0 Hours, 0 Mins';
    const days = Math.floor(totalHours / 9); 
    const hours = Math.floor(totalHours % 9);
    const mins = Math.round((totalHours % 1) * 60);
    return `${days} Days, ${hours} Hours, ${mins} Mins`;
  };

  let fsdHours = 0, devHours = 0, sitHours = 0;
  const phasesList = hierarchicalPhases || [];

  // Calculate True Total Hours from L2 Tasks Only
  phasesList.forEach((phase) => {
    const phaseName = (phase.title || phase.name || '').toUpperCase();
    const tasks = phase.children || phase.tasks || [];
    
    tasks.forEach((task: any) => {
      const hours = parseFloat(task.man_hours || task.hours) || 0;
      if (phaseName.includes('FSD')) fsdHours += hours;
      else if (phaseName.includes('DEV')) devHours += hours;
      else if (phaseName.includes('SIT')) sitHours += hours;
    });
  });

  const trueTotalHours = fsdHours + devHours + sitHours;

  // 3. Build Sheet Matrix (AOA) with Formatted Dates
  const aoa: any[][] = [
    [`OM DEDY - PROJECT TIMELINE & BREAKDOWN REPORT`], // Row 1 (Index 0)
    [], // Row 2 (Index 1)
    [`Project Name`, project.project_name || project.name || '-', ``, `Global Status`, project.status || 'TODO'], // Row 3
    [`Start Date`, formatDate(project.start_date), ``, `Total Man Hours`, `${trueTotalHours} Hours`], // Row 4 (FORMATTED)
    [`End Date`, formatDate(project.end_date), ``, `PIC`, project.pic_name || project.pic || '-'], // Row 5 (FORMATTED)
    [], // Row 6
    [`Total Man days FSD:`, formatManDays(fsdHours)], // Row 7
    [`Total Man days DEV:`, formatManDays(devHours)], // Row 8
    [`Total Man days SIT:`, formatManDays(sitHours)], // Row 9
    [], // Row 10
    [ // Row 11 (Index 10): MAIN TABLE HEADERS
      "Project Name", "Phase L1", "Task", "Type Task", "Components", 
      "Detail Breakdown", "Man Hours", "Man Hours (In Minutes)", 
      "Start Date", "End Date", "Status", "Fachrul Feedback", "Barra Feedback"
    ]
  ];

  const merges: any[] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 12 } } // Merge Title Bar
  ];

  let currentRow = 11; 

  phasesList.forEach((phase) => {
    const tasks = phase.children && phase.children.length > 0 ? phase.children : [{}];
    const taskCount = tasks.length;
    const startRow = currentRow; 

    tasks.forEach((task: any) => {
      const hours = parseFloat(task.man_hours || task.hours) || 0;
      const mins = hours * 60;

      aoa.push([
        project.project_name || project.name || '-',
        phase.title || phase.name || '-',
        task.title || task.name || '-',
        task.task_type || task.type || '-',
        (Array.isArray(task.components) ? task.components.join(', ') : task.components) || '-',
        task.detail_task || task.detail || '-',
        hours ? `${hours} h` : '-',
        mins ? `${mins} m` : '-',
        formatDate(task.start_time || task.start_date), // Row Data Start Date (FORMATTED)
        formatDate(task.end_time || task.end_date),   // Row Data End Date (FORMATTED)
        task.status || 'TODO',
        task.suggestion_fachrul || task.fachrul_feedback || '-',
        task.suggestion_barra || task.barra_feedback || '-'
      ]);
      currentRow++;
    });

    if (taskCount > 1) {
      merges.push({ s: { r: startRow, c: 1 }, e: { r: startRow + taskCount - 1, c: 1 } }); // Merge Phase L1
      merges.push({ s: { r: startRow, c: 0 }, e: { r: startRow + taskCount - 1, c: 0 } }); // Merge Project Name
    }
  });

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws['!merges'] = merges;

  // Set Column Widths
  ws['!cols'] = [
    { wch: 25 }, { wch: 15 }, { wch: 45 }, { wch: 15 }, { wch: 25 }, 
    { wch: 65 }, { wch: 12 }, { wch: 22 }, { wch: 15 }, { wch: 15 }, 
    { wch: 15 }, { wch: 35 }, { wch: 35 }
  ];

  // Define Reuseable Borders
  const borderDef = {
    top: { style: "thin", color: { rgb: "D9D9D9" } },
    bottom: { style: "thin", color: { rgb: "D9D9D9" } },
    left: { style: "thin", color: { rgb: "D9D9D9" } },
    right: { style: "thin", color: { rgb: "D9D9D9" } }
  };

  // 3. APPLY PREMIUM RENDERING STYLES DYNAMICALLY
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellRef = XLSX.utils.encode_cell({ c: C, r: R });
      if (!ws[cellRef]) continue;

      if (R === 0) { // Main Title
        ws[cellRef].s = {
          fill: { fgColor: { rgb: "1F4E78" } },
          font: { name: "Arial", sz: 14, bold: true, color: { rgb: "FFFFFF" } },
          alignment: { horizontal: "center", vertical: "center" }
        };
      } else if ((R >= 2 && R <= 4) || (R >= 6 && R <= 8)) { // Metadata
        ws[cellRef].s = {
          font: { name: "Arial", sz: 10, bold: C === 0 || C === 3 || C === 6 },
          alignment: { vertical: "center" },
          border: (R === 4 || R === 8) ? { bottom: { style: "thin", color: { rgb: "D9D9D9" } } } : undefined
        };
      } else if (R === 10) { // Table Headers
        ws[cellRef].s = {
          fill: { fgColor: { rgb: "2F5597" } },
          font: { name: "Arial", sz: 11, bold: true, color: { rgb: "FFFFFF" } },
          alignment: { horizontal: "center", vertical: "center", wrapText: true },
          border: borderDef
        };
      } else if (R >= 11) { // Data Rows
        if (C === 1 || C === 0) { // Center alignment for Project Name & Phase L1
          ws[cellRef].s = {
            fill: C === 1 ? { fgColor: { rgb: "F2F2F5" } } : undefined,
            font: { name: "Arial", sz: 10, bold: C === 1 },
            alignment: { horizontal: "center", vertical: "center", wrapText: true },
            border: borderDef
          };
        } else if (C === 8 || C === 9 || C === 10) { // Center alignment for Dates & Status columns
          ws[cellRef].s = {
            font: { name: "Arial", sz: 10 },
            alignment: { horizontal: "center", vertical: "top", wrapText: true },
            border: borderDef
          };
        } else { // Top-left alignment for Text-heavy columns
          ws[cellRef].s = {
            font: { name: "Arial", sz: 10 },
            alignment: { vertical: "top", wrapText: true },
            border: borderDef
          };
        }
      }
    }
  }

  // Build and Trigger Download
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Timeline & Breakdown");
  XLSX.writeFile(wb, `OM_DEDY_Timeline_${project.project_name || project.name || 'Project'}.xlsx`);
};

